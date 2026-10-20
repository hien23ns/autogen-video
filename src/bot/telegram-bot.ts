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

export const BOT_COMMANDS = [
  { command: "start", description: "Bắt đầu & mở bảng điều khiển Studio" },
  { command: "test", description: "Nhận ngay 1 video mẫu MP4 kiểm tra đường truyền" },
  { command: "video", description: "Tạo video tin tức: /video <link> [theme] [ratio]" },
  { command: "repo", description: "Biến GitHub repo thành video: /repo <link>" },
  { command: "edit", description: "AI Ghost Editor: cắt lỗi video quay thô sang 9:16" },
  { command: "captions", description: "5 phong cách phụ đề Karaoke triệu view" },
  { command: "themes", description: "Xem 6 theme đồ họa (Cyberpunk, Matrix, Sunset...)" },
  { command: "styles", description: "Xem 6 style hình ảnh (Tech, Minimal, Luxury...)" },
  { command: "qa", description: "Kiểm tra chất lượng video & âm lượng -14 LUFS" },
  { command: "publish", description: "Xem bộ đóng gói xuất bản đa nền tảng (publish/)" },
  { command: "doctor", description: "Kiểm tra sức khỏe hệ thống (Node, FFmpeg, TTS)" },
  { command: "help", description: "Hướng dẫn chi tiết & cú pháp tạo video viral" },
];

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

export async function registerBotCommands(): Promise<void> {
  const api = getTelegramApiUrl();
  try {
    await axios.post(`${api}/setMyCommands`, {
      commands: BOT_COMMANDS,
    });
    log.info(`✔ Đã đăng ký thành công ${BOT_COMMANDS.length} gợi ý lệnh slash với Telegram.`);
  } catch (err: any) {
    log.warn(`Không thể đăng ký setMyCommands: ${err.response?.data?.description || err.message}`);
  }
}

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

    // 1. Clear any previous webhook to ensure getUpdates (long polling) works without 409 Conflict
    try {
      await axios.post(`${api}/deleteWebhook?drop_pending_updates=false`);
      log.info("✔ Đã chuyển sang chế độ Polling (nhận lệnh trực tiếp từ Telegram)");
    } catch {}

    // 2. Register slash command suggestions with Telegram
    await registerBotCommands();

    console.log(`\n========================================================`);
    console.log(`🤖 TELEGRAM BOT SẴN SÀNG NHẬN LỆNH: @${me.data.result.username}`);
    console.log(`   Đã đăng ký ${BOT_COMMANDS.length} lệnh gợi ý tự động khi gõ /`);
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
        const lower = text.toLowerCase();

        // 1. /start & /help
        if (lower === "/start" || lower === "/help") {
          await sendMessage(
            chatId,
            `👋 *Chào mừng bạn đến với Studio AI Auto Video Gen!* 🎬\n\n` +
            `Hệ thống sở hữu toàn bộ 8 Kỹ Năng (Skills) làm video triệu view. Hãy gõ dấu \`/\` vào ô chat để xem gợi ý:\n\n` +
            `⚡ *CÁC LỆNH NHANH:*\n` +
            `• */test* : Nhận ngay 1 video mẫu MP4 kiểm tra máy bạn\n` +
            `• */video <link>* : Tạo video 9:16 từ bài báo / link web\n` +
            `• */repo <link>* : Biến GitHub repo thành video giới thiệu code\n` +
            `• */edit* : Hướng dẫn AI Ghost Editor cắt video quay thật\n` +
            `• */captions* : Xem 5 style phụ đề Karaoke triệu view\n` +
            `• */themes* : 6 theme đồ họa (Cyberpunk, Matrix, Sunset...)\n` +
            `• */styles* : 6 visual style (Tech, Minimal, Luxury...)\n` +
            `• */qa* : Tiêu chuẩn kiểm duyệt video & âm thanh -14 LUFS\n` +
            `• */publish* : Xem bộ xuất bản TikTok/Shorts/Reels\n` +
            `• */doctor* : Kiểm tra sức khỏe hệ thống\n\n` +
            `👉 *Cách dùng nhanh nhất:* Bạn chỉ cần dán thẳng bất kỳ link bài báo hoặc GitHub repo vào đây!`
          );
          continue;
        }

        // 2. /test
        if (lower === "/test") {
          await sendMessage(chatId, "🧪 *Đang gửi video mẫu thử nghiệm tới bạn để kiểm tra tính năng nhận video...*");
          const sampleDir = join(process.cwd(), "output", "secmon-he-thong-giam-sat-va-phan-ung-su-20261019-2310");
          const sampleVideo = join(sampleDir, "video.mp4");

          if (existsSync(sampleVideo)) {
            const caption =
              "✅ *Video mẫu thử nghiệm nhận từ Bot thành công!*\n\n" +
              "🎬 Độ phân giải: 1080x1920 (9:16 Vertical 60fps)\n" +
              "🔊 Âm thanh: -14.0 LUFS EBU R128 + BGM Ducking\n" +
              "💬 Phụ đề: Kinetic Word-Level Karaoke\n" +
              "✨ Kênh: Code Suy 24h 🔱\n\n" +
              "👉 Đường truyền hoàn hảo! Giờ bạn hãy gửi link bài báo hoặc GitHub repo bất kỳ để tạo video mới.";
            await sendVideo(chatId, sampleVideo, caption);
          } else {
            await sendMessage(chatId, "⚠️ Chưa có sẵn file video mẫu trong output. Hãy gửi một link URL để render video đầu tiên!");
          }
          continue;
        }

        // 3. /video
        if (lower.startsWith("/video")) {
          const rawArgs = text.slice(6).trim();
          const { url, theme, style, ratio } = parseUserPrompt(rawArgs);
          if (url) {
            handleGenerateVideo(chatId, url, theme, style, ratio).catch((e) => {
              log.error("Lỗi trong handleGenerateVideo:", e);
            });
          } else {
            await sendMessage(
              chatId,
              `📹 *CÚ PHÁP TẠO VIDEO TỪ BÀI BÁO:*\n\n` +
              `\` /video <link> [theme] [style] [ratio] \`\n\n` +
              `*Ví dụ:*\n` +
              `• \`/video https://vnexpress.net/so-hoa\`\n` +
              `• \`/video https://vnexpress.net/... sunset\`\n` +
              `• \`/video https://vnexpress.net/... 16:9 tech\`\n\n` +
              `💡 Bạn cũng có thể dán link trực tiếp mà không cần gõ chữ \`/video\`.`
            );
          }
          continue;
        }

        // 4. /repo
        if (lower.startsWith("/repo")) {
          const rawArgs = text.slice(5).trim();
          const { url } = parseUserPrompt(rawArgs);
          if (url) {
            handleGenerateVideo(chatId, url, "cyberpunk", "tech").catch((e) => {
              log.error("Lỗi trong handleGenerateVideo:", e);
            });
          } else {
            await sendMessage(
              chatId,
              `⭐ *SKILL: GITHUB REPO TO VIDEO:*\n\n` +
              `Biến repo GitHub thành video giới thiệu công nghệ với hiệu ứng gõ code, số sao ⭐ và mô tả tính năng.\n\n` +
              `*Cú pháp:*\n` +
              `\` /repo https://github.com/facebook/react \`\n\n` +
              `Hoặc dán thẳng link GitHub vào ô chat!`
            );
          }
          continue;
        }

        // 5. /edit
        if (lower.startsWith("/edit")) {
          await sendMessage(
            chatId,
            `✂️ *SKILL: AI GHOST VIDEO EDITOR:*\n\n` +
            `Biến video quay thô của bạn (nói lắp, ngập ngừng, quay đi quay lại) thành video ngắn 9:16 dứt khoát:\n` +
            `• Tự động phát hiện & cắt sạch khoảng lặng chết\n` +
            `• Loại bỏ các từ đệm "ừm/ờ/à/thì/là"\n` +
            `• Nhận diện nhiều lần quay hỏng và **chỉ giữ lại take tốt nhất**\n` +
            `• Reframe 9:16 + Punch-in zoom đổi cỡ cảnh sinh động\n` +
            `• Chuẩn hóa âm thanh -14 LUFS\n\n` +
            `💻 *Chạy trên máy tính:*\n` +
            `\`npm run edit-raw -- input.mp4 --reframe 9:16 --compare\``
          );
          continue;
        }

        // 6. /captions
        if (lower === "/captions") {
          await sendMessage(
            chatId,
            `💬 *SKILL: 5 PHONG CÁCH PHỤ ĐỀ VIRAL:*\n\n` +
            `1️⃣ *\`karaoke-highlight\`*: Từ đang nói sáng rực màu neon kèm sóng nhạc (Mặc định).\n` +
            `2️⃣ *\`pop-in\`*: Từng từ nảy bật (scale 1.25x -> 1.0x) dồn dập theo nhịp phát âm.\n` +
            `3️⃣ *\`box-highlight\`*: Đóng hộp màu tương phản cao (vàng chữ đen / xanh neon).\n` +
            `4️⃣ *\`hand-drawn-underline\`*: Gạch chân vẽ tay sinh động dưới từ khóa quan trọng.\n` +
            `5️⃣ *\`minimal\`*: Chữ trắng đổ bóng nhẹ, không nền, tập trung vào hình ảnh.\n\n` +
            `✨ Mọi phụ đề đều tự động định vị trong **Safe Zone**, không bị che bởi nút Like/Share của TikTok!`
          );
          continue;
        }

        // 7. /themes
        if (lower === "/themes") {
          let themesMsg = `🎨 *DANH SÁCH 6 GIAO DIỆN (THEMES) ĐỈNH CAO:*\n\n`;
          for (const [key, t] of Object.entries(THEME_DESCRIPTIONS)) {
            themesMsg += `${t.icon} *\`${key}\`* (*${t.name}*)\n   └ ${t.desc}\n\n`;
          }
          themesMsg += `💡 *Cách dùng*: Gửi link kèm tên theme, ví dụ: \`https://github.com/facebook/react matrix\``;
          await sendMessage(chatId, themesMsg);
          continue;
        }

        // 8. /styles
        if (lower === "/styles") {
          await sendMessage(
            chatId,
            `✨ *DANH SÁCH 6 PHONG CÁCH HÌNH ẢNH (--style):*\n\n` +
            `• *\`news\`*: Đỏ nổi bật, giật tít thời sự nóng hổi.\n` +
            `• *\`tech\`*: Xanh Cyan công nghệ, hiện đại, viền phát sáng.\n` +
            `• *\`minimal\`*: Tối giản thanh lịch, đơn sắc, chữ mảnh.\n` +
            `• *\`high-energy\`*: Vàng Neon rực rỡ, nhịp điệu nhanh, cuốn hút.\n` +
            `• *\`luxury\`*: Vàng kim hoàng gia sang trọng, nền đen huyền bí.\n` +
            `• *\`retro\`*: Tông hồng Cyber Synthwave thập niên 80 hoài niệm.\n\n` +
            `💡 Gửi link kèm style: \`https://github.com/... luxury\``
          );
          continue;
        }

        // 9. /qa
        if (lower === "/qa") {
          await sendMessage(
            chatId,
            `🔍 *SKILL: AUTOMATED VIDEO QA ANALYZER:*\n\n` +
            `Mọi video render đều trải qua vòng kiểm định nghiêm ngặt:\n` +
            `• **Độ phân giải & FPS:** 1080x1920 60fps chuẩn TikTok / Shorts\n` +
            `• **Mastering Loudness:** -14.0 LUFS EBU R128 (True Peak ≤ -1.0 dBTP)\n` +
            `• **Auto BGM Ducking:** Tự hạ nhạc nền -18dB khi có giọng đọc\n` +
            `• **Safe-Zone Check:** Trích 5 frame kiểm tra không tràn chữ và không che nút tương tác\n\n` +
            `💻 *Chạy kiểm tra thủ công:*\n` +
            `\`npm run qa:video -- output/<dir>/video.mp4\``
          );
          continue;
        }

        // 10. /publish
        if (lower === "/publish") {
          await sendMessage(
            chatId,
            `📦 *SKILL: MULTI-PLATFORM PUBLISH PACK:*\n\n` +
            `Sau khi render xong video, hệ thống tự động sinh thư mục \`publish/\` gồm:\n` +
            `• **social-copy.md:** Tiêu đề, hook, hashtag riêng biệt cho TikTok, YouTube Shorts, Instagram Reels.\n` +
            `• **cover-9x16.jpg:** Ảnh bìa 9:16 sắc nét trích từ frame đẹp nhất.\n` +
            `• **cover-16x9.jpg:** Ảnh bìa ngang 16:9 cho YouTube/Facebook.\n` +
            `• **checklist.md:** Danh sách kiểm tra chất lượng trước khi bấm đăng.\n` +
            `• **Gợi ý khung giờ vàng:** 11:30 - 13:00 và 19:30 - 21:30.`
          );
          continue;
        }

        // 11. /doctor
        if (lower === "/doctor" || lower === "/status") {
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

        // 12. Direct URL handling
        const { url, theme, style, ratio } = parseUserPrompt(text);

        if (url) {
          handleGenerateVideo(chatId, url, theme, style, ratio).catch((e) => {
            log.error("Lỗi unhandled trong handleGenerateVideo:", e);
          });
        } else {
          await sendMessage(
            chatId,
            `💡 Vui lòng gửi một đường link bài viết hoặc link GitHub hợp lệ (bắt đầu bằng \`https://\`) để tạo video!\n\n` +
            `Hoặc gõ dấu \`/\` để xem danh sách gợi ý toàn bộ kỹ năng có sẵn.`
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
