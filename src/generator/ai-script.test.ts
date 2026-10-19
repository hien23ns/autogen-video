import { describe, it, expect, vi } from "vitest";
import axios from "axios";
import {
  convertNumbersToWordsVietnamese,
  synthesizeFallbackScript,
  generateScriptFromArticle,
} from "./ai-script.js";
import type { ScrapedArticle } from "../scraper/web-scraper.js";
import { ScriptSchema } from "../render/script-schema.js";

vi.mock("axios");

describe("ai-script", () => {
  it("converts Vietnamese numbers phonetically", () => {
    expect(convertNumbersToWordsVietnamese("50%")).toBe("năm mươi phần trăm");
    expect(convertNumbersToWordsVietnamese("GPT 5.5")).toBe("GPT năm chấm năm");
    expect(convertNumbersToWordsVietnamese("iPhone 17")).toBe("iPhone mười bảy");
    expect(convertNumbersToWordsVietnamese("mô hình AI")).toBe("mô hình ây ai");
  });

  it("synthesizes valid ScriptSchema-compliant fallback script", () => {
    const article: ScrapedArticle = {
      url: "https://github.com/Cuongyd196/auto-compare-video",
      domain: "github.com",
      title: "Apple ra mắt iPhone 17",
      description: "Chi tiết thiết kế và hiệu năng mới của dòng iPhone.",
      content: "Apple vừa giới thiệu thế hệ điện thoại mới nhất với cảm biến ảnh cải tiến vượt bậc. Pin cũng tăng đáng kể.",
      ogImage: "https://example.com/banner.jpg",
    };

    const script = synthesizeFallbackScript(article, {
      channel: "Công nghệ 24h",
      provider: "edge-tts",
      voiceId: "vi-VN-HoaiMyNeural",
    });

    expect(() => ScriptSchema.parse(script)).not.toThrow();
    expect(script.scenes.length).toBe(5);
    expect(script.scenes[0].type).toBe("hook");
    expect(script.scenes[4].type).toBe("outro");
  });

  it("uses Gemini API when API key is provided", async () => {
    const article: ScrapedArticle = {
      url: "https://example.com/ai-news",
      domain: "example.com",
      title: "Tin AI mới",
      description: "Tin nóng",
      content: "Nội dung AI.",
      ogImage: null,
    };

    const mockGeminiJson = synthesizeFallbackScript(article, {
      channel: "Công nghệ 24h",
      provider: "edge-tts",
      voiceId: "vi-VN-HoaiMyNeural",
    });

    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: {
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(mockGeminiJson) }],
            },
          },
        ],
      },
    });

    const script = await generateScriptFromArticle(article, {
      geminiApiKey: "mock-gemini-key",
      channelName: "Công nghệ 24h",
    });

    expect(script.scenes.length).toBe(5);
    expect(script.metadata.title).toBe(mockGeminiJson.metadata.title);
  });
});
