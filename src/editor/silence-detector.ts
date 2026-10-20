import { spawn } from "node:child_process";

export interface SilenceInterval {
  startSec: number;
  endSec: number;
  durationSec: number;
}

export const VIETNAMESE_FILLERS = new Set([
  "ừm",
  "ừ",
  "ờ",
  "à",
  "thì",
  "là",
  "kiểu",
  "um",
  "uh",
  "er",
  "ah",
  "like",
]);

export function isFillerWord(word: string): boolean {
  const clean = word.toLowerCase().replace(/[.,!?;:"'()]/g, "").trim();
  return VIETNAMESE_FILLERS.has(clean);
}

export async function detectSilenceIntervals(
  mediaPath: string,
  thresholdDb = -32,
  minDurationSec = 0.35
): Promise<SilenceInterval[]> {
  return new Promise((resolve, reject) => {
    const args = [
      "-hide_banner",
      "-vn",
      "-i",
      mediaPath,
      "-af",
      `silencedetect=noise=${thresholdDb}dB:d=${minDurationSec}`,
      "-f",
      "null",
      "-",
    ];

    const proc = spawn("ffmpeg", args);
    let output = "";

    proc.stderr.on("data", (data) => {
      output += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0 && code !== 1) {
        // silencedetect outputs on stderr, return whatever parsed
      }

      const intervals: SilenceInterval[] = [];
      const lines = output.split(/\r?\n/);
      let currentStart: number | null = null;

      for (const line of lines) {
        const startMatch = line.match(/silence_start:\s*([\d.]+)/);
        if (startMatch) {
          currentStart = parseFloat(startMatch[1]);
        }

        const endMatch = line.match(/silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/);
        if (endMatch && currentStart !== null) {
          const end = parseFloat(endMatch[1]);
          const duration = parseFloat(endMatch[2]);
          intervals.push({
            startSec: currentStart,
            endSec: end,
            durationSec: duration,
          });
          currentStart = null;
        }
      }

      resolve(intervals);
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}
