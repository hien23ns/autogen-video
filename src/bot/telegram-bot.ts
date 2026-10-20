import { config as loadDotenv } from "dotenv";
loadDotenv({ path: ".env.local" });
loadDotenv();

import axios from "axios";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import FormData from "form-data";
import { scrapeUrl } from "../scraper/web-scraper.js";
import { generateScriptFromArticle, detectBestTheme } from "../generator/ai-script.js";
import { runPipeline } from "../pipeline.js";
import { loadConfig, normalizeTheme, type VideoTheme } from "../config.js";
import { log } from "../utils/logger.js";
import type { AspectRatio } from "../render/html-composer.js";

export function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN chưa được cấu hình trong .env.local hoặc biến môi trường!\nVui lòng lấy token từ @BotFather trên Telegram và thêm vào .env.local: TELEGRAM_BOT_TOKEN=xxx"
    );
  }
  return token;
}

export function getTelegramApiUrl(): string {
  return `https://api.telegram.org/bot${getBotToken()}`;
}

export const THEME_DESCRIPTIONS: Record<VideoTheme, { name: string; icon: string; desc: string }> = {
  "cyberpunk": {
    name: "Cyberpunk",
    icon: "⚡",
    desc: "Vàng chanh Neon + Cyan + Hồng Magenta (Mặc định siêu cuốn hút)",
  },
  "matrix-code": {
    name: "Matrix Code",
    icon: "💻",
    desc: "Terminal Hacker Đen Tuyền + Matrix Green (Chuẩn Developer & Bảo mật)",
  },
  "sunset-vibes": {
    name: "Sunset Vibes",
    icon: "🌅",
    desc: "Synthwave Hoàng Hôn Tím + Cam Rực Rỡ + Vàng Ấm (Viral AI & UI/UX)",
  },
  "crimson-beast": {
    name: "Crimson Beast",
    icon: "🔥",
    desc: "Obsidian Đỏ Lửa + Vàng Kim Hoàng Gia (Tin sốc, Drama, Zero-Day)",
  },
  "dark-neon": {
    name: "Dark Neon",
    icon: "🌌",
    desc: "Xanh Đen Navy + Neon Blue + Tím Huyền Bí (Sang trọng, công nghệ)",
  },
  "light-pro": {
    name: "Light Pro",
    icon: "💼",
    desc: "Trắng Bạc Thanh Lịch (Tin tức doanh nghiệp, tài chính, báo chí)",
  },
};

export async function sendMessage(
  chatId: number | string,
  text: string,
  parseMode: "Markdown" | "HTML" = "Markdown"
): Promise<void> {
  try {
    const api = getTelegramApiUrl();
    await axios.post(`${api}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    });
  } catch (err: any) {
    log.error(`Không thể gửi tin nhắn Telegram tới ${chatId}:`, err.response?.data || err.message);
  }
}

export async function sendVideo(chatId: number | string, videoPath: string, caption: string): Promise<void> {
  try {
    const api = getTelegramApiUrl();
    const form = new FormData();
    form.append("chat_id", String(chatId));
    form.append("video", createReadStream(videoPath));
    form.append("caption", caption);
    form.append("supports_streaming", "true");

    await axios.post(`${api}/sendVideo`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 180000,
    });
    log.info(`Đã gửi video thành công tới Telegram chat ${chatId}`);
  } catch (err: any) {
    log.error(`Không thể gửi video tới Telegram ${chatId}:`, err.response?.data || err.message);
    throw err;
  }
}

export async function triggerGitHubAction(
  url: string,
  chatId: number | string,
  theme: VideoTheme = "cyberpunk"
): Promise<boolean> {
  const pat = process.env.GITHUB_PAT;
  const repo = process.env.GITHUB_REPO || "hien23ns/autogen-video";
  if (!pat) return false;

  try {
    log.info(`Gửi dispatch request tới GitHub Repo: ${repo} (Theme: ${theme})...`);
    await axios.post(
      `https://api.github.com/repos/${repo}/dispatches`,
      {
        event_type: "create_video",
        client_payload: {
          url,
          chat_id: String(chatId),
          theme,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    return true;
  } catch (err: any) {
    log.warn(`Trigger GitHub Action thất bại: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

export interface ParsedUserPrompt {
  url: string;
  theme?: VideoTheme;
  style?: "news" | "tech" | "minimal" | "high-energy" | "luxury" | "retro";
  ratio?: AspectRatio;
}

export function parseUserPrompt(text: string): ParsedUserPrompt {
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
  const url = urlMatch ? urlMatch[1].trim() : "";
  const remaining = text.replace(url, "").toLowerCase();

  let theme: VideoTheme | undefined = undefined;
  if (/matrix|hacker|green/i.test(remaining)) theme = "matrix-code";
  else if (/sunset|synthwave|purple/i.test(remaining)) theme = "sunset-vibes";
  else if (/crimson|red|fire/i.test(remaining)) theme = "crimson-beast";
  else if (/dark|navy/i.test(remaining)) theme = "dark-neon";
  else if (/light|white/i.test(remaining)) theme = "light-pro";
  else if (/cyber|cyberpunk/i.test(remaining)) theme = "cyberpunk";

  let style: "news" | "tech" | "minimal" | "high-energy" | "luxury" | "retro" | undefined = undefined;
  if (/\btech\b/i.test(remaining)) style = "tech";
  else if (/\bminimal\b/i.test(remaining)) style = "minimal";
  else if (/\bhigh-energy|energy\b/i.test(remaining)) style = "high-energy";
  else if (/\bluxury\b/i.test(remaining)) style = "luxury";
  else if (/\bretro\b/i.test(remaining)) style = "retro";
  else if (/\bnews\b/i.test(remaining)) style = "news";

  let ratio: AspectRatio | undefined = undefined;
  if (/\b16:9|youtube|landscape\b/i.test(remaining)) ratio = "16:9";
  else if (/\b1:1|square\b/i.test(remaining)) ratio = "1:1";
  else if (/\b4:5|portrait\b/i.test(remaining)) ratio = "4:5";
  else if (/\b9:16|tiktok|shorts|vertical\b/i.test(remaining)) ratio = "9:16";

  return { url, theme, style, ratio };
}

export async function handleGenerateVideo(
  chatId: number | string,
  url: string,
  explicitTheme?: VideoTheme,
  explicitStyle?: "news" | "tech" | "minimal" | "high-energy" | "luxury" | "retro",
  explicitRatio?: AspectRatio
): Promise<void> {
  await sendMessage(chatId, "🔍 *[1/4]* Đang cào dữ liệu và phân tích bài viết / repository...");

  let article;
  try {
    article = await scrapeUrl(url);
  } catch (err: any) {
    await sendMessage(chatId, `❌ Lỗi khi đọc nội dung từ URL: \`${err.message}\``);
    return;
  }

  const theme = explicitTheme || detectBestTheme(article);
  const info = THEME_DESCRIPTIONS[theme];

  if (!explicitTheme) {
    await sendMessage(
      chatId,
      `🎯 *AI tự động nhận diện nội dung & chọn theme phù hợp:*\n` +
      `└ Giao diện: ${info.icon} *${info.name}*\n` +
      `└ Lý do: _${info.desc}_`
    );
  }

  const pat = process.env.GITHUB_PAT;
  if (pat) {
    await sendMessage(
      chatId,
      `🚀 *Đã kích hoạt GitHub Actions Cloud Render 24/7!*\n\n` +
      `🔗 *Nguồn:* \`${url}\`\n` +
      `🎨 *Theme:* ${info.icon} \`${info.name}\`\n\n` +
      `⚙️ Máy ảo Ubuntu đang chạy ngầm trên Cloud để tạo giọng đọc, phụ đề Kinetic và mix nhạc nền. Video sẽ được gửi về đây sau khoảng 2 - 3 phút!`
    );
    const ok = await triggerGitHubAction(url, chatId, theme);
    if (ok) return;
    await sendMessage(chatId, "⚠️ Không thể kết nối tới GitHub Actions Cloud, bot sẽ tự chuyển sang chế độ render trực tiếp trên máy chủ...");
  }

  await sendMessage(
    chatId,
    `🎬 *Bắt đầu quy trình tạo video tự động (Studio v2.5)*\n\n` +
    `🔗 *URL:* \`${url}\`\n` +
    `🎨 *Theme:* ${info.icon} \`${info.name}\`\n` +
    (explicitStyle ? `✨ *Style:* \`${explicitStyle}\`\n` : "") +
    (explicitRatio ? `📐 *Tỉ lệ:* \`${explicitRatio}\`\n` : "") +
    `⏳ Vui lòng đợi trong giây lát...`
  );

  const cfg = loadConfig();
  try {
    await sendMessage(chatId, "🧠 *[2/4]* Đang khởi tạo kịch bản 3-Giây Hook bùng nổ bằng Gemini Flash AI...");
    const scriptData = await generateScriptFromArticle(article, {
      geminiApiKey: cfg.geminiApiKey,
      provider: cfg.ttsProvider,
      voiceId: cfg.edgeTtsVoice,
      channelName: cfg.tiktok.displayName,
    });

    if (explicitStyle && (scriptData as any).scenes) {
      (scriptData as any).scenes.forEach((s: any) => {
        if (s.templateData) s.templateData.style = explicitStyle;
      });
    }

    await sendMessage(
      chatId,
      `🎙️ *[3/4]* Đang đọc voice Edge-TTS, tạo phụ đề Kinetic Pop & mix nhạc nền BGM ducking với theme *${info.name}*...`
    );
    const result = await runPipeline({
      scriptData,
      theme,
    });

    if (!existsSync(result.videoPath) || statSync(result.videoPath).size < 1000) {
      throw new Error("File video không tồn tại hoặc kích thước không hợp lệ.");
    }

    await sendMessage(chatId, "📤 *[4/4]* Render hoàn tất! Đang tải video lên Telegram...");
    const caption =
      `🎬 *${article.title}*\n\n` +
      `🔗 *Nguồn:* ${url}\n` +
      `🎨 *Theme:* ${info.icon} ${info.name}\n` +
      `✨ *Kênh:* ${cfg.tiktok.displayName} (${cfg.tiktok.handle})\n` +
      `⚡ Render tự động 24/7 hoàn tất!`;
    await sendVideo(chatId, result.videoPath, caption);
  } catch (err: any) {
    log.error("Lỗi khi xử lý tạo video qua Telegram bot:", err);
    await sendMessage(chatId, `❌ *Rất tiếc! Đã xảy ra lỗi trong quá trình tạo video:*\n\`${err.message}\``);
  }
}

export async function startBot() {
  log.info("🤖 Bot Telegram tạo video tự động đang khởi động...");
  const api = getTelegramApiUrl();
  let offset = 0;

  try {
    const me = await axios.get(`${api}/getMe`);
    log.info(`✅ Kết nối Telegram Bot thành công: @${me.data.result.username} (${me.data.result.first_name})`);

    // Clear any previous webhook to ensure getUpdates (long polling) works without 409 Conflict
    try {
      await axios.post(`${api}/deleteWebhook?drop_pending_updates=false`);
      log.info("✔ Đã chuyển sang chế độ Polling (nhận lệnh trực tiếp từ Telegram)");
    } catch {}

    console.log(`\n========================================================`);
    console.log(`🤖 TELEGRAM BOT SẴN SÀNG NHẬN LỆNH: @${me.data.result.username}`);
    console.log(`   Hỗ trợ 6 theme: cyberpunk, matrix, sunset, crimson, dark, light`);
    console.log(`   Gửi /test để nhận video mẫu thử nghiệm`);
    console.log(`========================================================\n`);
  } catch (err: any) {
    log.error("Không thể kết nối Telegram Bot. Kiểm tra TELEGRAM_BOT_TOKEN trong .env.local", err);
    process.exit(1);
  }

  while (true) {
    try {
      const res = await axios.get(`${api}/getUpdates`, {
        params: { offset, timeout: 30 },
        timeout: 35000,
      });

      const updates = res.data.result || [];
      for (const update of updates) {
        offset = update.update_id + 1;
        const msg = update.message;
        if (!msg || !msg.text) continue;

        const chatId = msg.chat.id;
        const text = msg.text.trim();

        if (text === "/start" || text === "/help") {
          await sendMessage(
            chatId,
            `👋 *Xin chào ${msg.from?.first_name || "bạn"}!*\n\n` +
            `Chào mừng bạn đến với *Auto Video Generator Bot* của *${loadConfig().tiktok.displayName}* 🎬\n\n` +
            `🤖 *CÁCH TẠO & ĐIỀU KHIỂN VIDEO:*\n` +
            `1️⃣ *Cách 1 (Nhanh nhất)*: Dán link GitHub hoặc link bài báo vào đây kèm theme / style mong muốn:\n` +
            `   • \`https://github.com/facebook/react\` (Mặc định theme Cyberpunk)\n` +
            `   • \`https://github.com/hien23ns/Secmon matrix\` (Theme Matrix Green)\n` +
            `   • \`https://vnexpress.net/... sunset\` (Theme Synthwave Sunset)\n` +
            `   • \`https://github.com/... 16:9 tech\` (Tỉ lệ 16:9 phong cách tech)\n\n` +
            `2️⃣ *Thử nghiệm nhanh*: Gửi */test* để nhận ngay 1 video mẫu kiểm tra đường truyền!\n\n` +
            `🎨 *Gõ /themes* để xem danh sách 6 theme đồ họa\n` +
            `🩺 *Gõ /doctor* để kiểm tra sức khỏe hệ thống\n\n` +
            `⚡ Video sẽ được tự động biên kịch 3s Hook WOW, đọc voice dồn dập, tạo phụ đề động và gửi lại file MP4 ngay tại đây!`
          );
          continue;
        }

        if (text === "/test") {
          await sendMessage(chatId, "🧪 *Đang gửi video mẫu thử nghiệm tới bạn để kiểm tra tính năng nhận video...*");
          const sampleDir = join(process.cwd(), "output", "secmon-he-thong-giam-sat-va-phan-ung-su-20261019-2310");
          const sampleVideo = join(sampleDir, "video.mp4");

          if (existsSync(sampleVideo)) {
            const caption =
              "✅ *Video mẫu thử nghiệm nhận từ Bot thành công!*\n\n" +
              "🎬 Độ phân giải: 1080x1920 (9:16 Vertical)\n" +
              "🔊 Âm thanh: -14.0 LUFS EBU R128\n" +
              "💬 Phụ đề: Kinetic Karaoke Highlight\n" +
              "✨ Kênh: Code Suy 24h 🔱\n\n" +
              "👉 Bây giờ bạn có thể gửi bất kỳ link bài báo hoặc GitHub repo nào để tạo video mới!";
            await sendVideo(chatId, sampleVideo, caption);
          } else {
            await sendMessage(chatId, "⚠️ Chưa có sẵn file video mẫu trong output. Hãy gửi một link URL để render video đầu tiên!");
          }
          continue;
        }

        if (text === "/doctor" || text === "/status") {
          const cfg = loadConfig();
          const statusMsg =
            `🩺 *TRẠNG THÁI HỆ THỐNG AUTO VIDEO GEN:*\n\n` +
            `• *Node.js:* \`${process.version}\`\n` +
            `• *TTS Engine:* \`${cfg.ttsProvider}\` (Edge TTS miễn phí)\n` +
            `• *Giọng đọc:* \`${cfg.edgeTtsVoice}\`\n` +
            `• *Kênh:* \`${cfg.tiktok.displayName}\` (\`${cfg.tiktok.handle}\`)\n` +
            `• *Theme:* \`${cfg.videoTheme}\`\n` +
            `• *Trạng thái:* Sẵn sàng render và gửi video 24/7 🚀`;
          await sendMessage(chatId, statusMsg);
          continue;
        }

        if (text === "/themes") {
          let themesMsg = `🎨 *DANH SÁCH 6 GIAO DIỆN (THEMES) ĐỈNH CAO:*\n\n`;
          for (const [key, t] of Object.entries(THEME_DESCRIPTIONS)) {
            themesMsg += `${t.icon} *\`${key}\`* (*${t.name}*)\n   └ ${t.desc}\n\n`;
          }
          themesMsg += `💡 *Cách dùng*: Gửi link kèm tên theme, ví dụ: \`https://github.com/facebook/react matrix\``;
          await sendMessage(chatId, themesMsg);
          continue;
        }

        const { url, theme, style, ratio } = parseUserPrompt(text);

        if (url) {
          handleGenerateVideo(chatId, url, theme, style, ratio).catch((e) => {
            log.error("Lỗi unhandled trong handleGenerateVideo:", e);
          });
        } else {
          await sendMessage(
            chatId,
            `💡 Vui lòng gửi một đường link bài viết hoặc link GitHub hợp lệ (bắt đầu bằng \`https://\`) để tạo video!\n\n` +
            `Hoặc gõ */test* để nhận ngay video mẫu thử nghiệm.`
          );
        }
      }
    } catch (err: any) {
      if (err.code !== "ECONNABORTED") {
        log.warn(`Lỗi trong quá trình polling Telegram updates: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// Only auto-run if executed directly as main script
const isMain = Boolean(
  process.argv[1] &&
  (process.argv[1].endsWith("telegram-bot.ts") ||
    process.argv[1].endsWith("telegram-bot.js") ||
    process.argv[1].includes("telegram-bot"))
);

if (isMain) {
  try {
    getBotToken();
    startBot().catch((err) => {
      console.error("❌ Telegram Bot gặp lỗi khi chạy:", err.message);
      process.exit(1);
    });
  } catch (err: any) {
    console.error("❌ Lỗi cấu hình Telegram Bot:", err.message);
    process.exit(1);
  }
}
