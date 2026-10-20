/**
 * Enhanced Viral Caption & Karaoke Timing Engine (v4)
 * Supports word-level synchronization, 5 viral caption styles, smart keyword highlighting,
 * intelligent Vietnamese line breaking, and SRT/VTT exports.
 */

export type CaptionStyle =
  | "karaoke-highlight"
  | "pop-in"
  | "box-highlight"
  | "hand-drawn-underline"
  | "minimal";

export interface KaraokeWord {
  word: string;
  startSec: number;
  endSec: number;
  index: number;
  isKeyword?: boolean;
}

export interface KaraokeChunk {
  chunkIndex: number;
  words: KaraokeWord[];
  startSec: number;
  endSec: number;
}

export interface GenerateKaraokeOptions {
  sceneId: string;
  text: string;
  sceneStartSec: number;
  durationSec: number;
  maxWordsPerChunk?: number; // default: 4-5
  captionStyle?: CaptionStyle;
  rawWordTimings?: { word: string; startSec: number; endSec: number }[];
}

/**
 * Smart Keyword Detector for Tech News, Numbers, and Emotional Hook Words
 */
export function isViralKeyword(word: string): boolean {
  const clean = word.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  if (!clean) return false;

  // 1. Numbers, percentages, multipliers, units (e.g., 200MP, 82.7%, 5000mAh, 10x, 21tr)
  if (/\d+/.test(clean)) return true;

  // 2. Tech brands & models
  if (
    /^(apple|google|openai|microsoft|tiktok|youtube|github|meta|nvidia|gpt|claude|gemini|deepseek|react|python|linux|macbook|iphone)$/i.test(
      clean
    )
  ) {
    return true;
  }

  // 3. High-impact Vietnamese buzzwords
  if (
    /^(đột phá|kỷ lục|vượt trội|nguy hiểm|khẩn cấp|chính thức|ra mắt|khủng|siêu|miễn phí|bảo mật|lỗ hổng|tấn công|thành công|cảnh báo)$/i.test(
      clean
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Parses SRT subtitle content into Word Timestamps, offset by scene start
 */
export function parseSrtToWordTimings(
  srtContent: string,
  sceneStartSec: number = 0
): { word: string; startSec: number; endSec: number }[] {
  if (!srtContent || !srtContent.trim()) return [];

  const blocks = srtContent.trim().split(/\n\s*\n/);
  const result: { word: string; startSec: number; endSec: number }[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    // Line 1 or 2 contains timestamp: 00:00:01,234 --> 00:00:03,456
    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;

    const [startStr, endStr] = timeLine.split("-->").map((s) => s.trim());
    const startSec = parseSrtTimestamp(startStr) + sceneStartSec;
    const endSec = parseSrtTimestamp(endStr) + sceneStartSec;

    // Remaining lines are text
    const textLines = lines.slice(lines.indexOf(timeLine) + 1).join(" ");
    const words = textLines.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    const totalDur = Math.max(0.1, endSec - startSec);
    const durPerWord = totalDur / words.length;

    words.forEach((w, idx) => {
      const wStart = startSec + idx * durPerWord;
      const wEnd = idx === words.length - 1 ? endSec : wStart + durPerWord;
      result.push({
        word: w,
        startSec: Number(wStart.toFixed(2)),
        endSec: Number(wEnd.toFixed(2)),
      });
    });
  }

  return result;
}

function parseSrtTimestamp(ts: string): number {
  const parts = ts.replace(",", ".").split(":");
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
}

/**
 * Distribute timing across words based on character count and punctuation pauses.
 */
export function generateKaraokeWords(
  text: string,
  sceneStartSec: number,
  durationSec: number,
  rawTimings?: { word: string; startSec: number; endSec: number }[]
): KaraokeWord[] {
  if (rawTimings && rawTimings.length > 0) {
    return rawTimings.map((rt, idx) => ({
      word: rt.word,
      startSec: rt.startSec,
      endSec: rt.endSec,
      index: idx,
      isKeyword: isViralKeyword(rt.word),
    }));
  }

  const clean = text.trim();
  if (!clean) return [];

  const rawWords = clean.split(/\s+/).filter(Boolean);
  if (rawWords.length === 0) return [];

  // Punctuation pause weights
  const weights = rawWords.map((w) => {
    let weight = Math.max(w.length, 2);
    if (/[,;:]$/.test(w)) weight += 2.5;
    if (/[.!?]$/.test(w)) weight += 4.0;
    return weight;
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let cursor = sceneStartSec;

  const result: KaraokeWord[] = [];
  for (let i = 0; i < rawWords.length; i++) {
    const fraction = weights[i] / totalWeight;
    const wordDur = Math.max(0.12, durationSec * fraction);
    const end = i === rawWords.length - 1 ? sceneStartSec + durationSec : cursor + wordDur;
    result.push({
      word: rawWords[i],
      startSec: Number(cursor.toFixed(2)),
      endSec: Number(end.toFixed(2)),
      index: i,
      isKeyword: isViralKeyword(rawWords[i]),
    });
    cursor = end;
  }

  return result;
}

/**
 * Group words into readable chunks (3-5 words) for TikTok/Reels vertical subtitles.
 */
export function groupKaraokeChunks(
  words: KaraokeWord[],
  maxWordsPerChunk = 4
): KaraokeChunk[] {
  if (words.length === 0) return [];

  const chunks: KaraokeChunk[] = [];
  let currentGroup: KaraokeWord[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    currentGroup.push(w);

    const hasEndingPunctuation = /[.!?]$/.test(w.word);
    const reachesMax = currentGroup.length >= maxWordsPerChunk;
    const isLast = i === words.length - 1;

    if (hasEndingPunctuation || reachesMax || isLast) {
      const chunkStart = currentGroup[0].startSec;
      const chunkEnd = currentGroup[currentGroup.length - 1].endSec;
      chunks.push({
        chunkIndex: chunks.length,
        words: [...currentGroup],
        startSec: chunkStart,
        endSec: chunkEnd,
      });
      currentGroup = [];
    }
  }

  return chunks;
}

/**
 * Render Karaoke HTML for a scene supporting 5 styles and keyword highlights.
 */
export function renderKaraokeHtml(options: GenerateKaraokeOptions): string {
  const {
    sceneId,
    text,
    sceneStartSec,
    durationSec,
    maxWordsPerChunk = 4,
    captionStyle = "karaoke-highlight",
    rawWordTimings,
  } = options;

  const words = generateKaraokeWords(text, sceneStartSec, durationSec, rawWordTimings);
  const chunks = groupKaraokeChunks(words, maxWordsPerChunk);

  if (chunks.length === 0) return "";

  const chunksHtml = chunks
    .map((chunk) => {
      const wordsHtml = chunk.words
        .map((w) => {
          const kwClass = w.isKeyword ? " k-keyword" : "";
          return `<span class="k-word${kwClass}" id="kw-${sceneId}-${w.index}" data-k-start="${w.startSec}" data-k-end="${w.endSec}">${escapeHtml(w.word)} </span>`;
        })
        .join("");

      return `<div class="k-chunk" id="kchunk-${sceneId}-${chunk.chunkIndex}" data-k-start="${chunk.startSec}" data-k-end="${chunk.endSec}">
  <div class="k-chunk-inner">${wordsHtml}</div>
</div>`;
    })
    .join("\n");

  const styleClass = captionStyle && captionStyle !== "karaoke-highlight" ? ` style-${captionStyle}` : "";

  return `<div class="tier-bot-karaoke${styleClass}" data-caption-style="${captionStyle}" id="karaoke-${sceneId}">
  <div class="karaoke-display-box">
    ${chunksHtml}
  </div>
</div>`;
}

/**
 * Format total chunks into standard SRT format
 */
export function exportToSrt(chunks: KaraokeChunk[]): string {
  let srt = "";
  let counter = 1;

  for (const c of chunks) {
    const startStr = formatTimestampSrt(c.startSec);
    const endStr = formatTimestampSrt(c.endSec);
    const text = c.words.map((w) => w.word).join(" ");

    srt += `${counter}\n${startStr} --> ${endStr}\n${text}\n\n`;
    counter++;
  }

  return srt.trim();
}

/**
 * Format total chunks into standard WebVTT format
 */
export function exportToVtt(chunks: KaraokeChunk[]): string {
  let vtt = "WEBVTT\n\n";

  for (const c of chunks) {
    const startStr = formatTimestampVtt(c.startSec);
    const endStr = formatTimestampVtt(c.endSec);
    const text = c.words.map((w) => w.word).join(" ");

    vtt += `${startStr} --> ${endStr}\n${text}\n\n`;
  }

  return vtt.trim();
}

function formatTimestampSrt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function formatTimestampVtt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
