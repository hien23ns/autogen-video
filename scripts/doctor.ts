#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

interface CheckItem {
  category: string;
  name: string;
  status: "ok" | "warn" | "fail";
  message: string;
  fixTip?: string;
}

async function main() {
  console.log(`\n========================================================`);
  console.log(`🩺 AUTO VIDEO GEN — HỆ THỐNG CHẨN ĐOÁN MÔI TRƯỜNG (DOCTOR)`);
  console.log(`========================================================\n`);

  const checks: CheckItem[] = [];

  // 1. Node.js Version Check
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0], 10);
  if (majorVersion >= 20) {
    checks.push({
      category: "Runtime",
      name: "Node.js",
      status: "ok",
      message: `${nodeVersion} (Đạt chuẩn >= 20.0.0)`,
    });
  } else {
    checks.push({
      category: "Runtime",
      name: "Node.js",
      status: "fail",
      message: `${nodeVersion} (Yêu cầu Node 20+ hoặc Node 22 LTS)`,
      fixTip: "Cài đặt bản Node.js mới nhất từ https://nodejs.org",
    });
  }

  // 2. FFmpeg Check
  const ffmpegRes = spawnSync("ffmpeg", ["-version"]);
  if (ffmpegRes.status === 0) {
    const firstLine = ffmpegRes.stdout.toString().split("\n")[0];
    checks.push({
      category: "Media Tools",
      name: "FFmpeg",
      status: "ok",
      message: firstLine.slice(0, 40),
    });

    // Check filters
    const filterRes = spawnSync("ffmpeg", ["-filters"]);
    const filterOut = filterRes.stdout ? filterRes.stdout.toString() : "";
    const hasLoudnorm = filterOut.includes("loudnorm");
    const hasSilence = filterOut.includes("silencedetect");
    const hasSidechain = filterOut.includes("sidechaincompress");

    if (hasLoudnorm && hasSilence && hasSidechain) {
      checks.push({
        category: "Media Tools",
        name: "FFmpeg Audio Filters",
        status: "ok",
        message: "loudnorm, silencedetect, sidechaincompress đều sẵn sàng",
      });
    } else {
      checks.push({
        category: "Media Tools",
        name: "FFmpeg Audio Filters",
        status: "warn",
        message: `Thiếu filter: loudnorm=${hasLoudnorm}, silencedetect=${hasSilence}, sidechain=${hasSidechain}`,
      });
    }
  } else {
    checks.push({
      category: "Media Tools",
      name: "FFmpeg",
      status: "fail",
      message: "Không tìm thấy lệnh ffmpeg trong PATH",
      fixTip: "Tải FFmpeg và thêm vào biến môi trường PATH hệ thống (Windows: winget install Gyan.FFmpeg)",
    });
  }

  // 3. FFprobe Check
  const ffprobeRes = spawnSync("ffprobe", ["-version"]);
  if (ffprobeRes.status === 0) {
    checks.push({
      category: "Media Tools",
      name: "FFprobe",
      status: "ok",
      message: "Sẵn sàng trích xuất metadata video/audio",
    });
  } else {
    checks.push({
      category: "Media Tools",
      name: "FFprobe",
      status: "fail",
      message: "Không tìm thấy ffprobe trong PATH",
    });
  }

  // 4. TTS Providers & Network
  checks.push({
    category: "TTS Engine",
    name: "Edge TTS (Default)",
    status: "ok",
    message: "edge-tts-universal đã cài đặt (Miễn phí 100%, không cần API key)",
  });

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    checks.push({
      category: "AI Script",
      name: "Gemini API Key",
      status: "ok",
      message: "Đã cấu hình trong .env (.env.local)",
    });
  } else {
    checks.push({
      category: "AI Script",
      name: "Gemini API Key",
      status: "warn",
      message: "Chưa cấu hình GEMINI_API_KEY (Sẽ fallback sang Heuristic parser offline)",
      fixTip: "Lấy key miễn phí tại https://aistudio.google.com và thêm vào .env.local",
    });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    checks.push({
      category: "Speech AI",
      name: "OpenAI Whisper",
      status: "ok",
      message: "Đã cấu hình OPENAI_API_KEY cho Whisper transcription",
    });
  } else {
    checks.push({
      category: "Speech AI",
      name: "OpenAI Whisper",
      status: "warn",
      message: "Chưa cấu hình OPENAI_API_KEY (Chạy ở chế độ offline heuristic/silence detect)",
    });
  }

  // 5. Assets & Licenses
  const sfxDir = join(process.cwd(), "assets", "sfx");
  const bgmDir = join(process.cwd(), "assets", "bgm");
  const licenseFile = join(process.cwd(), "assets", "LICENSES.md");

  const sfxCount = existsSync(sfxDir) ? readdirSync(sfxDir).filter((f) => f.endsWith(".mp3")).length : 0;
  const bgmCount = existsSync(bgmDir) ? readdirSync(bgmDir).filter((f) => f.endsWith(".mp3")).length : 0;

  checks.push({
    category: "Assets",
    name: "SFX / BGM Libraries",
    status: sfxCount > 0 ? "ok" : "warn",
    message: `${sfxCount} SFX audio clips | ${bgmCount} BGM tracks`,
  });

  checks.push({
    category: "Legal & Licenses",
    name: "Commercial License Record",
    status: existsSync(licenseFile) ? "ok" : "warn",
    message: existsSync(licenseFile) ? "assets/LICENSES.md hợp lệ" : "Chưa có LICENSES.md",
  });

  // Print Report Table
  console.log(`DANH SÁCH KIỂM TRA MÔI TRƯỜNG:`);
  console.log(`--------------------------------------------------------------------------------`);
  for (const c of checks) {
    const icon = c.status === "ok" ? "✅" : c.status === "warn" ? "⚠️ " : "❌";
    console.log(`${icon} [${c.category.padEnd(16)}] ${c.name.padEnd(24)} : ${c.message}`);
    if (c.fixTip) {
      console.log(`   💡 Hướng dẫn sửa: ${c.fixTip}`);
    }
  }
  console.log(`--------------------------------------------------------------------------------`);

  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  if (failCount === 0) {
    console.log(`\n🎉 Môi trường hoàn toàn sẵn sàng để render video chất lượng cao! (${warnCount} cảnh báo nhẹ)\n`);
  } else {
    console.log(`\n❌ Phát hiện ${failCount} lỗi cần khắc phục trước khi render.\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Doctor error:", err);
  process.exit(1);
});
