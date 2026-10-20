import { describe, it, expect } from "vitest";
import { isFillerWord } from "./silence-detector.js";
import { groupAndScoreTakes, buildTimeline } from "./ghost-editor.js";
import type { WordSegment } from "./types.js";

describe("Ghost Editor", () => {
  describe("isFillerWord", () => {
    it("identifies Vietnamese and English filler words correctly", () => {
      expect(isFillerWord("ừm")).toBe(true);
      expect(isFillerWord("ờ...")).toBe(true);
      expect(isFillerWord("à")).toBe(true);
      expect(isFillerWord("um")).toBe(true);
      expect(isFillerWord("hệ")).toBe(false);
      expect(isFillerWord("thống")).toBe(false);
      expect(isFillerWord("bảo-mật")).toBe(false);
    });
  });

  describe("groupAndScoreTakes", () => {
    it("detects and rejects duplicate bad takes while keeping the fluent take", () => {
      const words: WordSegment[] = [
        // Take 1: Bad take with filler words and stutters
        { word: "ừm", startSec: 1.0, endSec: 1.3, isFiller: true },
        { word: "hôm", startSec: 1.4, endSec: 1.7 },
        { word: "nay", startSec: 1.8, endSec: 2.1 },
        { word: "nay", startSec: 2.2, endSec: 2.5 }, // stutter duplicate
        { word: "chúng", startSec: 2.6, endSec: 2.9 },
        { word: "ta.", startSec: 3.0, endSec: 3.4 },

        // Take 2: Clean, fluent take
        { word: "hôm", startSec: 4.5, endSec: 4.8 },
        { word: "nay", startSec: 4.9, endSec: 5.2 },
        { word: "chúng", startSec: 5.3, endSec: 5.6 },
        { word: "ta.", startSec: 5.7, endSec: 6.0 },
      ];

      const takes = groupAndScoreTakes(words);
      expect(takes.length).toBe(2);

      // Take 1 should have lower score due to filler and stutter
      expect(takes[0].score).toBeLessThan(takes[1].score);

      // Best take (take 2) is kept, bad take is discarded
      expect(takes[0].isKept).toBe(false);
      expect(takes[0].discardReason).toBe("bad_take_duplicate");
      expect(takes[1].isKept).toBe(true);
    });
  });

  describe("buildTimeline", () => {
    it("builds cuts, computes edited duration, and assigns punch-in zooms", () => {
      const words: WordSegment[] = [
        { word: "giải", startSec: 1.0, endSec: 1.3 },
        { word: "pháp", startSec: 1.4, endSec: 1.7 },
        { word: "an", startSec: 1.8, endSec: 2.1 },
        { word: "ninh.", startSec: 2.2, endSec: 2.5 },
      ];
      const sentences = groupAndScoreTakes(words);
      const silences = [{ startSec: 0, endSec: 0.9 }];

      const timeline = buildTimeline(5.0, sentences, silences, { punchInFrequency: 1 });

      expect(timeline.cuts.length).toBeGreaterThan(0);
      expect(timeline.cutsCount.kept).toBe(1);
      expect(timeline.totalEditedDurationSec).toBe(1.5); // 2.5 - 1.0
      expect(timeline.cuts[0].zoomLevel).toBeDefined();

      // B-roll keyword suggestion
      expect(timeline.brollSuggestions.length).toBeGreaterThan(0);
      expect(timeline.brollSuggestions[0].keywords).toContain("an ninh");
    });
  });
});
