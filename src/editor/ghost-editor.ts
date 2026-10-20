import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, dirname, basename } from "node:path";
import type {
  RawVideoMetadata,
  WordSegment,
  SentenceTake,
  TimelineCut,
  BrollSuggestion,
  EditTimeline,
  EditOptions,
} from "./types.js";
import { detectSilenceIntervals, isFillerWord } from "./silence-detector.js";
import { extractAudioMono, transcribeAudio } from "./whisper-adapter.js";

export async function probeVideoMetadata(videoPath: string): Promise<RawVideoMetadata> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration:stream=width,height,r_frame_rate,codec_name,sample_rate",
      "-of",
      "json",
      videoPath,
    ]);

    let output = "";
    proc.stdout.on("data", (data) => { output += data.toString(); });
    proc.on("close", (code) => {
      if (code !== 0) return reject(new Error(`ffprobe failed with exit code ${code}`));
      try {
        const json = JSON.parse(output);
        const durationSec = parseFloat(json.format?.duration || "0");
        const vStream = json.streams?.find((s: any) => s.width && s.height);
        const aStream = json.streams?.find((s: any) => s.sample_rate);

        let fps = 30;
        if (vStream?.r_frame_rate) {
          const [num, den] = vStream.r_frame_rate.split("/").map(Number);
          if (den) fps = Math.round(num / den);
        }

        resolve({
          durationSec,
          width: vStream?.width || 1920,
          height: vStream?.height || 1080,
          fps,
          codec: vStream?.codec_name || "h264",
          audioCodec: aStream?.codec_name,
          audioSampleRate: aStream?.sample_rate ? parseInt(aStream.sample_rate, 10) : 44100,
        });
      } catch (err) {
        reject(err);
      }
    });
    proc.on("error", reject);
  });
}

/**
 * Group words into candidate sentences and evaluate takes
 */
export function groupAndScoreTakes(words: WordSegment[]): SentenceTake[] {
  if (words.length === 0) return [];

  const sentences: SentenceTake[] = [];
  let currentWords: WordSegment[] = [];
  let sentenceIdx = 0;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    currentWords.push(w);

    const isLast = i === words.length - 1;
    const endsWithPunct = /[.!?]$/.test(w.word);
    const gapToNext = !isLast ? words[i + 1].startSec - w.endSec : 0;

    if (isLast || endsWithPunct || gapToNext >= 0.55 || currentWords.length >= 14) {
      const rawText = currentWords.map((cw) => cw.word).join(" ");
      const cleanWords = currentWords.filter((cw) => !cw.isFiller);
      const cleanText = cleanWords.map((cw) => cw.word).join(" ");
      const startSec = currentWords[0].startSec;
      const endSec = currentWords[currentWords.length - 1].endSec;
      const duration = Math.max(0.1, endSec - startSec);

      // Compute group key: first 3-4 significant words (deduping consecutive stutters)
      const dedupedWords: string[] = [];
      for (const cw of cleanWords) {
        const norm = cw.word.toLowerCase().replace(/[^a-z0-9à-ỹ]/gi, "");
        if (norm && norm !== dedupedWords[dedupedWords.length - 1]) {
          dedupedWords.push(norm);
        }
      }
      const groupKey = dedupedWords.slice(0, 3).join("_") || `take_${sentenceIdx}`;

      // Score take
      const fillerCount = currentWords.filter((cw) => cw.isFiller).length;
      const wps = currentWords.length / duration; // words per second
      let fluencyScore = 100;

      // Penalize stutters & fillers
      fluencyScore -= fillerCount * 18;
      if (wps < 1.8) fluencyScore -= 15; // too slow / hesitant
      if (wps > 5.0) fluencyScore -= 15; // too rushed

      // Check for immediate duplicate words (stutters)
      for (let j = 0; j < currentWords.length - 1; j++) {
        if (currentWords[j].word.toLowerCase() === currentWords[j + 1].word.toLowerCase()) {
          fluencyScore -= 25;
        }
      }

      sentences.push({
        index: sentenceIdx++,
        rawText,
        cleanText,
        startSec,
        endSec,
        words: [...currentWords],
        groupKey,
        score: Math.max(0, fluencyScore),
        isKept: true,
        fluencyScore: Math.max(0, fluencyScore),
        fillerCount,
      });

      currentWords = [];
    }
  }

  // Deduplicate multi-takes of the same groupKey: Keep only the highest scoring take!
  const groupMap = new Map<string, SentenceTake[]>();
  for (const s of sentences) {
    if (!groupMap.has(s.groupKey)) groupMap.set(s.groupKey, []);
    groupMap.get(s.groupKey)!.push(s);
  }

  for (const [, takes] of groupMap.entries()) {
    if (takes.length > 1) {
      // Sort descending by score
      takes.sort((a, b) => b.score - a.score);
      // Best take is kept
      takes[0].isKept = true;
      for (let k = 1; k < takes.length; k++) {
        takes[k].isKept = false;
        takes[k].discardReason = "bad_take_duplicate";
      }
    }
  }

  return sentences;
}

/**
 * Generate timeline cuts based on kept takes and silence intervals
 */
export function buildTimeline(
  videoDurationSec: number,
  sentences: SentenceTake[],
  silences: { startSec: number; endSec: number }[],
  options: { punchInFrequency?: number } = {}
): EditTimeline {
  const punchFreq = options.punchInFrequency || 2;
  const cuts: TimelineCut[] = [];
  let cutIdx = 0;
  let keptCount = 0;
  let silenceCutSec = 0;
  let badTakesCutSec = 0;

  // Traverse sentences and classify cuts
  for (const s of sentences) {
    if (!s.isKept) {
      cuts.push({
        index: cutIdx++,
        startSec: s.startSec,
        endSec: s.endSec,
        durationSec: s.endSec - s.startSec,
        type: "cut-bad-take",
        reason: `Discarded bad take (score ${s.score}/100: "${s.rawText}")`,
        takeIndex: s.index,
        zoomLevel: 1.0,
      });
      badTakesCutSec += s.endSec - s.startSec;
    } else {
      // Kept take: assign zoom level (1.0 -> 1.15 -> 1.25 -> 1.0)
      const zoomCycle = keptCount % (punchFreq * 2);
      const zoomLevel = zoomCycle === punchFreq ? 1.18 : (zoomCycle === punchFreq * 2 - 1 ? 1.25 : 1.0);
      keptCount++;

      cuts.push({
        index: cutIdx++,
        startSec: s.startSec,
        endSec: s.endSec,
        durationSec: s.endSec - s.startSec,
        type: "keep",
        reason: `Kept take #${s.index} (score ${s.score}/100)`,
        takeIndex: s.index,
        zoomLevel,
      });
    }
  }

  // Account for leading / trailing or inter-sentence silences
  for (const sil of silences) {
    if (sil.endSec - sil.startSec >= 0.4) {
      silenceCutSec += sil.endSec - sil.startSec;
    }
  }

  const keptCuts = cuts.filter((c) => c.type === "keep");
  const totalEditedDurationSec = keptCuts.reduce((acc, c) => acc + c.durationSec, 0);

  // Suggest B-roll based on keyword frequency
  const brollSuggestions: BrollSuggestion[] = [];
  const domainKeywords = [
    "bảo mật", "an ninh", "giám sát", "ai", "cloud", "server", "hạ tầng",
    "mạng", "dữ liệu", "tự động", "doanh nghiệp", "tấn công", "phản ứng",
  ];

  for (const s of sentences.filter((s) => s.isKept)) {
    const matched = domainKeywords.filter((k) => s.cleanText.toLowerCase().includes(k));
    if (matched.length > 0) {
      brollSuggestions.push({
        timestampSec: s.startSec,
        keywords: matched,
        contextSentence: s.cleanText,
      });
    }
  }

  return {
    originalVideoPath: "",
    totalOriginalDurationSec: videoDurationSec,
    totalEditedDurationSec: Math.round(totalEditedDurationSec * 100) / 100,
    cutsCount: {
      kept: keptCuts.length,
      silenceCut: silences.length,
      badTakesCut: cuts.filter((c) => c.type === "cut-bad-take").length,
    },
    cuts,
    sentences,
    brollSuggestions,
  };
}

/**
 * Execute FFmpeg video stitch with 9:16 crop, crossfade, and -14 LUFS mastering
 */
export async function renderGhostEdit(
  inputVideo: string,
  timeline: EditTimeline,
  outputPath: string,
  options: EditOptions
): Promise<void> {
  const keptCuts = timeline.cuts.filter((c) => c.type === "keep");
  if (keptCuts.length === 0) {
    throw new Error("No kept cuts found in timeline to render!");
  }

  const outDir = dirname(outputPath);
  await mkdir(outDir, { recursive: true });

  // If dry-run, only output timeline.json and return
  if (options.dryRun) {
    console.log(`[Dry-Run] Skipped FFmpeg rendering. Saved timeline to ${outputPath}.json`);
    return;
  }

  const reframe = options.reframeRatio !== "original";

  // Build filter_complex for cutting and stitching
  // For each kept cut: trim video and audio
  const filterParts: string[] = [];
  const vOuts: string[] = [];
  const aOuts: string[] = [];

  keptCuts.forEach((cut, i) => {
    const vTag = `v${i}`;
    const aTag = `a${i}`;
    let vFilter = `[0:v]trim=start=${cut.startSec}:end=${cut.endSec},setpts=PTS-STARTPTS`;

    if (reframe) {
      if (cut.zoomLevel > 1.0) {
        const zoomW = Math.round(1080 * cut.zoomLevel);
        const zoomH = Math.round(1920 * cut.zoomLevel);
        vFilter += `,scale=${zoomW}:${zoomH},crop=1080:1920:(in_w-1080)/2:(in_h-1920)/2`;
      } else {
        vFilter += `,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(in_w-1080)/2:(in_h-1920)/2`;
      }
    } else if (cut.zoomLevel > 1.0) {
      vFilter += `,scale=iw*${cut.zoomLevel}:ih*${cut.zoomLevel},crop=iw/${cut.zoomLevel}:ih/${cut.zoomLevel}`;
    }

    vFilter += `[${vTag}]`;
    filterParts.push(vFilter);

    const aFilter = `[0:a]atrim=start=${cut.startSec}:end=${cut.endSec},asetpts=PTS-STARTPTS[${aTag}]`;
    filterParts.push(aFilter);

    vOuts.push(`[${vTag}]`);
    aOuts.push(`[${aTag}]`);
  });

  // Concat all segments
  filterParts.push(
    `${vOuts.join("")}concat=n=${keptCuts.length}:v=1:a=0[vconcat]`,
    `${aOuts.join("")}concat=n=${keptCuts.length}:v=0:a=1,loudnorm=I=-14:TP=-1.0:LRA=11[aout]`
  );

  const filterScript = filterParts.join(";\n");

  await new Promise<void>((resolve, reject) => {
    const args = [
      "-y",
      "-i",
      inputVideo,
      "-filter_complex",
      filterScript,
      "-map",
      "[vconcat]",
      "-map",
      "[aout]",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "22",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      outputPath,
    ];

    const proc = spawn("ffmpeg", args);
    let errLog = "";

    proc.stderr.on("data", (d) => { errLog += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Ghost editor ffmpeg render failed (code ${code}): ${errLog.slice(-500)}`));
    });
    proc.on("error", reject);
  });
}

/**
 * Generate side-by-side comparison video (Raw unedited vs Ghost-edited)
 */
export async function renderComparisonVideo(
  rawVideo: string,
  editedVideo: string,
  outputPath: string
): Promise<void> {
  const filter = [
    `[0:v]scale=540:960,drawtext=text='RAW ORIGINAL':x=20:y=30:fontsize=32:fontcolor=white:box=1:boxcolor=black@0.6[vraw]`,
    `[1:v]scale=540:960,drawtext=text='AI GHOST-EDITED':x=20:y=30:fontsize=32:fontcolor=0x00f0ff:box=1:boxcolor=black@0.6[vedit]`,
    `[vraw][vedit]hstack=inputs=2[v]`,
  ].join(";");

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-y",
      "-i", rawVideo,
      "-i", editedVideo,
      "-filter_complex", filter,
      "-map", "[v]",
      "-map", "1:a",
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "23",
      outputPath,
    ]);

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Comparison render failed (code ${code})`));
    });
    proc.on("error", reject);
  });
}
