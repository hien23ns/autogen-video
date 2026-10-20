import { describe, it, expect } from "vitest";
import { formatQaReportMarkdown, type QaReport } from "./qa-analyzer.js";

describe("qa-analyzer", () => {
  it("formats QA markdown report correctly with passed status", () => {
    const mockReport: QaReport = {
      videoPath: "output/test/video.mp4",
      timestamp: "2026-10-20T08:00:00Z",
      passed: true,
      score: 95,
      video: {
        width: 1080,
        height: 1920,
        fps: 30,
        codec: "h264",
        durationSec: 55.5,
        bitrateKbps: 3200,
      },
      audio: {
        codec: "aac",
        sampleRate: 48000,
        channels: 2,
        integratedLufs: -14.2,
        truePeakDbtp: -1.0,
        loudnessRangeLra: 6.5,
      },
      extractedFrames: ["frame_01_1.00s.jpg", "frame_02_25.00s.jpg"],
      warnings: [],
      errors: [],
    };

    const md = formatQaReportMarkdown(mockReport);
    expect(md).toContain("✅ ĐẠT CHUẨN (PASSED)");
    expect(md).toContain("1080 × 1920");
    expect(md).toContain("-14.2 LUFS");
    expect(md).toContain("frame_01_1.00s.jpg");
  });

  it("includes warnings and failed status when score is below 70", () => {
    const mockReport: QaReport = {
      videoPath: "output/bad/video.mp4",
      timestamp: "2026-10-20T08:00:00Z",
      passed: false,
      score: 50,
      video: {
        width: 720,
        height: 1280,
        fps: 15,
        codec: "h264",
        durationSec: 20,
        bitrateKbps: 800,
      },
      audio: {
        codec: "aac",
        sampleRate: 44100,
        channels: 1,
        integratedLufs: -30.0,
      },
      extractedFrames: [],
      warnings: ["Resolution is 720x1280, expected vertical 1080x1920", "Audio is too quiet: -30 LUFS"],
      errors: ["Frame rate is too low: 15 fps (minimum 24 fps required)"],
    };

    const md = formatQaReportMarkdown(mockReport);
    expect(md).toContain("❌ CẦN ĐIỀU CHỈNH (FAILED)");
    expect(md).toContain("Frame rate is too low: 15 fps");
    expect(md).toContain("Resolution is 720x1280");
  });
});
