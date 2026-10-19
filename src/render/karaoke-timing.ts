/**
 * Karaoke Timing Engine
 * Calculates word-level and chunk-level timestamps for synchronized karaoke subtitles.
 */

export interface KaraokeWord {
  word: string;
  startSec: number;
  endSec: number;
  index: number;
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
  maxWordsPerChunk?: number; // default: 5
}

/**
 * Distribute timing across words based on character count and punctuation pauses.
 */
export function generateKaraokeWords(
  text: string,
  sceneStartSec: number,
  durationSec: number,
): KaraokeWord[] {
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
    });
    cursor = end;
  }

  return result;
}

/**
 * Group words into readable chunks (4-6 words) for TikTok/Reels vertical subtitles.
 */
export function groupKaraokeChunks(
  words: KaraokeWord[],
  maxWordsPerChunk = 5,
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
 * Generate Karaoke HTML for a scene.
 */
export function renderKaraokeHtml(options: GenerateKaraokeOptions): string {
  const { sceneId, text, sceneStartSec, durationSec, maxWordsPerChunk = 5 } = options;
  const words = generateKaraokeWords(text, sceneStartSec, durationSec);
  const chunks = groupKaraokeChunks(words, maxWordsPerChunk);

  if (chunks.length === 0) return "";

  const chunksHtml = chunks
    .map((chunk) => {
      const wordsHtml = chunk.words
        .map(
          (w) =>
            `<span class="k-word" id="kw-${sceneId}-${w.index}" data-k-start="${w.startSec}" data-k-end="${w.endSec}">${escapeHtml(w.word)} </span>`
        )
        .join("");

      return `<div class="k-chunk" id="kchunk-${sceneId}-${chunk.chunkIndex}" data-k-start="${chunk.startSec}" data-k-end="${chunk.endSec}">
  <div class="k-chunk-inner">${wordsHtml}</div>
</div>`;
    })
    .join("\n");

  return `<div class="tier-bot-karaoke" id="karaoke-${sceneId}">
  <div class="karaoke-badge">
    <span class="karaoke-mic">🎙️</span>
    <span class="karaoke-label">AUDIO SUBTITLES</span>
  </div>
  <div class="karaoke-display-box">
    ${chunksHtml}
  </div>
</div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
