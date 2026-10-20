#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";
import { parseArgs } from "node:util";
import pLimit from "p-limit";
import { scrapeUrl } from "../src/scraper/web-scraper.js";
import { generateScriptFromArticle } from "../src/generator/ai-script.js";
import { runPipeline } from "../src/pipeline.js";
import { loadConfig, normalizeTheme } from "../src/config.js";
import { log } from "../src/utils/logger.js";

interface BatchItemResult {
  url: string;
  status: "success" | "failed";
  attempts: number;
  durationMs: number;
  videoPath?: string;
  error?: string;
}

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      concurrency: { type: "string" },
      retries: { type: "string", default: "2" },
      theme: { type: "string" },
      style: { type: "string" },
      preset: { type: "string", default: "draft" },
      ratio: { type: "string", default: "9:16" },
      outDir: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
    args: process.argv.slice(2),
  });

  const fileInput = positionals[0];

  if (!fileInput || values.help) {
    console.log(`
📦 Auto Video Gen — Batch Runner (Tạo video hàng loạt)

CÁCH DÙNG:
  npm run batch -- <urls.txt> [options]

TUỲ CHỌN:
  --concurrency <N>   Số video render đồng thời (mặc định: auto theo CPU)
  --retries <N>       Số lần thử lại nếu URL bị lỗi (mặc định: 2)
  --preset <preset>   draft (30fps nhanh) | final (60fps đẹp) [mặc định: draft]
  --ratio <ratio>     9:16 | 16:9 | 1:1 | 4:5 [mặc định: 9:16]
  --theme <theme>     dark | light | cyberpunk
  --style <style>     news | tech | minimal | high-energy | luxury | retro
  -h, --help          Hiển thị trợ giúp này

VÍ DỤ:
  npm run batch -- urls.txt --concurrency 2 --preset draft
`);
    process.exit(fileInput ? 0 : 2);
  }

  if (!existsSync(fileInput)) {
    console.error(`❌ Không tìm thấy file đầu vào: ${fileInput}`);
    process.exit(1);
  }

  const rawContent = await readFile(fileInput, "utf8");
  const urls = rawContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  if (urls.length === 0) {
    console.error(`❌ File ${fileInput} không có URL hợp lệ nào.`);
    process.exit(1);
  }

  const defaultConcurrency = Math.max(1, Math.min(os.cpus().length - 1, 3));
  const concurrency = values.concurrency ? parseInt(values.concurrency, 10) : defaultConcurrency;
  const maxRetries = parseInt(values.retries || "2", 10);
  const cfg = loadConfig();
  const theme = values.theme ? normalizeTheme(values.theme) : cfg.videoTheme;

  console.log(`\n========================================================`);
  console.log(`🚀 BẮT ĐẦU BATCH RENDER: ${urls.length} URLs`);
  console.log(`⚡ Giới hạn luồng (Concurrency): ${concurrency} (CPU cores: ${os.cpus().length})`);
  console.log(`🔄 Tự động Retry: tối đa ${maxRetries} lần`);
  console.log(`🎨 Theme: ${theme} | Preset: ${values.preset} | Ratio: ${values.ratio}`);
  console.log(`========================================================\n`);

  const limit = pLimit(concurrency);
  const results: BatchItemResult[] = [];
  const startTime = Date.now();

  const tasks = urls.map((url, idx) => {
    return limit(async () => {
      const itemStart = Date.now();
      let attempts = 0;
      let lastError: Error | null = null;
      let videoPath: string | undefined;

      while (attempts <= maxRetries) {
        attempts++;
        try {
          console.log(`[Batch ${idx + 1}/${urls.length}] [Lần ${attempts}] Bắt đầu xử lý: ${url}`);
          const article = await scrapeUrl(url);
          const scriptData = await generateScriptFromArticle(article, {
            geminiApiKey: cfg.geminiApiKey,
            provider: cfg.ttsProvider,
            voiceId: cfg.edgeTtsVoice,
            channelName: cfg.tiktok.displayName,
          });

          if (values.style && (scriptData as any).scenes) {
            (scriptData as any).scenes.forEach((s: any) => {
              if (s.templateData) s.templateData.style = values.style;
            });
          }

          const res = await runPipeline({
            scriptData,
            theme,
          });

          videoPath = res.videoPath;
          console.log(`✅ [Batch ${idx + 1}/${urls.length}] Hoàn tất: ${url} -> ${videoPath}`);
          lastError = null;
          break;
        } catch (err: any) {
          lastError = err;
          console.warn(`⚠️ [Batch ${idx + 1}/${urls.length}] Lần ${attempts} thất bại cho ${url}: ${err.message}`);
          if (attempts <= maxRetries) {
            await new Promise((r) => setTimeout(r, 2000 * attempts));
          }
        }
      }

      const durationMs = Date.now() - itemStart;
      const itemResult: BatchItemResult = {
        url,
        status: lastError ? "failed" : "success",
        attempts,
        durationMs,
        videoPath,
        error: lastError ? lastError.message : undefined,
      };
      results.push(itemResult);
    });
  });

  await Promise.all(tasks);

  const totalTimeMs = Date.now() - startTime;
  const succeeded = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "failed").length;

  const outputDir = join(process.cwd(), "output");
  await mkdir(outputDir, { recursive: true });
  const reportPath = join(outputDir, "batch-report.json");
  const report = {
    summary: {
      total: urls.length,
      succeeded,
      failed,
      concurrency,
      totalDurationSec: (totalTimeMs / 1000).toFixed(1),
      timestamp: new Date().toISOString(),
    },
    items: results,
  };

  await writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n========================================================`);
  console.log(`🏁 BÁO CÁO TỔNG KẾT BATCH RENDER`);
  console.log(`========================================================`);
  console.log(`Tổng video xử lý: ${urls.length}`);
  console.log(`✅ Thành công:       ${succeeded}`);
  console.log(`❌ Thất bại:        ${failed}`);
  console.log(`⏱️ Tổng thời gian:   ${(totalTimeMs / 1000).toFixed(1)}s`);
  console.log(`📄 Chi tiết báo cáo: ${reportPath}`);
  console.log(`========================================================\n`);
}

main().catch((e) => {
  console.error("Batch runner gặp lỗi:", e);
  process.exit(1);
});
