#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });
config(); // load .env if present

import { parseArgs } from "node:util";
import { runPipeline } from "./pipeline.js";
import { scrapeUrl } from "./scraper/web-scraper.js";
import { generateScriptFromArticle } from "./generator/ai-script.js";
import { loadConfig, normalizeTheme } from "./config.js";
import { log } from "./utils/logger.js";

function printHelp(): void {
  console.log(`
🎬 Auto Video Generator — CLI v2.5 (3-Tier 9:16 Vertical Video)

CÁCH DÙNG:
  npm run pipeline -- [options] [path/to/script.json]

TUỲ CHỌN:
  --url <link>         Link bài viết tin tức hoặc link GitHub repo đầu vào
  --output <path>      Đường dẫn lưu file video MP4 kết quả (vd: output/video.mp4)
  --theme <theme>      Theme màu sắc: dark | light | cyberpunk (mặc định: dark)
  --script <path>      Đường dẫn file script.json có sẵn (bỏ qua bước scrape & AI)
  --voice <id>         Mã giọng đọc TTS (nếu muốn ghi đè cấu hình)
  -h, --help           Hiển thị trợ giúp này

VÍ DỤ:
  # 1. Tạo video tự động từ link bài báo / GitHub repo:
  npm run pipeline -- --url https://github.com/facebook/react --theme cyberpunk

  # 2. Tạo video với file xuất tuỳ chỉnh:
  npm run pipeline -- --url https://vnexpress.net/... --output my-video.mp4 --theme light

  # 3. Chạy từ file kịch bản có sẵn:
  npm run pipeline -- tests/fixtures/sample-script-with-image.json --theme dark
`);
}

async function main() {
  const options = {
    url: { type: "string" as const },
    output: { type: "string" as const },
    theme: { type: "string" as const },
    script: { type: "string" as const },
    voice: { type: "string" as const },
    help: { type: "boolean" as const, short: "h" },
  };

  let parsed;
  try {
    parsed = parseArgs({
      options,
      allowPositionals: true,
      args: process.argv.slice(2),
    });
  } catch (err: any) {
    console.error(`Lỗi tham số: ${err.message}`);
    printHelp();
    process.exit(2);
  }

  const { values, positionals } = parsed;

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  const url = values.url;
  const scriptArg = values.script || positionals[0];
  const outputVideoPath = values.output;
  const theme = values.theme ? normalizeTheme(values.theme) : undefined;

  if (!url && !scriptArg) {
    console.error("Lỗi: Bạn cần truyền --url <link> hoặc đường dẫn file script.json!");
    printHelp();
    process.exit(2);
  }

  const cfg = loadConfig();

  try {
    console.log("\n========================================================");
    console.log("🚀 KHỞI ĐỘNG PIPELINE TẠO VIDEO TỰ ĐỘNG (9:16 VERTICAL)");
    console.log("========================================================\n");

    let scriptData;

    if (url) {
      // BƯỚC 1: Scrape
      log.step(1, 5, `Scrape nội dung từ URL: ${url}`);
      const article = await scrapeUrl(url);
      log.info(`  Tiêu đề: ${article.title}`);
      log.info(`  Domain:  ${article.domain}`);
      if (article.ogImage) log.info(`  Ảnh og:image: ${article.ogImage}`);

      // BƯỚC 2: Generate Script
      log.step(2, 5, "Tạo kịch bản tiếng Việt chuẩn TTS (Gemini AI / Heuristic)");
      scriptData = await generateScriptFromArticle(article, {
        geminiApiKey: cfg.geminiApiKey,
        provider: cfg.ttsProvider,
        voiceId: values.voice || cfg.edgeTtsVoice,
        channelName: cfg.tiktok.displayName,
      });
      log.info(`  Đã tạo kịch bản gồm ${scriptData.scenes.length} cảnh.`);

      // BƯỚC 3, 4, 5: Chạy Pipeline tổng hợp (TTS -> Render -> Save)
      log.step(3, 5, `Tạo audio giọng đọc (TTS: ${cfg.ttsProvider}) & tính toán Karaoke Timestamps`);
      log.step(4, 5, `Render video 9:16 bằng HyperFrames (Theme: ${theme || cfg.videoTheme})`);
      const result = await runPipeline({
        scriptData,
        outputVideoPath,
        theme,
      });

      log.step(5, 5, `Lưu và hoàn tất video: ${result.videoPath}`);
      console.log("\n✨ HOÀN TẤT THÀNH CÔNG ✨\n");
    } else {
      // Chạy trực tiếp từ file script.json
      log.step(1, 4, `Nạp file kịch bản: ${scriptArg}`);
      log.step(2, 4, `Tạo audio giọng đọc (TTS: ${cfg.ttsProvider}) & Karaoke Timestamps`);
      log.step(3, 4, `Render video 9:16 bằng HyperFrames (Theme: ${theme || cfg.videoTheme})`);
      const result = await runPipeline({
        scriptPath: scriptArg,
        outputVideoPath,
        theme,
      });
      log.step(4, 4, `Lưu và hoàn tất video: ${result.videoPath}`);
      console.log("\n✨ HOÀN TẤT THÀNH CÔNG ✨\n");
    }
  } catch (e: any) {
    log.error("Pipeline thất bại", e);
    process.exit(1);
  }
}

main();
