import axios from "axios";
import type { Script } from "../render/script-schema.js";
import { ScriptSchema } from "../render/script-schema.js";
import type { ScrapedArticle } from "../scraper/web-scraper.js";
import { log } from "../utils/logger.js";

export interface GenerateScriptOptions {
  geminiApiKey?: string;
  provider?: string;
  voiceId?: string;
  channelName?: string;
}

/**
 * Generates a Vietnamese Script matching ScriptSchema from a scraped article.
 * Uses Gemini API if an API key is provided, with an intelligent offline fallback.
 */
export async function generateScriptFromArticle(
  article: ScrapedArticle,
  opts: GenerateScriptOptions = {}
): Promise<Script> {
  const channel = opts.channelName || "Công nghệ 24h";
  const provider = opts.provider || "edge-tts";
  const voiceId = opts.voiceId || "${VIETNAMESE_VOICEID}";

  if (opts.geminiApiKey) {
    try {
      log.info("Generating script using Gemini API...");
      const geminiScript = await callGeminiApi(article, opts.geminiApiKey, {
        channel,
        provider,
        voiceId,
      });
      const validated = ScriptSchema.parse(geminiScript);
      log.info(`Gemini generated valid script with ${validated.scenes.length} scenes.`);
      return validated;
    } catch (err) {
      log.warn(`Gemini script generation failed (${err}), falling back to built-in generator.`);
    }
  }

  // Built-in intelligent generator (offline fallback)
  log.info("Using built-in intelligent script synthesizer...");
  const script = synthesizeFallbackScript(article, { channel, provider, voiceId });
  return ScriptSchema.parse(script);
}

async function callGeminiApi(
  article: ScrapedArticle,
  apiKey: string,
  meta: { channel: string; provider: string; voiceId: string }
): Promise<unknown> {
  const prompt = `
Bạn là chuyên gia biên tập video ngắn công nghệ cho TikTok/Reels/Shorts tiếng Việt.
Hãy tạo một kịch bản video ngắn (9:16, 5 cảnh) từ bài viết sau:

TIÊU ĐỀ: ${article.title}
DOMAIN: ${article.domain}
NỘI DUNG:
${article.content.slice(0, 2000)}

QUY TẮC BẮT BUỘC CHO voiceText (ĐỌC BỞI TTS TIẾNG VIỆT):
1. Đọc văn nói tự nhiên, lôi cuốn, không dùng emoji, không dùng markdown.
2. PHIÊN ÂM TOÀN BỘ SỐ VÀ KÝ HIỆU trong voiceText:
   - "GPT 5.5" -> "GPT năm chấm năm"
   - "82.7%" -> "tám mươi hai phẩy bảy phần trăm"
   - "iPhone 17" -> "iPhone mười bảy"
   - "200MP" -> "hai trăm megapixel"
   - "5000mAh" -> "năm nghìn miliampe giờ"
   - "21 triệu đồng" -> "hai mươi mốt triệu đồng"
   - "AI" -> "ây ai"
3. Kết thúc mỗi câu trong voiceText bằng dấu chấm hoặc dấu chấm hỏi.

CẤU TRÚC JSON PHẢI TRẢ VỀ CHÍNH XÁC:
{
  "version": "1.0",
  "metadata": {
    "title": "${escapeJson(article.title.slice(0, 60))}",
    "source": {
      "url": "${escapeJson(article.url)}",
      "domain": "${escapeJson(article.domain)}",
      "image": ${article.ogImage ? `"${escapeJson(article.ogImage)}"` : "null"}
    },
    "channel": "${escapeJson(meta.channel)}"
  },
  "voice": {
    "provider": "${escapeJson(meta.provider)}",
    "voiceId": "${escapeJson(meta.voiceId)}",
    "speed": 1.0
  },
  "scenes": [
    {
      "id": "hook",
      "type": "hook",
      "voiceText": "...",
      "templateData": {
        "template": "hook",
        "headline": "...",
        "subhead": "...",
        "bgSrc": "$source.image",
        "kenBurns": "zoom-in"
      }
    },
    {
      "id": "body-1",
      "type": "body",
      "voiceText": "...",
      "templateData": {
        "template": "stat-hero",
        "value": "...",
        "label": "...",
        "context": "..."
      }
    },
    {
      "id": "body-2",
      "type": "body",
      "voiceText": "...",
      "templateData": {
        "template": "feature-list",
        "title": "...",
        "bullets": ["...", "...", "..."],
        "icon": "spark"
      }
    },
    {
      "id": "body-3",
      "type": "body",
      "voiceText": "...",
      "templateData": {
        "template": "callout",
        "statement": "...",
        "tag": "..."
      }
    },
    {
      "id": "outro",
      "type": "outro",
      "voiceText": "Theo dõi ${escapeJson(meta.channel)} để xem bản tin mới mỗi ngày.",
      "templateData": {
        "template": "outro",
        "ctaTop": "Theo dõi ngay",
        "channelName": "${escapeJson(meta.channel)}",
        "source": "${escapeJson(article.domain)}"
      }
    }
  ]
}

Chỉ trả về duy nhất chuỗi JSON hợp lệ, không bọc trong markdown \`\`\`json.
`;

  const candidateModels = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
  ];

  let rawJson: string | undefined;
  let lastError: any;

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(
        endpoint,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        },
        { timeout: 30000 }
      );
      rawJson = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        log.info(`Gemini API succeeded using model ${model}`);
        break;
      }
    } catch (err: any) {
      lastError = err;
      log.warn(`Gemini model ${model} failed (${err.response?.status || err.message}), trying next...`);
    }
  }

  if (!rawJson) throw lastError || new Error("Empty response from Gemini API");
  return JSON.parse(rawJson);
}

/**
 * Intelligent local synthesizer that produces a compliant 5-scene script.
 */
/**
 * Intelligent local synthesizer that produces a compliant, natural 5-scene script.
 */
export function synthesizeFallbackScript(
  article: ScrapedArticle,
  meta: { channel: string; provider: string; voiceId: string }
): Script {
  const isGitHub = article.domain === "github.com" || article.url.includes("github.com");

  if (isGitHub) {
    const repoParts = article.url.split("github.com/")[1]?.split("/").filter(Boolean) || [];
    const ownerName = repoParts[0] || "Meta";
    const rawRepoName = repoParts[1] || article.title.split(/[:\-–|]/)[0].trim();
    const repoName = rawRepoName.slice(0, 25);

    // Extract stars & language if present
    const starsMatch = article.content.match(/Số sao:\s*(\d+)/i) || article.content.match(/(\d+)\s*stars/i);
    const starsNum = starsMatch ? parseInt(starsMatch[1], 10) : 0;
    const starsDisplay = starsNum > 1000 ? `${Math.round(starsNum / 1000)}K+ ⭐` : starsNum > 0 ? `${starsNum} ⭐` : "TOP 1 ⭐";
    const starsSpoken = starsNum > 1000 ? `${Math.round(starsNum / 1000)} nghìn lượt gắn sao` : "hàng đầu thế giới";

    const langMatch = article.content.match(/Ngôn ngữ chính:\s*([^\n]+)/i);
    const mainLang = (langMatch?.[1] || "JavaScript").trim();

    return {
      version: "1.0",
      metadata: {
        title: `${repoName} - ${ownerName}`,
        source: {
          url: article.url,
          domain: "github.com",
          image: article.ogImage,
        },
        channel: meta.channel,
      },
      voice: {
        provider: meta.provider,
        voiceId: meta.voiceId,
        speed: 1.0,
      },
      scenes: [
        {
          id: "hook",
          type: "hook",
          voiceText: convertNumbersToWordsVietnamese(`Khám phá dự án mã nguồn mở cực hot trên GitHub: ${repoName} của ${ownerName}!`),
          templateData: {
            template: "hook",
            headline: repoName,
            subhead: `Dự án GitHub Hot bởi ${ownerName}`,
            bgSrc: article.ogImage ? "$source.image" : undefined,
            kenBurns: "zoom-in",
          },
        },
        {
          id: "body-1",
          type: "body",
          voiceText: convertNumbersToWordsVietnamese(`Dự án đã cán mốc hơn ${starsSpoken}, trở thành nền tảng lập trình phổ biến hàng đầu thế giới.`),
          templateData: {
            template: "stat-hero",
            value: starsDisplay,
            label: "Cộng đồng lập trình",
            context: "Mã nguồn mở thịnh hành",
          },
        },
        {
          id: "body-2",
          type: "body",
          voiceText: convertNumbersToWordsVietnamese(`Được phát triển chủ đạo bằng ${mainLang}, với kiến trúc thành phần linh hoạt và tối ưu hiệu suất cực cao.`),
          templateData: {
            template: "feature-list",
            title: "Điểm sáng cốt lõi",
            bullets: [
              `Ngôn ngữ: ${mainLang}`,
              "Kiến trúc Component hiện đại",
              "Hệ sinh thái mở rộng mạnh mẽ",
            ],
            icon: "spark",
          },
        },
        {
          id: "body-3",
          type: "body",
          voiceText: convertNumbersToWordsVietnamese("Đây chắc chắn là công nghệ không thể thiếu đối với mọi lập trình viên trong năm nay."),
          templateData: {
            template: "callout",
            statement: "Công nghệ nền tảng định hình tương lai phát triển phần mềm.",
            tag: "Đánh giá chuyên môn",
          },
        },
        {
          id: "outro",
          type: "outro",
          voiceText: `Theo dõi ${meta.channel} để đón xem những công nghệ đột phá mỗi ngày.`,
          templateData: {
            template: "outro",
            ctaTop: "Theo dõi ngay",
            channelName: meta.channel,
            source: "github.com",
          },
        },
      ],
    };
  }

  // General news articles
  const cleanTitle = cleanShortHeadline(article.title);

  // Extract real sentences from content, filtering out raw labels
  const sentences = article.content
    .split(/[.\n]/)
    .map((s) => s.replace(/^(Mô tả|Dự án|Topics|Tags|Nội dung):\s*/i, "").trim())
    .filter((s) => s.length > 20 && s.length < 150);

  const s1 = sentences[0] || article.description || "Công nghệ mới vừa chính thức được công bố trên toàn cầu.";
  const s2 = sentences[1] || "Được trang bị hàng loạt cải tiến vượt trội về hiệu năng và trải nghiệm người dùng.";
  const s3 = sentences[2] || "Dự kiến sẽ tạo nên bước ngoặt lớn trên thị trường công nghệ trong năm nay.";

  return {
    version: "1.0",
    metadata: {
      title: cleanTitle,
      source: {
        url: article.url,
        domain: article.domain,
        image: article.ogImage,
      },
      channel: meta.channel,
    },
    voice: {
      provider: meta.provider,
      voiceId: meta.voiceId,
      speed: 1.0,
    },
    scenes: [
      {
        id: "hook",
        type: "hook",
        voiceText: convertNumbersToWordsVietnamese(`${cleanTitle} vừa chính thức ra mắt, mang đến nhiều thay đổi bất ngờ.`),
        templateData: {
          template: "hook",
          headline: cleanTitle,
          subhead: "Tin tức công nghệ mới",
          bgSrc: article.ogImage ? "$source.image" : undefined,
          kenBurns: "zoom-in",
        },
      },
      {
        id: "body-1",
        type: "body",
        voiceText: convertNumbersToWordsVietnamese(s1),
        templateData: {
          template: "stat-hero",
          value: "TOP 1",
          label: "Tiêu điểm công nghệ",
          context: "Xu hướng nổi bật",
        },
      },
      {
        id: "body-2",
        type: "body",
        voiceText: convertNumbersToWordsVietnamese(s2),
        templateData: {
          template: "feature-list",
          title: "Nâng cấp vượt bậc",
          bullets: [
            "Hiệu năng tối ưu vượt trội",
            "Thiết kế công nghệ thế hệ mới",
            "Trải nghiệm mượt mà toàn diện",
          ],
          icon: "spark",
        },
      },
      {
        id: "body-3",
        type: "body",
        voiceText: convertNumbersToWordsVietnamese(s3),
        templateData: {
          template: "callout",
          statement: cleanTitle,
          tag: "Đánh giá nhanh",
        },
      },
      {
        id: "outro",
        type: "outro",
        voiceText: `Theo dõi ${meta.channel} để đón xem những công nghệ đột phá mỗi ngày.`,
        templateData: {
          template: "outro",
          ctaTop: "Theo dõi ngay",
          channelName: meta.channel,
          source: article.domain,
        },
      },
    ],
  };
}

function cleanShortHeadline(raw: string, maxLen = 35): string {
  const cleaned = raw.split(/[-–|]/)[0].trim();
  if (cleaned.length <= maxLen) return cleaned;
  const cut = cleaned.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 15 ? cut.slice(0, lastSpace) : cut;
}


/**
 * Phonetic helper to convert numbers and percentage symbols into natural Vietnamese spoken text.
 */
export function convertNumbersToWordsVietnamese(text: string): string {
  let s = text;

  // Percentage e.g. 50% -> năm mươi phần trăm
  s = s.replace(/(\d+)\s*%/g, (_, n) => `${numberToVietnamese(parseInt(n, 10))} phần trăm`);

  // Floating numbers e.g. 5.5 -> năm chấm năm
  s = s.replace(/(\d+)\.(\d+)/g, (_, a, b) => `${numberToVietnamese(parseInt(a, 10))} chấm ${numberToVietnamese(parseInt(b, 10))}`);

  // Whole numbers
  s = s.replace(/\b(\d+)\b/g, (match) => {
    const num = parseInt(match, 10);
    if (!isNaN(num) && num >= 0 && num <= 9999999) {
      return numberToVietnamese(num);
    }
    return match;
  });

  // Common acronyms
  s = s.replace(/\bAI\b/g, "ây ai");
  s = s.replace(/\bAPI\b/g, "ây pi ai");

  return s;
}

function numberToVietnamese(n: number): string {
  if (n === 0) return "không";
  const ones = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

  if (n < 10) return ones[n];
  if (n === 10) return "mười";
  if (n < 20) {
    const unit = n % 10;
    if (unit === 5) return "mười lăm";
    return `mười ${ones[unit]}`.trim();
  }
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    const tenStr = ten === 1 ? "mười" : `${ones[ten]} mươi`;
    let unitStr = ones[unit];
    if (unit === 1) unitStr = "mốt";
    if (unit === 5) unitStr = "lăm";
    return unit === 0 ? tenStr : `${tenStr} ${unitStr}`;
  }
  if (n < 1000) {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    const hundredStr = `${ones[hundred]} trăm`;
    if (remainder === 0) return hundredStr;
    if (remainder < 10) return `${hundredStr} linh ${ones[remainder]}`;
    return `${hundredStr} ${numberToVietnamese(remainder)}`;
  }
  if (n < 1000000) {
    const thousand = Math.floor(n / 1000);
    const remainder = n % 1000;
    const thousandStr = `${numberToVietnamese(thousand)} nghìn`;
    if (remainder === 0) return thousandStr;
    return `${thousandStr} ${numberToVietnamese(remainder)}`;
  }
  const million = Math.floor(n / 1000000);
  const remainder = n % 1000000;
  const millionStr = `${numberToVietnamese(million)} triệu`;
  if (remainder === 0) return millionStr;
  return `${millionStr} ${numberToVietnamese(remainder)}`;
}

function escapeJson(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}
