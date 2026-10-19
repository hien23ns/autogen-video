import { describe, it, expect } from "vitest";
import {
  generateKaraokeWords,
  groupKaraokeChunks,
  renderKaraokeHtml,
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

  it("groups words into chunks appropriately", () => {
    const text = "Một hai ba bốn năm sáu bảy tám chín mười.";
    const words = generateKaraokeWords(text, 10, 5.0);
    const chunks = groupKaraokeChunks(words, 4);

    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0].words.length).toBeLessThanOrEqual(4);
    expect(chunks[0].startSec).toBe(10);
  });

  it("renders valid HTML with karaoke classes and data attributes", () => {
    const html = renderKaraokeHtml({
      sceneId: "scene-1",
      text: "Xin chào Việt Nam!",
      sceneStartSec: 0,
      durationSec: 2.5,
    });

    expect(html).toContain('class="tier-bot-karaoke"');
    expect(html).toContain('id="karaoke-scene-1"');
    expect(html).toContain('class="k-chunk"');
    expect(html).toContain('class="k-word"');
    expect(html).toContain("Xin");
    expect(html).toContain("Việt");
  });
});
