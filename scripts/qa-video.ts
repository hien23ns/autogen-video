#!/usr/bin/env node
import { existsSync, statSync, readdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { runQaEvaluation, formatQaReportMarkdown } from "../src/qa/qa-analyzer.js";

async function main() {
  const arg = process.argv[2];
  if (!arg || arg === "-h" || arg === "--help") {
    console.log(`
🎬 Auto Video QA Verification Tool

CÁCH DÙNG:
  npm run qa:video -- <duong-dan-file.mp4 | thu-muc-output>

VÍ DỤ:
  npm run qa:video -- output/tin-tuc-20261020/video.mp4
  npm run qa:video -- output/tin-tuc-20261020
`);
    process.exit(0);
  }

  let videoPath = resolve(arg);
  if (existsSync(videoPath) && statSync(videoPath).isDirectory()) {
    videoPath = join(videoPath, "video.mp4");
  }

  if (!existsSync(videoPath)) {
    console.error(`❌ Không tìm thấy file video: ${videoPath}`);
    process.exit(1);
  }

  console.log(`\n🔍 Đang phân tích chất lượng video: ${videoPath}`);
  console.log("   - Trích xuất thông số định dạng & streams qua ffprobe...");
  console.log("   - Phân tích độ ồn âm thanh theo chuẩn EBU R128 (-14 LUFS)...");
  console.log("   - Trích xuất verification frames tại các mốc cảnh quan trọng...");

  try {
    const report = await runQaEvaluation(videoPath);
    const md = formatQaReportMarkdown(report);

    const outDir = dirname(videoPath);
    const reportMdPath = join(outDir, "qa-report.md");
    const reportJsonPath = join(outDir, "qa-report.json");

    await writeFile(reportMdPath, md, "utf8");
    await writeFile(reportJsonPath, JSON.stringify(report, null, 2), "utf8");

    console.log("\n========================================================");
    console.log(`📊 KẾT QUẢ KIỂM ĐỊNH QA: ${report.passed ? "✅ PASSED" : "⚠️ CÓ CẢNH BÁO"} (Điểm: ${report.score}/100)`);
    console.log("========================================================");
    console.log(`- Độ phân giải: ${report.video.width}x${report.video.height} (${report.video.fps} fps)`);
    console.log(`- Độ lớn âm thanh: ${report.audio.integratedLufs?.toFixed(1)} LUFS (True Peak: ${report.audio.truePeakDbtp?.toFixed(1)} dBTP)`);
    console.log(`- Khung hình kiểm tra: ${report.extractedFrames.length} frames đã lưu tại ${join(outDir, "qa-frames")}`);
    console.log(`- Báo cáo Markdown: ${reportMdPath}`);
    console.log(`- Báo cáo JSON:     ${reportJsonPath}\n`);

    if (report.warnings.length > 0) {
      console.log("⚠️ Cảnh báo:");
      report.warnings.forEach((w) => console.log(`   - ${w}`));
    }

    if (report.errors.length > 0) {
      console.log("\n❌ Lỗi nghiêm trọng:");
      report.errors.forEach((e) => console.log(`   - ${e}`));
      process.exit(1);
    }
  } catch (err: any) {
    console.error("❌ Lỗi trong quá trình kiểm định QA:", err.message);
    process.exit(1);
  }
}

main();
