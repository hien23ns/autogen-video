import axios from "axios";

export interface ScrapedArticle {
  url: string;
  domain: string;
  title: string;
  description: string;
  content: string;
  ogImage: string | null;
}

/**
 * Scrapes metadata and core content from a news article or GitHub repository.
 */
export async function scrapeUrl(targetUrl: string): Promise<ScrapedArticle> {
  const urlObj = new URL(targetUrl);
  const domain = urlObj.hostname.replace(/^www\./, "");

  // GitHub repository special handling
  if (domain === "github.com") {
    const parts = urlObj.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const [owner, repo] = parts;
      return scrapeGitHubRepo(owner, repo, targetUrl);
    }
  }

  // General web page scraping
  return scrapeWebPage(targetUrl, domain);
}

async function scrapeGitHubRepo(
  owner: string,
  repo: string,
  url: string
): Promise<ScrapedArticle> {
  const ogImage = `https://opengraph.githubassets.com/1/${owner}/${repo}`;
  let title = `${owner}/${repo}`;
  let description = `Dự án mã nguồn mở ${repo} trên GitHub bởi ${owner}.`;
  let content = description;

  try {
    const res = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        "User-Agent": "auto-news-video-scraper",
        Accept: "application/vnd.github.v3+json",
      },
      timeout: 8000,
    });
    if (res.status === 200 && res.data) {
      const data = res.data;
      title = `${data.name}: ${data.description || "Dự án GitHub mới"}`;
      description = data.description || description;
      content = `Dự án: ${data.full_name}\nMô tả: ${data.description || "Không có mô tả"}\nNgôn ngữ chính: ${data.language || "Đa ngôn ngữ"}\nSố sao: ${data.stargazers_count || 0} stars\nForks: ${data.forks_count || 0}\nTopics: ${(data.topics || []).join(", ")}`;
    }
  } catch {
    // If GitHub API rate limits or errors, fallback to web HTML scrape
    try {
      const page = await scrapeWebPage(url, "github.com");
      return {
        ...page,
        ogImage: page.ogImage || ogImage,
      };
    } catch {
      // Use fallback
    }
  }

  return {
    url,
    domain: "github.com",
    title,
    description,
    content,
    ogImage,
  };
}

async function scrapeWebPage(url: string, domain: string): Promise<ScrapedArticle> {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "vi,en-US;q=0.9,en;q=0.8",
    },
    timeout: 10000,
  });

  const html = typeof res.data === "string" ? res.data : String(res.data);

  // Extract meta og tags
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const rawTitle = ogTitleMatch?.[1] || titleTagMatch?.[1] || "Tin tức công nghệ mới";
  const title = decodeHtmlEntities(rawTitle.trim());

  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const description = ogDescMatch ? decodeHtmlEntities(ogDescMatch[1].trim()) : "";

  const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  let ogImage = ogImgMatch ? ogImgMatch[1].trim() : null;
  if (ogImage && !ogImage.startsWith("http")) {
    try {
      ogImage = new URL(ogImage, url).toString();
    } catch {
      ogImage = null;
    }
  }

  // Clean body text
  const cleanBody = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const content = description ? `${description}\n\n${cleanBody.slice(0, 3000)}` : cleanBody.slice(0, 3000);

  return {
    url,
    domain,
    title,
    description,
    content,
    ogImage,
  };
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ");
}
