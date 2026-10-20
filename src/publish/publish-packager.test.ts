import { describe, it, expect } from "vitest";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { generatePublishPack } from "./publish-packager.js";
import type { Script } from "../render/script-schema.js";

describe("Publish Packager", () => {
  it("generates multi-platform social copy, metadata, and checklist", async () => {
    const dummyScript: Script = {
      version: "1.0",
      schemaVersion: "2.0.0",
      metadata: {
        title: "SecMon: Hệ Thống Giám Sát An Ninh",
        channel: "Công nghệ 24h",
        source: {
          url: "https://github.com/test/secmon",
          domain: "github.com",
          image: null,
        },
      },
      scenes: [
        {
          id: "hook",
          type: "hook",
          voiceText: "Hệ thống giám sát an ninh mạng thế hệ mới.",
          templateData: {
            template: "hook",
            headline: "SecMon An Ninh",
            kenBurns: "zoom-in",
          },
        },
      ],
    };

    const compDir = join(process.cwd(), "tests", "scratch-publish-test");
    const result = await generatePublishPack({
      compositionDir: compDir,
      videoPath: join(compDir, "video.mp4"),
      script: dummyScript,
      extractCovers: false,
    });

    expect(existsSync(result.metadataPath)).toBe(true);
    expect(existsSync(result.socialCopyPath)).toBe(true);
    expect(existsSync(result.checklistPath)).toBe(true);

    const socialCopy = await readFile(result.socialCopyPath, "utf8");
    expect(socialCopy).toContain("TIKTOK");
    expect(socialCopy).toContain("YOUTUBE SHORTS");
    expect(socialCopy).toContain("REELS");
    expect(socialCopy).toContain("#LearnOnTikTok");
    expect(socialCopy).toContain("#Shorts");

    const metadata = JSON.parse(await readFile(result.metadataPath, "utf8"));
    expect(metadata.title).toBe("SecMon: Hệ Thống Giám Sát An Ninh");
    expect(metadata.postingTimes.length).toBeGreaterThan(0);

    // Clean up
    await rm(compDir, { recursive: true, force: true });
  });
});
