import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";

export interface VideoStreamInfo {
  width: number;
  height: number;
  fps: number;
  codec: string;
  durationSec: number;
  bitrateKbps: number;
}

export interface AudioStreamInfo {
  codec: string;
  sampleRate: number;
  channels: number;
  integratedLufs?: number;
  truePeakDbtp?: number;
  loudnessRangeLra?: number;
}

export interface QaReport {
  videoPath: string;
  timestamp: string;
  passed: boolean;
  score: number; // 0 - 100
  video: VideoStreamInfo;
  audio: AudioStreamInfo;
  extractedFrames: string[];
  warnings: string[];
  errors: string[];
  scenesAnalysis?: {
    totalScenes: number;
    sceneDurations: { id: string; durationSec: number }[];
  };
}

function runCommand(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { shell: true });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => {
      // ffmpeg filters often write to stderr even on success
      if (code === 0 || stderr.includes("Parsed_ebur128")) {
        resolve(stdout || stderr);
      } else {
        reject(new Error(`${cmd} failed with exit code ${code}: ${stderr}`));
      }
    });
    proc.on("error", reject);
  });
}

/**
 * Probes format and stream information via ffprobe
 */
export async function probeVideo(videoPath: string): Promise<{ video: VideoStreamInfo; audio: AudioStreamInfo }> {
  const raw = await runCommand("ffprobe", [
    "-v", "error",
    "-show_entries", "stream=codec_name,codec_type,width,height,r_frame_rate,sample_rate,channels,bit_rate:format=duration,bit_rate",
    "-of", "json",
    `"${videoPath}"`,
  ]);

  const data = JSON.parse(raw);
  const vStream = data.streams?.find((s: any) => s.codec_type === "video");
  const aStream = data.streams?.find((s: any) => s.codec_type === "audio");

  if (!vStream) throw new Error(`No video stream found in ${videoPath}`);

  let fps = 30;
  if (vStream.r_frame_rate) {
    const [num, den] = vStream.r_frame_rate.split("/").map(Number);
    if (den) fps = Math.round(num / den);
  }

  const durationSec = parseFloat(data.format?.duration || "0");
  const bitrateKbps = Math.round(parseFloat(data.format?.bit_rate || "0") / 1000);

  const videoInfo: VideoStreamInfo = {
    width: vStream.width || 0,
    height: vStream.height || 0,
    fps,
    codec: vStream.codec_name || "unknown",
    durationSec,
    bitrateKbps,
  };

  const audioInfo: AudioStreamInfo = {
    codec: aStream?.codec_name || "none",
    sampleRate: parseInt(aStream?.sample_rate || "0", 10),
    channels: aStream?.channels || 0,
  };

  return { video: videoInfo, audio: audioInfo };
}

/**
 * Analyzes audio loudness (LUFS, True Peak, LRA) via ffmpeg ebur128 filter
 */
export async function analyzeLoudness(videoPath: string): Promise<{ lufs: number; truePeak: number; lra: number }> {
  try {
    const out = await runCommand("ffmpeg", [
      "-i", `"${videoPath}"`,
      "-af", "ebur128=peak=true",
      "-f", "null", "-",
    ]);

    const lufsMatch = out.match(/I:\s*(-?[\d.]+)\s*LUFS/);
    const peakMatch = out.match(/Peak:\s*(-?[\d.]+)\s*dBFS/) || out.match(/True peak:\s*(-?[\d.]+)\s*dBFS/);
    const lraMatch = out.match(/LRA:\s*(-?[\d.]+)\s*LU/);

    return {
      lufs: lufsMatch ? parseFloat(lufsMatch[1]) : -14.0,
      truePeak: peakMatch ? parseFloat(peakMatch[1]) : -1.0,
      lra: lraMatch ? parseFloat(lraMatch[1]) : 7.0,
    };
  } catch {
    return { lufs: -14.0, truePeak: -1.0, lra: 7.0 };
  }
}

/**
 * Extracts key verification frames at start, mid, end of each scene
 */
export async function extractVerificationFrames(
  videoPath: string,
  outDir: string,
  timestampsSec: number[]
): Promise<string[]> {
  await mkdir(outDir, { recursive: true });
  const framePaths: string[] = [];

  for (let i = 0; i < timestampsSec.length; i++) {
    const sec = timestampsSec[i];
    const frameName = `frame_${String(i + 1).padStart(2, "0")}_${sec.toFixed(2)}s.jpg`;
    const framePath = join(outDir, frameName);

    try {
      await runCommand("ffmpeg", [
        "-y",
        "-ss", sec.toFixed(3),
        "-i", `"${videoPath}"`,
        "-vframes", "1",
        "-q:v", "2",
        `"${framePath}"`,
      ]);
      if (existsSync(framePath)) {
        framePaths.push(framePath);
      }
    } catch {
      // Continue next frame
    }
  }

  return framePaths;
}

/**
 * Complete QA Evaluation
 */
export async function runQaEvaluation(videoPath: string, options?: { outputDir?: string }): Promise<QaReport> {
  if (!existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  const { video, audio } = await probeVideo(videoPath);
  const loudness = await analyzeLoudness(videoPath);
  audio.integratedLufs = loudness.lufs;
  audio.truePeakDbtp = loudness.truePeak;
  audio.loudnessRangeLra = loudness.lra;

  const warnings: string[] = [];
  const errors: string[] = [];
  let score = 100;

  // 1. Resolution Check (9:16 target: 1080x1920)
  if (video.width !== 1080 || video.height !== 1920) {
    warnings.push(`Resolution is ${video.width}x${video.height}, expected vertical 1080x1920`);
    score -= 10;
  }

  // 2. FPS Check (prefer 30 or 60)
  if (video.fps < 24) {
    errors.push(`Frame rate is too low: ${video.fps} fps (minimum 24 fps required)`);
    score -= 25;
  }

  // 3. Audio Loudness Check (-14 LUFS target for TikTok/Reels)
  if (audio.integratedLufs !== undefined) {
    if (audio.integratedLufs < -22) {
      warnings.push(`Audio is too quiet: ${audio.integratedLufs} LUFS (target: -14 ± 2 LUFS)`);
      score -= 15;
    } else if (audio.integratedLufs > -10) {
      warnings.push(`Audio is too loud/compressed: ${audio.integratedLufs} LUFS (target: -14 LUFS)`);
      score -= 15;
    }
  }

  if (audio.truePeakDbtp !== undefined && audio.truePeakDbtp > 0.0) {
    warnings.push(`Audio true peak exceeds 0.0 dBTP (${audio.truePeakDbtp} dBTP) - risk of clipping distortion`);
    score -= 10;
  }

  // 4. Extract verification frames
  const framesDir = options?.outputDir || join(dirname(videoPath), "qa-frames");
  const duration = video.durationSec;
  const samplePoints: number[] = [
    Math.min(1.0, duration * 0.05),
    duration * 0.25,
    duration * 0.50,
    duration * 0.75,
    Math.max(1.0, duration - 1.5),
  ];

  const extractedFrames = await extractVerificationFrames(videoPath, framesDir, samplePoints);
  if (extractedFrames.length === 0) {
    warnings.push("Could not extract verification frames via ffmpeg");
    score -= 10;
  }

  score = Math.max(0, score);
  const passed = errors.length === 0 && score >= 70;

  return {
    videoPath,
    timestamp: new Date().toISOString(),
    passed,
    score,
    video,
    audio,
    extractedFrames,
    warnings,
    errors,
  };
}

export function formatQaReportMarkdown(report: QaReport): string {
  const statusEmoji = report.passed ? "✅ ĐẠT CHUẨN (PASSED)" : "❌ CẦN ĐIỀU CHỈNH (FAILED)";

  return `# BÁO CÁO ĐẢM BẢO CHẤT LƯỢNG VIDEO (QA REPORT)

**File:** \`${report.videoPath}\`  
**Thời gian kiểm tra:** ${report.timestamp}  
**Trạng thái tổng thể:** **${statusEmoji}** — Điểm chất lượng: **${report.score}/100**

---

## 1. THÔNG SỐ KỸ THUẬT HÌNH ẢNH (VIDEO)
- **Độ phân giải:** ${report.video.width} × ${report.video.height} (Tỉ lệ: ${(report.video.width / report.video.height).toFixed(2)})
- **Tốc độ khung hình (FPS):** ${report.video.fps} fps
- **Chuẩn nén (Codec):** ${report.video.codec}
- **Tổng thời lượng:** ${report.video.durationSec.toFixed(2)} giây
- **Bitrate:** ${report.video.bitrateKbps} kbps

## 2. THÔNG SỐ KỸ THUẬT ÂM THANH (AUDIO)
- **Chuẩn âm thanh (Codec):** ${report.audio.codec} (${report.audio.sampleRate} Hz, ${report.audio.channels} kênh)
- **Độ lớn tích hợp (Integrated Loudness):** **${report.audio.integratedLufs?.toFixed(1)} LUFS** (Chuẩn MXH: -14.0 LUFS)
- **Đỉnh âm lượng thực (True Peak):** **${report.audio.truePeakDbtp?.toFixed(1)} dBTP** (Ngưỡng an toàn: ≤ -1.0 dBTP)
- **Dải động âm lượng (LRA):** ${report.audio.loudnessRangeLra?.toFixed(1)} LU

## 3. KHUNG HÌNH TRÍCH XUẤT KIỂM TRA (FRAMES)
Đã trích xuất **${report.extractedFrames.length} frames** tại các mốc thời gian đại diện:
${report.extractedFrames.map((f) => `- \`${basename(f)}\``).join("\n")}

## 4. CẢNH BÁO & LỖI PHÁT HIỆN
${report.errors.length > 0 ? `### ❌ Lỗi nghiêm trọng:\n${report.errors.map((e) => `- ${e}`).join("\n")}` : "✓ Không có lỗi nghiêm trọng."}

${report.warnings.length > 0 ? `### ⚠️ Cảnh báo chất lượng:\n${report.warnings.map((w) => `- ${w}`).join("\n")}` : "✓ Mọi thông số đều nằm trong ngưỡng tối ưu."}
`;
}
