import { describe, it, expect, vi } from "vitest";
import axios from "axios";
import { scrapeUrl } from "./web-scraper.js";

vi.mock("axios");

describe("web-scraper", () => {
  it("scrapes GitHub repo metadata", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      status: 200,
      data: {
        name: "auto-compare-video",
        full_name: "Cuongyd196/auto-compare-video",
        description: "AI video generation tool",
        language: "TypeScript",
        stargazers_count: 120,
        forks_count: 15,
        topics: ["video", "tts"],
      },
    });

    const result = await scrapeUrl("https://github.com/Cuongyd196/auto-compare-video");

    expect(result.domain).toBe("github.com");
    expect(result.ogImage).toContain("opengraph.githubassets.com");
    expect(result.title).toContain("auto-compare-video");
    expect(result.content).toContain("TypeScript");
  });

  it("scrapes generic web page metadata", async () => {
    const fakeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Công nghệ AI mới năm 2026</title>
          <meta property="og:title" content="Công nghệ AI mới năm 2026" />
          <meta property="og:description" content="Khám phá các mô hình AI tiên tiến nhất hiện nay." />
          <meta property="og:image" content="https://example.com/banner.jpg" />
        </head>
        <body>
          <main>
            <p>Nội dung chi tiết bài viết công nghệ.</p>
          </main>
        </body>
      </html>
    `;

    vi.mocked(axios.get).mockResolvedValueOnce({
      status: 200,
      data: fakeHtml,
    });

    const result = await scrapeUrl("https://tech.example.com/article-1");

    expect(result.domain).toBe("tech.example.com");
    expect(result.title).toBe("Công nghệ AI mới năm 2026");
    expect(result.description).toContain("Khám phá các mô hình AI");
    expect(result.ogImage).toBe("https://example.com/banner.jpg");
  });
});
