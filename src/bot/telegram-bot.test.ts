import { describe, it, expect, beforeEach, afterEach } from "vitest";
import nock from "nock";
import { parseUserPrompt, getBotToken, sendMessage } from "./telegram-bot.js";

describe("Telegram Bot", () => {
  const originalEnv = process.env.TELEGRAM_BOT_TOKEN;

  afterEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = originalEnv;
    nock.cleanAll();
  });

  describe("parseUserPrompt", () => {
    it("extracts URL from simple message", () => {
      const res = parseUserPrompt("https://github.com/facebook/react");
      expect(res.url).toBe("https://github.com/facebook/react");
      expect(res.theme).toBeUndefined();
    });

    it("detects theme from prompt", () => {
      const res1 = parseUserPrompt("https://github.com/facebook/react matrix");
      expect(res1.theme).toBe("matrix-code");

      const res2 = parseUserPrompt("https://vnexpress.net/so-hoa sunset");
      expect(res2.theme).toBe("sunset-vibes");

      const res3 = parseUserPrompt("https://github.com/... crimson");
      expect(res3.theme).toBe("crimson-beast");
    });

    it("detects style and aspect ratio from prompt", () => {
      const res = parseUserPrompt("https://github.com/facebook/react 16:9 tech");
      expect(res.url).toBe("https://github.com/facebook/react");
      expect(res.style).toBe("tech");
      expect(res.ratio).toBe("16:9");
    });
  });

  describe("getBotToken", () => {
    it("throws helpful error message when token is missing", () => {
      delete process.env.TELEGRAM_BOT_TOKEN;
      expect(() => getBotToken()).toThrow(/TELEGRAM_BOT_TOKEN chưa được cấu hình/);
    });

    it("returns token when environment variable is present", () => {
      process.env.TELEGRAM_BOT_TOKEN = "123456:TEST_TOKEN";
      expect(getBotToken()).toBe("123456:TEST_TOKEN");
    });
  });

  describe("sendMessage", () => {
    it("sends message payload via Telegram Bot API", async () => {
      process.env.TELEGRAM_BOT_TOKEN = "123456:TEST_TOKEN";

      const scope = nock("https://api.telegram.org")
        .post("/bot123456:TEST_TOKEN/sendMessage", {
          chat_id: 999,
          text: "Hello from Vitest",
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        })
        .reply(200, { ok: true, result: { message_id: 1 } });

      await sendMessage(999, "Hello from Vitest");
      expect(scope.isDone()).toBe(true);
    });
  });
});
