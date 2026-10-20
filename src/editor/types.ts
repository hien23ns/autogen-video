export interface RawVideoMetadata {
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  audioCodec?: string;
  audioSampleRate?: number;
}

export interface WordSegment {
  word: string;
  startSec: number;
  endSec: number;
  confidence?: number;
  isFiller?: boolean;
  isStutter?: boolean;
}

export interface SentenceTake {
  index: number;
  rawText: string;
  cleanText: string;
  startSec: number;
  endSec: number;
  words: WordSegment[];
  groupKey: string; // Key used to group takes of the same intended sentence
  score: number; // 0 to 100
  isKept: boolean;
  discardReason?: "filler_burst" | "hesitation" | "bad_take_duplicate" | "stumble" | "none";
  fluencyScore: number;
  fillerCount: number;
}

export interface TimelineCut {
  index: number;
  startSec: number;
  endSec: number;
  durationSec: number;
  type: "keep" | "cut-silence" | "cut-filler" | "cut-bad-take";
  reason: string;
  takeIndex?: number;
  zoomLevel: number; // 1.0 (wide) | 1.15 (medium punch) | 1.25 (close punch)
}

export interface BrollSuggestion {
  timestampSec: number;
  keywords: string[];
  contextSentence: string;
}

export interface EditTimeline {
  originalVideoPath: string;
  totalOriginalDurationSec: number;
  totalEditedDurationSec: number;
  cutsCount: {
    kept: number;
    silenceCut: number;
    badTakesCut: number;
  };
  cuts: TimelineCut[];
  sentences: SentenceTake[];
  brollSuggestions: BrollSuggestion[];
  captionsSrtPath?: string;
}

export interface EditOptions {
  inputPath: string;
  outputPath?: string;
  silenceThresholdDb?: number; // default -32
  silenceMinDurationSec?: number; // default 0.35
  reframeRatio?: "9:16" | "original";
  punchInFrequency?: number; // zoom every N kept cuts (default 2)
  splitScreenCompare?: boolean;
  dryRun?: boolean;
  transcriptPath?: string;
  brollDir?: string;
}
