import axios from "axios";
import type { Script } from "../render/script-schema.js";
import { ScriptSchema } from "../render/script-schema.js";
import type { ScrapedArticle } from "../scraper/web-scraper.js";
import { normalizeTheme, type VideoTheme } from "../config.js";
import { log } from "../utils/logger.js";

export interface GenerateScriptOptions {
  geminiApiKey?: string;
  provider?: string;
  voiceId?: string;
  channelName?: string;
}

/**
 * Automatically detects the best video theme based on article content, keywords, and domain.
 */
export function detectBestTheme(article: ScrapedArticle): VideoTheme {
  const text = `${article.title} ${article.url} ${article.description || ""} ${article.content.slice(0, 3000)}`.toLowerCase();

  // 1. Crimson Beast (Urgent, Vulnerabilities, Zero-days, Security breaches, Disasters, Tech drama)
  if (
    /zero-day|cve-|vulnerability|exploit|ransomware|data breach|cyberattack|critical bug|lỗ hổng|tấn công mạng|mã độc|nguy hiểm|khẩn cấp|sập mạng|scam|lừa đảo|drama/i.test(
      text
    )
  ) {
    return "crimson-beast";
  }

  // 2. Matrix Code (Hacker tools, Dev tools, Pentesting, Linux, Terminal, CLI, Backend systems, Low-level code)
  if (
    /secmon|security|firewall|wireshark|suricata|nmap|reverse engineering|malware|pentest|bảo mật|an ninh|terminal|cli|bash|shell|linux|kernel|sysadmin|devops|docker|kubernetes|rust|golang|c\+\+|compiler|git/i.test(
      text
    )
  ) {
    return "matrix-code";
  }

  // 3. Sunset Vibes (AI, LLMs, Neural Nets, Computer Vision, Design, Frontend, UI/UX, Mobile apps)
  if (
    /ai|llm|gpt|gemini|claude|deepseek|openai|model|neural|diffusion|machine learning|trí tuệ nhân tạo|design|ui|ux|frontend|react|vue|svelte|tailwind|css|mobile|flutter|swift|creative/i.test(
      text
    )
  ) {
    return "sunset-vibes";
  }

  // 4. Light Pro (Finance, Business, Fintech, Startups, Corporate, Economy, Official journalism)
  if (
    /finance|fintech|banking|stock|investment|economy|business|startup|revenue|tài chính|kinh tế|doanh nghiệp|ngân hàng|chứng khoán|đầu tư|thị trường|báo cáo|ceo/i.test(
      text
    )
  ) {
    return "light-pro";
  }

  // 5. Dark Neon (Cloud Enterprise, Big Data, Databases, Distributed architecture, Backend servers)
  if (
    /cloud|aws|azure|gcp|database|sql|postgres|mongodb|redis|kafka|architecture|máy chủ|hệ thống lớn|enterprise|server/i.test(
      text
    )
  ) {
    return "dark-neon";
  }

  // Default theme: Cyberpunk (Futuristic, gadgets, new frameworks, general tech hype)
  return "cyberpunk";
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
      const sanitized = sanitizeScriptData(geminiScript);
      const validated = ScriptSchema.parse(sanitized);
      log.info(`Gemini generated valid script with ${validated.scenes.length} scenes.`);
      return validated;
    } catch (err) {
      log.warn(`Gemini script generation failed (${err}), falling back to built-in generator.`);
    }
  }

  // Built-in intelligent generator (offline fallback)
  log.info("Using built-in intelligent script synthesizer...");
  const script = synthesizeFallbackScript(article, { channel, provider, voiceId });
  const sanitizedFallback = sanitizeScriptData(script);
  return ScriptSchema.parse(sanitizedFallback);
}

/**
 * Sanitizes templateData string fields to ensure strict adherence to Zod schema limits.
 */
export function sanitizeScriptData(data: any): any {
  if (!data || typeof data !== "object") return data;
  if (data.metadata) {
    if (data.metadata.title) data.metadata.title = String(data.metadata.title).slice(0, 80);
    if (data.metadata.channel) data.metadata.channel = String(data.metadata.channel).slice(0, 40);
    if (data.metadata.recommendedTheme) {
      try {
        data.metadata.recommendedTheme = normalizeTheme(String(data.metadata.recommendedTheme));
      } catch {
        delete data.metadata.recommendedTheme;
      }
    }
  }
  if (Array.isArray(data.scenes)) {
    data.scenes = data.scenes.map((scene: any) => {
      if (!scene || typeof scene !== "object") return scene;
      const td = scene.templateData;
      if (td && typeof td === "object") {
        if (td.template === "hook") {
          if (td.headline) td.headline = String(td.headline).slice(0, 40);
          if (td.subhead) td.subhead = String(td.subhead).slice(0, 40);
        } else if (td.template === "stat-hero") {
          if (td.value) td.value = String(td.value).slice(0, 20);
          if (td.label) td.label = String(td.label).slice(0, 40);
          if (td.context) td.context = String(td.context).slice(0, 50);
        } else if (td.template === "feature-list") {
          if (td.title) td.title = String(td.title).slice(0, 40);
          if (Array.isArray(td.bullets)) {
            td.bullets = td.bullets.map((b: any) => String(b).slice(0, 50)).slice(0, 4);
          }
        } else if (td.template === "comparison") {
          if (td.left) {
            if (td.left.label) td.left.label = String(td.left.label).slice(0, 30);
            if (td.left.value) td.left.value = String(td.left.value).slice(0, 20);
          }
          if (td.right) {
            if (td.right.label) td.right.label = String(td.right.label).slice(0, 30);
            if (td.right.value) td.right.value = String(td.right.value).slice(0, 20);
          }
        } else if (td.template === "callout") {
          if (td.statement) td.statement = String(td.statement).slice(0, 80);
          if (td.tag) td.tag = String(td.tag).slice(0, 20);
        } else if (td.template === "outro") {
          if (td.ctaTop) td.ctaTop = String(td.ctaTop).slice(0, 30);
          if (td.channelName) td.channelName = String(td.channelName).slice(0, 30);
          if (td.source) td.source = String(td.source).slice(0, 40);
        }
      }
      return scene;
    });
  }
  return data;
}

async function callGeminiApi(
  article: ScrapedArticle,
  apiKey: string,
  meta: { channel: string; provider: string; voiceId: string }
): Promise<unknown> {
  const prompt = `
Bạn là Đạo diễn & Biên kịch Video Triệu View chuyên về Công nghệ & Lập trình cho TikTok / Reels / Shorts.
Nhiệm vụ: Tạo một kịch bản video dọc 9:16 (tổng thời lượng giọng đọc khoảng 40 - 55 giây) cực kỳ cuốn hút, giữ chân người xem từ giây đầu tiên, dựa trên tài liệu sau:

TIÊU ĐỀ: ${article.title}
DOMAIN: ${article.domain}
NỘI DUNG CHI TIẾT DỰ ÁN / BÀI VIẾT:
${article.content.slice(0, 3500)}

════════════════════════════════════════════════════════════════════════════
🎯 CHIẾN LƯỢC NỘI DUNG VIRAL BẮT BUỘC (PHONG CÁCH TIKTOK TRIỆU VIEW):
════════════════════════════════════════════════════════════════════════════
1. CẢNH HOOK (0 - 8 giây) - QUYẾT ĐỊNH 90% TỶ LỆ GIỮ CHÂN (RETENTION):
   - BẮT BUỘC ÁP DỤNG KỸ THUẬT NGẮT DÒNG CHÚ Ý (Pattern Interrupt) NGAY TỪ GIÂY THỨ NHẤT!
   - TUYỆT ĐỐI CẤM mở đầu nhàm chán như "Hôm nay chúng ta...", "Đây là dự án...", "Chào mừng các bạn...".
   - Hãy chọn 1 trong 4 công thức Hook giật gân, cuốn hút tột đỉnh sau:
     • [Cảnh báo sốc]: "Dừng lại ba giây! Nếu bạn đang làm dev hay vận hành máy chủ, coi chừng mất việc chỉ vì một lỗ hổng sơ đẳng này! Nhưng may thay, siêu công cụ nguồn mở này vừa xuất hiện..."
     • [Bí mật không tưởng]: "Bạn có tin được không? Chỉ với một công cụ mã nguồn mở hoàn toàn miễn phí này, bạn có thể giải quyết dứt điểm vấn đề nhức nhối mà các giải pháp nghìn đô cũng phải chào thua!"
     • [Chao đảo giới công nghệ]: "Cả cộng đồng công nghệ đang phát sốt vì dự án mã nguồn mở vừa ra mắt! Thứ này thông minh đến mức sẽ thay đổi hoàn toàn cách chúng ta lập trình và bảo mật..."
     • [Nỗi đau nhức nhối]: "Bạn đã bao giờ thức trắng đêm để cứu hỏa sự cố chưa? Đừng lãng phí thanh xuân nữa, vì siêu vũ khí mã nguồn mở này sẽ tự động gánh hết cho bạn!"
   - headline: Giật tít cực sốc, viết hoa toàn bộ, dùng từ kích thích tò mò (tối đa 35 ký tự).
   - subhead: Khẳng định sức mạnh giải pháp (tối đa 35 ký tự).
   - voiceText: 2 câu dồn dập, sắc bén, kích thích adrenaline (24 - 32 từ).

2. CẢNH BODY-1 (8 - 18 giây) - ĐỘT PHÁ CÔNG NGHỆ / SỨC MẠNH CỐT LÕI (template: stat-hero):
   - Nêu bật công nghệ độc đáo nhất hoặc giải pháp thông minh (Ví dụ: AI LLM, Kill Chain, Zero-Day, Real-Time...).
   - value: Từ khóa hoặc con số to khổng lồ (Ví dụ: "AI LLM", "KILL CHAIN", "24/7", "REAL-TIME", "0-DAY").
   - label: Định danh sức mạnh (tối đa 35 ký tự).
   - context: Bối cảnh giải pháp (tối đa 45 ký tự).
   - voiceText: 2 - 3 câu giải thích tại sao công nghệ này lại thay đổi cuộc chơi (25 - 35 từ).

3. CẢNH BODY-2 (18 - 30 giây) - 3 TÍNH NĂNG ĐẮT GIÁ NHẤT (template: feature-list):
   - title: Tiêu đề mạnh mẽ (tối đa 35 ký tự).
   - bullets: Đúng 3 gạch đầu dòng rõ ràng, sắc nét, mỗi dòng từ 5 - 8 từ (tối đa 45 ký tự mỗi dòng).
   - voiceText: Đọc diễn giải 3 tính năng một cách tự nhiên, mạch lạc, hào hứng (30 - 40 từ).

4. CẢNH BODY-3 (30 - 42 giây) - TẦM ẢNH HƯỞNG & ĐÁNH GIÁ CHUYÊN MÔN (template: callout):
   - statement: Nhận định sắc bén, khẳng định vị thế dự án / bài viết (tối đa 70 ký tự).
   - tag: Nhãn chứng nhận (Ví dụ: "Đột phá bảo mật", "Must-Have", "Đánh giá an ninh", tối đa 18 ký tự).
   - voiceText: Lời bình luận chuyên sâu, truyền cảm hứng cho lập trình viên và kỹ sư (25 - 35 từ).

5. CẢNH OUTRO (42 - 50 giây) - KÊU GỌI HÀNH ĐỘNG DỨT KHOÁT (template: outro):
   - ctaTop: "Theo dõi ngay"
   - channelName: "${escapeJson(meta.channel)}"
   - source: "${escapeJson(article.domain)}"
   - voiceText: Lời kêu gọi follow kênh tự nhiên, dứt khoát để không bỏ lỡ công nghệ mới mỗi ngày (18 - 25 từ).

6. TỰ ĐỘNG CHỌN GIAO DIỆN (THEME) PHÙ HỢP CHO METADATA ("recommendedTheme"):
   Hãy phân tích nội dung bài viết và chọn duy nhất 1 trong 6 theme sau:
   - "matrix-code": Bài viết về an ninh mạng, bảo mật, hacker, Linux, terminal CLI, dev tool, backend code.
   - "sunset-vibes": Bài viết về AI, LLM, Computer Vision, Frontend, React, Mobile app, Design, UI/UX.
   - "crimson-beast": Bài viết về lỗ hổng Zero-day, cảnh báo bảo mật nguy hiểm, ransomware, tech drama.
   - "light-pro": Bài viết về tài chính, kinh doanh số, doanh nghiệp B2B, tin tức kinh tế, startup.
   - "dark-neon": Bài viết về Cloud, cơ sở dữ liệu, kiến trúc hệ thống, server enterprise.
   - "cyberpunk": Bài viết về công nghệ tương lai, robots, gadgets, tin tức công nghệ tổng hợp.

════════════════════════════════════════════════════════════════════════════
🔊 QUY TẮC NGỮ ÂM CHO voiceText (ĐỌC BỞI TTS TIẾNG VIỆT):
════════════════════════════════════════════════════════════════════════════
- Đọc văn nói tự nhiên, truyền cảm, dứt khoát. KHÔNG dùng emoji, markdown, bullet point trong voiceText.
- PHIÊN ÂM TOÀN BỘ TỪ TIẾNG ANH & THUẬT NGỮ CHUYÊN NGÀNH sang âm đọc tiếng Việt chuẩn:
  • "AI" -> "ây ai"
  • "LLM" -> "eo eo em"
  • "SecMon" -> "Séc Mon"
  • "GitHub" -> "Gít húp"
  • "Python" -> "Pi thon"
  • "Nginx" -> "en gin ích"
  • "Apache" -> "A pa che"
  • "Kill Chain" -> "Kin Chên"
  • "Web server" -> "oét xơ vơ"
  • "Log" -> "lốc"
  • "Incident Response" -> "phản ứng sự cố"
- PHIÊN ÂM TOÀN BỘ SỐ VÀ KÝ HIỆU:
  • "30s" -> "ba mươi giây"
  • "100%" -> "một trăm phần trăm"
  • "24/7" -> "hai mươi bốn trên bảy"
- Kết thúc mỗi câu trong voiceText bằng dấu chấm hoặc dấu chấm hỏi.

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
    "channel": "${escapeJson(meta.channel)}",
    "recommendedTheme": "matrix-code"
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
      "voiceText": "Theo dõi ${escapeJson(meta.channel)} để xem những công nghệ đột phá mỗi ngày.",
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

    const isSecurity = /secmon|security|attack|incident|monitor|bảo mật|an ninh|firewall/i.test(article.url + article.title + article.content);
    
    // Extract stars & language if present
    const starsMatch = article.content.match(/Số sao:\s*(\d+)/i) || article.content.match(/(\d+)\s*stars/i);
    const starsNum = starsMatch ? parseInt(starsMatch[1], 10) : 0;
    
    let starsDisplay = "TOP 1 ⚡";
    let starsSpoken = "công nghệ đột phá hàng đầu";
    let heroLabel = "Đột phá công nghệ";

    if (isSecurity) {
      starsDisplay = "AI SEC 🛡️";
      starsSpoken = "hệ thống giám sát an ninh và phản ứng sự cố tự động";
      heroLabel = "An ninh máy chủ Web";
    } else if (starsNum > 1000) {
      starsDisplay = `${Math.round(starsNum / 1000)}K+ ⭐`;
      starsSpoken = `${Math.round(starsNum / 1000)} nghìn lượt gắn sao trên Gít húp`;
      heroLabel = "Cộng đồng lập trình";
    }

    const langMatch = article.content.match(/Ngôn ngữ chính:\s*([^\n]+)/i);
    const mainLang = (langMatch?.[1] || "Python").trim();

    const hookVoice = isSecurity
      ? `Dừng lại ba giây! Máy chủ oét của bạn có thể bị thâm nhập chỉ trong ba mươi giây mà không hề hay biết! Hãy cùng khám phá siêu vũ khí an ninh nguồn mở ${repoName}!`
      : `Dừng lại ba giây! Đây là dự án mã nguồn mở cực đỉnh đang làm chao đảo giới công nghệ mà bạn nhất định phải biết: ${repoName}!`;

    const body1Voice = isSecurity
      ? `Dự án mang đến ${starsSpoken}, giúp tương quan chuỗi tấn công mạng và giải thích cảnh báo bằng trí tuệ nhân tạo.`
      : `Dự án được đánh giá là ${starsSpoken}, trở thành nền tảng lập trình mã nguồn mở vô cùng ấn tượng.`;

    const body2Bullets = isSecurity
      ? [
          "Giám sát máy chủ Apache và Nginx",
          "Tương quan chuỗi tấn công mạng",
          "Phản ứng sự cố tức thì với AI",
        ]
      : [
          `Ngôn ngữ tối ưu: ${mainLang}`,
          "Kiến trúc module hóa hiện đại",
          "Hiệu năng cao và dễ dàng mở rộng",
        ];

    const body3Statement = isSecurity
      ? "Hệ thống an ninh máy chủ web phản ứng sự cố thông minh."
      : "Giải pháp mã nguồn mở định hình tương lai phần mềm.";

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
        recommendedTheme: detectBestTheme(article),
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
          voiceText: convertNumbersToWordsVietnamese(hookVoice),
          templateData: {
            template: "hook",
            headline: repoName,
            subhead: isSecurity ? "Hệ thống an ninh máy chủ Web" : `Dự án GitHub Hot bởi ${ownerName}`,
            bgSrc: article.ogImage ? "$source.image" : undefined,
            kenBurns: "zoom-in",
          },
        },
        {
          id: "body-1",
          type: "body",
          voiceText: convertNumbersToWordsVietnamese(body1Voice),
          templateData: {
            template: "stat-hero",
            value: starsDisplay,
            label: heroLabel,
            context: isSecurity ? "Tương quan chuỗi tấn công tự động" : "Mã nguồn mở thịnh hành",
          },
        },
        {
          id: "body-2",
          type: "body",
          voiceText: convertNumbersToWordsVietnamese(
            isSecurity
              ? "Hệ thống sở hữu ba tính năng then chốt: giám sát toàn diện máy chủ web, tương quan chuỗi tấn công, và phản ứng sự cố tức thì bằng trí tuệ nhân tạo."
              : `Dự án sở hữu ba điểm sáng nổi bật: tối ưu với ngôn ngữ ${mainLang}, kiến trúc module hóa hiện đại, và hệ sinh thái mở rộng vô cùng mạnh mẽ.`
          ),
          templateData: {
            template: "feature-list",
            title: isSecurity ? "Tính năng bảo mật" : "Điểm sáng cốt lõi",
            bullets: body2Bullets,
            icon: "spark",
          },
        },
        {
          id: "body-3",
          type: "body",
          voiceText: convertNumbersToWordsVietnamese(
            isSecurity
              ? "Đây là giải pháp an ninh mạng đột phá giúp bảo vệ máy chủ web an toàn trước các đợt tấn công nguy hiểm trong năm nay."
              : "Một dự án công nghệ mã nguồn mở rất đáng chú ý và mang lại giá trị thực chiến lớn cho các kỹ sư phần mềm."
          ),
          templateData: {
            template: "callout",
            statement: body3Statement,
            tag: isSecurity ? "Bảo mật máy chủ" : "Đánh giá chuyên môn",
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
      recommendedTheme: detectBestTheme(article),
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
        voiceText: convertNumbersToWordsVietnamese(`Dừng lại ba giây! ${cleanTitle} vừa chính thức ra mắt và đang làm chao đảo giới công nghệ với hàng loạt đột phá không tưởng!`),
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
