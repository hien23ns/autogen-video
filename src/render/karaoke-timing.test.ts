import { describe, it, expect } from "vitest";
import {
  generateKaraokeWords,
  groupKaraokeChunks,
  renderKaraokeHtml,
  isViralKeyword,
  parseSrtToWordTimings,
  exportToSrt,
  exportToVtt,
} from "./karaoke-timing.js";

describe("karaoke-timing", () => {
  it("generates word timings within scene duration", () => {
    const text = "Apple vừa ra mắt iPhone 17 với camera hai trăm megapixel.";
    const words = generateKaraokeWords(text, 0, 4.0);

    expect(words.length).toBeGreaterThan(0);
    expect(words[0].word).toBe("Apple");
    expect(words[0].startSec).toBe(0);
    expect(words[words.length - 1].endSec).toBeCloseTo(4.0, 1);

    for (let i = 1; i < words.length; i++) {
      expect(words[i].startSec).toBeGreaterThanOrEqual(words[i - 1].startSec);
      expect(words[i].endSec).toBeGreaterThan(words[i].startSec);
    }
  });

  it("detects viral keywords accurately", () => {
    expect(isViralKeyword("200MP")).toBe(true);
    expect(isViralKeyword("82.7%")).toBe(true);
    expect(isViralKeyword("Apple")).toBe(true);
    expect(isViralKeyword("iPhone")).toBe(true);
    expect(isViralKeyword("đột phá")).toBe(true);
    expect(isViralKeyword("và")).toBe(false);
    expect(isViralKeyword("bình thường")).toBe(false);
  });

  it("parses SRT subtitle blocks into word-level timings", () => {
    const srt = `1
00:00:01,000 --> 00:00:03,000
Công nghệ đột phá mới

2
00:00:03,200 --> 00:00:05,000
Ra mắt hôm nay`;

    const timings = parseSrtToWordTimings(srt, 0);
    expect(timings.length).toBe(9);
    expect(timings[0].word).toBe("Công");
    expect(timings[0].startSec).toBe(1.0);
    expect(timings[5].word).toBe("Ra");
    expect(timings[5].startSec).toBe(3.2);
  });

  it("groups words into chunks appropriately", () => {
    const text = "Một hai ba bốn năm sáu bảy tám chín mười.";
    const words = generateKaraokeWords(text, 10, 5.0);
    const chunks = groupKaraokeChunks(words, 4);

    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0].words.length).toBeLessThanOrEqual(4);
    expect(chunks[0].startSec).toBe(10);
  });

  it("renders valid HTML with caption style and keyword highlights", () => {
    const html = renderKaraokeHtml({
      sceneId: "scene-1",
      text: "Apple ra mắt 200MP đột phá!",
      sceneStartSec: 0,
      durationSec: 2.5,
      captionStyle: "pop-in",
    });

    expect(html).toContain('class="tier-bot-karaoke style-pop-in"');
    expect(html).toContain('id="karaoke-scene-1"');
    expect(html).toContain('class="k-chunk"');
    expect(html).toContain("k-keyword");
    expect(html).toContain("Apple");
  });

  it("exports chunks to SRT and WebVTT formats", () => {
    const words = generateKaraokeWords("Thử nghiệm xuất phụ đề đa định dạng", 0, 3.0);
    const chunks = groupKaraokeChunks(words, 3);

    const srt = exportToSrt(chunks);
    const vtt = exportToVtt(chunks);

    expect(srt).toContain("-->");
    expect(srt).toContain("00:00:00,000");
    expect(vtt).toContain("WEBVTT");
    expect(vtt).toContain("-->");
  });
});
