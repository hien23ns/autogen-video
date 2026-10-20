#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { parseArgs } from "node:util";
import {
  probeVideoMetadata,
  groupAndScoreTakes,
  buildTimeline,
  renderGhostEdit,
  renderComparisonVideo,
} from "../src/editor/ghost-editor.js";
import { detectSilenceIntervals } from "../src/editor/silence-detector.js";
import { extractAudioMono, transcribeAudio } from "../src/editor/whisper-adapter.js";
import type { EditOptions } from "../src/editor/types.js";

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      output: { type: "string" },
      reframe: { type: "string", default: "9:16" },
      "silence-db": { type: "string", default: "-32" },
      "silence-min": { type: "string", default: "0.35" },
      "punch-freq": { type: "string", default: "2" },
      compare: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      transcript: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
    args: process.argv.slice(2),
  });

  const inputVideo = positionals[0];

  if (!inputVideo || values.help) {
    console.log(`
🎬 AI Ghost Video Editor — Tự động cắt bỏ lỗi, chọn take tốt nhất & Reframe 9:16

CÁCH DÙNG:
  npm run edit-raw -- <input.mp4> [options]

TUỲ CHỌN:
  --output <path>       Đường dẫn lưu file video MP4 sau khi edit
  --reframe <mode>      9:16 (mặc định) | original
  --silence-db <db>     Ngưỡng âm lượng phát hiện khoảng lặng (mặc định: -32dB)
  --silence-min <sec>   Thời gian tối thiểu tính là khoảng lặng (mặc định: 0.35s)
  --punch-freq <N>      Đổi zoom / punch-in sau mỗi N câu (mặc định: 2)
  --compare             Xuất thêm video so sánh split-screen (Gốc vs Đã edit)
  --dry-run             Chỉ in kế hoạch cắt và xuất timeline.json, không render video
  --transcript <path>   File transcript JSON hoặc SRT có sẵn
  -h, --help            Hiển thị trợ giúp này

VÍ DỤ:
  npm run edit-raw -- raw-take.mp4 --reframe 9:16 --compare
`);
    process.exit(inputVideo ? 0 : 2);
  }

  if (!existsSync(inputVideo)) {
    console.error(`❌ Không tìm thấy file video đầu vào: ${inputVideo}`);
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir = values.output ? dirname(values.output) : join(process.cwd(), "output", `edited-${timestamp}`);
  const outVideo = values.output || join(outDir, "edited.mp4");
  await mkdir(outDir, { recursive: true });

  const silenceDb = (values["silence-db"] as string) || "-32";
  const silenceMin = (values["silence-min"] as string) || "0.35";
  const punchFreq = parseInt((values["punch-freq"] as string) || "2", 10);
  const isDryRun = Boolean(values["dry-run"]);

  console.log(`\n========================================================`);
  console.log(`🤖 AI GHOST-EDITOR: PHÂN TÍCH & CẮT GHÉP VIDEO QUAY THẬT`);
  console.log(`📹 File đầu vào:   ${inputVideo}`);
  console.log(`🎯 Reframe:        ${values.reframe}`);
  console.log(`🔇 Ngưỡng lặng:    ${silenceDb}dB (min ${silenceMin}s)`);
  console.log(`========================================================\n`);

  // Bước 1: Ingest & Metadata
  console.log(`[1/6] 🔍 Đọc metadata video...`);
  const meta = await probeVideoMetadata(inputVideo);
  console.log(`  Thời lượng gốc: ${meta.durationSec.toFixed(2)}s | ${meta.width}x${meta.height} @ ${meta.fps}fps`);

  // Bước 2: Tách Audio Mono để phân tích
  console.log(`[2/6] 🎙️ Tách âm thanh mono 16kHz...`);
  const tempAudio = join(outDir, "temp-audio.mp3");
  await extractAudioMono(inputVideo, tempAudio);

  // Bước 3: Phát hiện khoảng lặng
  console.log(`[3/6] 🔇 Phát hiện khoảng lặng (FFmpeg silencedetect)...`);
  const silences = await detectSilenceIntervals(
    tempAudio,
    parseFloat(silenceDb),
    parseFloat(silenceMin)
  );
  console.log(`  Tìm thấy ${silences.length} khoảng lặng.`);

  // Bước 4: Transcribe từng từ
  console.log(`[4/6] 📝 Transcribe timestamp từng từ (Whisper / Heuristic)...`);
  const words = await transcribeAudio(tempAudio);
  console.log(`  Đã nhận diện ${words.length} từ.`);

  // Bước 5: Phân tích take & chọn take tốt nhất
  console.log(`[5/6] 🧠 Phân tích ngữ nghĩa, phát hiện lỗi lặp câu và chấm điểm take...`);
  const sentences = groupAndScoreTakes(words);
  const timeline = buildTimeline(meta.durationSec, sentences, silences, {
    punchInFrequency: punchFreq,
  });
  timeline.originalVideoPath = inputVideo;

  console.log(`\n📊 KẾT QUẢ PHÂN TÍCH TIMELINE:`);
  console.log(`  - Tổng câu nhận diện: ${sentences.length}`);
  console.log(`  - Câu / Take giữ lại: ${timeline.cutsCount.kept}`);
  console.log(`  - Bad takes đã loại:  ${timeline.cutsCount.badTakesCut}`);
  console.log(`  - Khoảng lặng loại:   ${timeline.cutsCount.silenceCut}`);
  console.log(`  - Thời lượng gốc:     ${timeline.totalOriginalDurationSec.toFixed(1)}s`);
  console.log(`  - Thời lượng sau cắt: ${timeline.totalEditedDurationSec.toFixed(1)}s (giảm ${((1 - timeline.totalEditedDurationSec / Math.max(1, timeline.totalOriginalDurationSec)) * 100).toFixed(0)}%)\n`);

  // Lưu timeline.json
  const timelineJsonPath = join(outDir, "timeline.json");
  await writeFile(timelineJsonPath, JSON.stringify(timeline, null, 2));
  console.log(`💾 Đã lưu EDL Timeline: ${timelineJsonPath}`);

  // Bước 6: Render video
  console.log(`\n[6/6] 🎬 Render video hoàn chỉnh (Crossfade + Reframe 9:16 + Punch-in + -14 LUFS)...`);
  const editOptions: EditOptions = {
    inputPath: inputVideo,
    outputPath: outVideo,
    reframeRatio: values.reframe as any,
    punchInFrequency: punchFreq,
    dryRun: isDryRun,
    splitScreenCompare: values.compare,
  };

  await renderGhostEdit(inputVideo, timeline, outVideo, editOptions);

  if (!isDryRun) {
    console.log(`\n✅ Video đã edit hoàn tất: ${outVideo}`);

    if (values.compare) {
      console.log(`\n🎞️ Đang tạo video so sánh Split-Screen (Paid vs Ghost)...`);
      const compareOut = join(outDir, "comparison-split-screen.mp4");
      await renderComparisonVideo(inputVideo, outVideo, compareOut);
      console.log(`✅ Video so sánh: ${compareOut}`);
    }
  }

  console.log(`\n✨ HOÀN TẤT AI GHOST EDIT THÀNH CÔNG! ✨\n`);
}

main().catch((err) => {
  console.error("❌ Lỗi khi thực hiện edit video:", err);
  process.exit(1);
});
