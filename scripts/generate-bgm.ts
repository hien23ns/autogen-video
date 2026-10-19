import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const bgmPath = join(__dirname, "..", "assets", "bgm.mp3");

async function generateAmbientBgm() {
  if (existsSync(bgmPath)) {
    console.log(`[BGM] File assets/bgm.mp3 đã tồn tại: ${bgmPath}`);
    return;
  }

  console.log("[BGM] Đang tạo bản nhạc nền Ambient Lo-Fi Tech Chill nhẹ nhàng bằng FFmpeg...");
  
  // Hợp âm Cmaj7 (C3, E3, G3, B3) êm dịu phong cách Lo-Fi Chillwave
  const args = [
    "-y",
    "-f", "lavfi", "-i", "sine=frequency=130.81:duration=60",
    "-f", "lavfi", "-i", "sine=frequency=164.81:duration=60",
    "-f", "lavfi", "-i", "sine=frequency=196.00:duration=60",
    "-f", "lavfi", "-i", "sine=frequency=246.94:duration=60",
    "-filter_complex", "amix=inputs=4:duration=first,lowpass=f=400,volume=0.25,tremolo=f=0.5:d=0.6,afade=t=in:st=0:d=2.0,afade=t=out:st=57:d=3.0",
    "-c:a", "libmp3lame",
    "-b:a", "192k",
    "-ar", "44100",
    bgmPath,
  ];

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("ffmpeg", args);
    proc.on("close", (code) => {
      if (code === 0) {
        console.log(`[BGM] Tạo thành công bản nhạc nền Ambient êm ái tại: ${bgmPath}`);
        resolve();
      } else {
        reject(new Error(`ffmpeg exit with code ${code}`));
      }
    });
    proc.on("error", reject);
  });
}

generateAmbientBgm().catch((err) => {
  console.error("[BGM] Lỗi tạo nhạc nền:", err);
});
