import { config as loadDotenv } from "dotenv";
loadDotenv({ path: ".env.local" });
loadDotenv();

import axios from "axios";
import { createReadStream, existsSync, statSync } from "node:fs";
import FormData from "form-data";
import { scrapeUrl } from "../scraper/web-scraper.js";
import { generateScriptFromArticle } from "../generator/ai-script.js";
import { runPipeline } from "../pipeline.js";
import { loadConfig, normalizeTheme } from "../config.js";
import { log } from "../utils/logger.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_REPO = process.env.GITHUB_REPO || "hien23ns/autogen-video";

if (!BOT_TOKEN) {
  console.error("❌ Lỗi: TELEGRAM_BOT_TOKEN chưa được cấu hình trong .env.local hoặc biến môi trường!");
  console.error("Vui lòng lấy token từ @BotFather trên Telegram và thêm vào .env.local: TELEGRAM_BOT_TOKEN=xxx");
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId: number | string, text: string, parseMode: "Markdown" | "HTML" = "Markdown"): Promise<void> {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    });
  } catch (err: any) {
    log.error(`Không thể gửi tin nhắn Telegram tới ${chatId}:`, err.response?.data || err.message);
  }
}

async function sendVideo(chatId: number | string, videoPath: string, caption: string): Promise<void> {
  try {
    const form = new FormData();
    form.append("chat_id", String(chatId));
    form.append("video", createReadStream(videoPath));
    form.append("caption", caption);
    form.append("supports_streaming", "true");

    await axios.post(`${TELEGRAM_API}/sendVideo`, form, {
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

/**
 * Triggers GitHub Actions workflow via repository_dispatch API
 */
async function triggerGitHubAction(url: string, chatId: number | string, theme = "cyberpunk"): Promise<boolean> {
  if (!GITHUB_PAT) return false;
  try {
    log.info(`Gửi dispatch request tới GitHub Repo: ${GITHUB_REPO}...`);
    await axios.post(
      `https://api.github.com/repos/${GITHUB_REPO}/dispatches`,
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
          Authorization: `Bearer ${GITHUB_PAT}`,
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

async function handleGenerateVideo(chatId: number | string, url: string, themeStr?: string): Promise<void> {
  const theme = themeStr ? normalizeTheme(themeStr) : "cyberpunk";

  // Option 1: Trigger GitHub Actions runner nếu có GITHUB_PAT
  if (GITHUB_PAT) {
    await sendMessage(
      chatId,
      `🚀 *Đã nhận lệnh tạo video 24/7!*\n\n🔗 *Nguồn:* \`${url}\`\n🎨 *Theme:* \`${theme}\`\n\n⚙️ Đang kích hoạt *GitHub Actions Cloud Runner* để render tự động. Video sẽ được gửi trực tiếp về đây sau khoảng 2 - 3 phút!`
    );
    const ok = await triggerGitHubAction(url, chatId, theme);
    if (ok) return;
    await sendMessage(chatId, "⚠️ Không thể kết nối tới GitHub Actions Cloud, bot sẽ tự chuyển sang chế độ render trực tiếp trên máy chủ...");
  }

  // Option 2: Render trực tiếp cục bộ
  await sendMessage(
    chatId,
    `🎬 *Bắt đầu quy trình tạo video tự động (9:16 Vertical)*\n\n🔗 *URL:* \`${url}\`\n🎨 *Theme:* \`${theme}\`\n⏳ Vui lòng đợi trong giây lát...`
  );

  const cfg = loadConfig();
  try {
    // 1. Scrape
    await sendMessage(chatId, "🔍 *[1/4]* Đang cào dữ liệu và phân tích bài viết / repo...");
    const article = await scrapeUrl(url);

    // 2. AI Script
    await sendMessage(chatId, "🧠 *[2/4]* Đang khởi tạo kịch bản 3-Giây Hook bùng nổ bằng Gemini Flash AI...");
    const scriptData = await generateScriptFromArticle(article, {
      geminiApiKey: cfg.geminiApiKey,
      provider: cfg.ttsProvider,
      voiceId: cfg.edgeTtsVoice,
      channelName: cfg.tiktok.displayName,
    });

    // 3. Render
    await sendMessage(chatId, "🎙️ *[3/4]* Đang tổng hợp giọng đọc, phụ đề Kinetic & render video...");
    const result = await runPipeline({
      scriptData,
      theme,
    });

    if (!existsSync(result.videoPath) || statSync(result.videoPath).size < 1000) {
      throw new Error("File video không tồn tại hoặc kích thước không hợp lệ.");
    }

    // 4. Send Video
    await sendMessage(chatId, "📤 *[4/4]* Render thành công! Đang tải video lên Telegram...");
    const caption = `🎬 *${article.title}*\n\n🔗 Nguồn: ${url}\n✨ Kênh: ${cfg.tiktok.displayName} (${cfg.tiktok.handle})\n⚡ Render tự động 24/7 hoàn tất!`;
    await sendVideo(chatId, result.videoPath, caption);
  } catch (err: any) {
    log.error("Lỗi khi xử lý tạo video qua Telegram bot:", err);
    await sendMessage(chatId, `❌ *Rất tiếc! Đã xảy ra lỗi trong quá trình tạo video:*\n\`${err.message}\``);
  }
}

async function startBot() {
  log.info("🤖 Bot Telegram tạo video tự động đang khởi động...");
  let offset = 0;

  // Lấy thông tin bot
  try {
    const me = await axios.get(`${TELEGRAM_API}/getMe`);
    log.info(`✅ Kết nối Telegram Bot thành công: @${me.data.result.username} (${me.data.result.first_name})`);
    console.log(`\n========================================================`);
    console.log(`🤖 TELEGRAM BOT SẴN SÀNG NHẬN LỆNH: @${me.data.result.username}`);
    console.log(`   Dán bất kỳ link bài báo hoặc link GitHub vào bot để tạo video!`);
    console.log(`========================================================\n`);
  } catch (err: any) {
    log.error("Không thể kết nối Telegram Bot. Kiểm tra TELEGRAM_BOT_TOKEN trong .env.local", err.message);
    process.exit(1);
  }

  // Polling loop
  while (true) {
    try {
      const res = await axios.get(`${TELEGRAM_API}/getUpdates`, {
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
            `🤖 *Cách tạo video siêu nhanh:*\n` +
            `1️⃣ Chỉ cần *gửi trực tiếp link GitHub* hoặc *link bài viết tin tức* vào đây.\n` +
            `2️⃣ Hoặc gõ lệnh: \`/video <link> [dark|light|cyberpunk]\`\n\n` +
            `Ví dụ:\n` +
            `• \`https://github.com/facebook/react\`\n` +
            `• \`/video https://github.com/facebook/react cyberpunk\`\n\n` +
            `⚡ Video sẽ được tự động biên kịch, đọc voice, tạo phụ đề động và gửi lại file MP4 ngay tại đây!`
          );
          continue;
        }

        let targetUrl = "";
        let selectedTheme = "cyberpunk";

        if (text.startsWith("/video")) {
          const parts = text.split(/\s+/).slice(1);
          if (parts.length > 0 && parts[0].startsWith("http")) {
            targetUrl = parts[0];
            if (parts[1]) selectedTheme = parts[1];
          }
        } else if (text.startsWith("http://") || text.startsWith("https://")) {
          targetUrl = text;
        }

        if (targetUrl) {
          // Bắt đầu tạo video
          handleGenerateVideo(chatId, targetUrl, selectedTheme).catch((e) => {
            log.error("Lỗi unhandled trong handleGenerateVideo:", e);
          });
        } else {
          await sendMessage(
            chatId,
            `💡 Vui lòng gửi một đường link bài viết hoặc link GitHub hợp lệ (bắt đầu bằng \`https://\`) để tạo video!`
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

startBot();
