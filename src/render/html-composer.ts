import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Script, TemplateDataType } from "./script-schema.js";
import type { TiktokConfig } from "../config.js";
import { renderKaraokeHtml } from "./karaoke-timing.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TPL_DIR = join(__dirname, "templates");

// Grain overlay HTML inline (from installed component)
const GRAIN_OVERLAY_HTML = `<div id="grain-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100;"><div class="grain-texture"></div></div>`;

// Vignette — darkens far edges so content doesn't feel like it's floating in a flat void.
const VIGNETTE_HTML = `<div class="vignette"></div>`;

// Default TikTok config (used if not passed)
const DEFAULT_TIKTOK: TiktokConfig = {
  displayName: "Code Suy 24h 🔱",
  handle: "@codesuy24h",
  followers: "2x followers",
};

export interface SceneAudio {
  id: string;
  durationSec: number;
}

export interface ComposeArgs {
  script: Script;
  sceneAudio: SceneAudio[];
  gapSec: number;
  bgImageRelPath: string | null; // null => no image available
  audioRelPath: string;
  /** TikTok follow card config (injected into outro scene). Optional — defaults used if omitted. */
  tiktok?: TiktokConfig;
  /** Relative path to avatar image inside the output dir (e.g. "tiktok-avatar.jpg"). */
  tiktokAvatarRelPath?: string;
  /** Extra seconds added to outro scene visual duration after voice ends (TikTok card hold). Default 3. */
  outroHoldSec?: number;
}

export function composeHtml(args: ComposeArgs): string {
  const { script, sceneAudio, gapSec, bgImageRelPath, audioRelPath } = args;
  const tiktok = args.tiktok ?? DEFAULT_TIKTOK;
  const tiktokAvatar = args.tiktokAvatarRelPath ?? "tiktok-avatar.jpg";
  const outroHoldSec = args.outroHoldSec ?? 3;

  // Compute timing per scene
  let cursor = 0;
  const timing = script.scenes.map((scene) => {
    const audio = sceneAudio.find((a) => a.id === scene.id);
    if (!audio) throw new Error(`No audio entry for scene id=${scene.id}`);
    const isOutro = scene.type === "outro";
    const dur = audio.durationSec + gapSec + (isOutro ? outroHoldSec : 0);
    const start = cursor;
    cursor += dur;
    return { scene, start, duration: dur };
  });
  const totalDuration = cursor;

  // Render scenes
  const sceneHtml = timing
    .map(({ scene, start, duration }) => {
      return renderScene(scene, start, duration, bgImageRelPath, tiktok, tiktokAvatar, script.metadata);
    })
    .join("\n");

  // Persistent shell — uses tiktok handle in footer
  const shellHtml = renderShell(script.metadata, tiktok);

  const animJs = readFileSync(join(TPL_DIR, "animations.js"), "utf8");
  const tpl = readFileSync(join(TPL_DIR, "base.html.tmpl"), "utf8");

  return tpl
    .replace("{{TITLE}}", escapeHtml(script.metadata.title))
    .replace(/\{\{TOTAL_DURATION\}\}/g, totalDuration.toFixed(2))
    .replace("{{SHELL}}", shellHtml)
    .replace("{{SCENES}}", sceneHtml)
    .replace(/src="voice\.mp3"/g, `src="${audioRelPath}"`)
    .replace('<script src="animations.js"></script>', `<script>\n${animJs}\n</script>`);
}

// ── PERSISTENT SHELL ───────────────────────────────────────────────────────
function renderShell(metadata: Script["metadata"], tiktok: TiktokConfig): string {
  const channel = escapeHtml(metadata.channel);
  const domain = escapeHtml(metadata.source.domain);
  const handle = escapeHtml(tiktok.handle);
  return `
<!-- Shell: persistent brand elements (no data-start → always visible) -->
<div class="shell-bg"></div>

<div class="brand-shell-header">
  <div class="brand-icon">&gt;_</div>
  <div class="brand-text">
    <div class="brand-name">${channel}</div>
    <div class="brand-tag">BLOG IT</div>
  </div>
</div>

<div class="brand-shell-handle">
  <span class="handle-music">&#9835;</span>
  <span class="handle-text">${handle}</span>
</div>

<div class="brand-shell-keyword">
  <span>${escapeHtml(domain)}</span>
</div>

${VIGNETTE_HTML}
${GRAIN_OVERLAY_HTML}`.trim();
}

// ── SCENE DISPATCH ─────────────────────────────────────────────────────────
function renderScene(
  scene: Script["scenes"][number],
  start: number,
  duration: number,
  bgImageRelPath: string | null,
  tiktok: TiktokConfig,
  tiktokAvatarRelPath: string,
  metadata: Script["metadata"],
): string {
  const td = scene.templateData;
  const domain = metadata.source.domain;

  let bgHtml = "";
  let topTierHtml = "";
  let midInner = "";
  let layoutName = td.template;

  switch (td.template) {
    case "hook": {
      layoutName = "hook";
      const headline = escapeHtml(td.headline);
      const subhead = td.subhead ? escapeHtml(td.subhead) : "";

      const hasImage = Boolean(td.bgSrc && bgImageRelPath);
      if (hasImage) {
        const kbClass = td.kenBurns ?? "zoom-in";
        bgHtml = `<div class="bg kb-${kbClass}" style="background-image: url('${bgImageRelPath}')"></div>`;
      } else {
        bgHtml = `<div class="bg gradient-news-dark"></div>`;
      }
      const overlayHtml = hasImage ? `<div class="overlay" style="opacity: 0.55"></div>` : "";
      bgHtml += overlayHtml;

      topTierHtml = `
<div class="tier-top-badge">
  <span class="badge-icon">🔥</span>
  <span class="badge-text">TIN NÓNG ĐỘT PHÁ</span>
</div>
<h1 class="hook-headline shimmer-sweep-target">${headline}</h1>
${subhead ? `<div class="hook-subhead">${subhead}</div>` : ""}`.trim();

      const scrollContent = bgImageRelPath
        ? `<div class="mockup-scroll-track"><img src="${escapeHtml(bgImageRelPath)}" class="mockup-scroll-img" alt="Web Preview" /></div>`
        : `<div class="mockup-code-screen"><div class="mockup-code-content">&gt; ${escapeHtml(headline)}<br/><span style="color:#00f0ff;">// ${escapeHtml(subhead || "Tin tức công nghệ")}</span></div></div>`;

      midInner = renderMockupLaptop(
        domain,
        `${scrollContent}
        <div class="mockup-screen-badge">LIVE PREVIEW</div>`
      );
      break;
    }

    case "stat-hero": {
      layoutName = "stat-hero";
      const context = td.context ? `<div class="stat-context">${escapeHtml(td.context)}</div>` : "";
      topTierHtml = `
<div class="tier-top-badge">
  <span class="badge-icon">📊</span>
  <span class="badge-text">SỐ LIỆU ĐỘT PHÁ</span>
</div>
<h1 class="tier-top-headline shimmer-sweep-target">${escapeHtml(td.label)}</h1>`.trim();

      midInner = `
<div class="layout-stat-hero">
  <div class="stat-glow-orb"></div>
  <div class="stat-value shimmer-sweep-target">${escapeHtml(td.value)}</div>
  <div class="stat-label">${escapeHtml(td.label)}</div>
  ${context}
</div>`.trim();
      break;
    }

    case "feature-list": {
      layoutName = "feature-list";
      const bullets = td.bullets
        .map(
          (b, i) =>
            `<div class="feat-bullet feat-bullet-${i}" data-idx="${i}">
      <div class="feat-dot"></div>
      <div class="feat-text">${escapeHtml(b)}</div>
    </div>`
        )
        .join("\n    ");

      topTierHtml = `
<div class="tier-top-badge">
  <span class="badge-icon">🚀</span>
  <span class="badge-text">TÍNH NĂNG NỔI BẬT</span>
</div>
<h1 class="tier-top-headline shimmer-sweep-target">${escapeHtml(td.title)}</h1>`.trim();

      midInner = `
<div class="layout-feature-list">
  <div class="feat-card">
    <div class="feat-title">${escapeHtml(td.title)}</div>
    <div class="feat-rule"></div>
    <div class="feat-bullets">
      ${bullets}
    </div>
  </div>
</div>`.trim();
      break;
    }

    case "comparison": {
      layoutName = "comparison";
      const lColor = td.left.color;
      const rColor = td.right.color;
      const winnerClass = td.right.winner ? " card-winner" : "";

      topTierHtml = `
<div class="tier-top-badge">
  <span class="badge-icon">⚖️</span>
  <span class="badge-text">BẢNG SO SÁNH</span>
</div>
<h1 class="tier-top-headline shimmer-sweep-target">${escapeHtml(td.left.label)} VS ${escapeHtml(td.right.label)}</h1>`.trim();

      midInner = `
<div class="layout-comparison">
  <div class="cmp-card cmp-left color-${lColor}">
    <div class="cmp-label">${escapeHtml(td.left.label)}</div>
    <div class="cmp-value">${escapeHtml(td.left.value)}</div>
  </div>
  <div class="cmp-vs">VS</div>
  <div class="cmp-card cmp-right color-${rColor}${winnerClass}">
    <div class="cmp-label">${escapeHtml(td.right.label)}</div>
    <div class="cmp-value">${escapeHtml(td.right.value)}</div>
    ${td.right.winner ? '<div class="cmp-winner-badge">WINNER</div>' : ""}
  </div>
</div>`.trim();
      break;
    }

    case "callout": {
      layoutName = "callout";
      const tag = td.tag ? `<div class="callout-tag">${escapeHtml(td.tag)}</div>` : "";
      topTierHtml = `
<div class="tier-top-badge">
  <span class="badge-icon">💡</span>
  <span class="badge-text">${td.tag ? escapeHtml(td.tag) : "TIÊU ĐIỂM CHÚ Ý"}</span>
</div>
<h1 class="tier-top-headline shimmer-sweep-target">${td.tag ? escapeHtml(td.tag) : "ĐIỂM NHẤN CÔNG NGHỆ"}</h1>`.trim();

      midInner = `
<div class="layout-callout">
  <div class="callout-card">
    <div class="callout-quote-icon">&ldquo;</div>
    ${tag}
    <div class="callout-statement">${escapeHtml(td.statement)}</div>
  </div>
</div>`.trim();
      break;
    }

    case "outro": {
      layoutName = "outro";
      const ttCard = renderTiktokCard(tiktok, tiktokAvatarRelPath);
      topTierHtml = `
<div class="tier-top-badge">
  <span class="badge-icon">🔔</span>
  <span class="badge-text">THEO DÕI NGAY</span>
</div>
<div class="out-cta-top">${escapeHtml(td.ctaTop)}</div>`.trim();

      midInner = `
<div class="layout-outro">
  <div class="out-channel">${escapeHtml(td.channelName)}</div>
  <div class="out-underline"></div>
  <div class="out-source">Nguồn: ${escapeHtml(td.source)}</div>
  ${ttCard}
</div>`.trim();
      break;
    }
  }

  // Bottom Tier: Dynamic Karaoke Subtitles
  const karaokeHtml = renderKaraokeHtml({
    sceneId: scene.id,
    text: scene.voiceText,
    sceneStartSec: start,
    durationSec: duration,
  });

  // Dynamic mesh gradient background
  const meshBg = `
<div class="dynamic-mesh-bg">
  <div class="mesh-orb mesh-orb-1"></div>
  <div class="mesh-orb mesh-orb-2"></div>
  <div class="mesh-orb mesh-orb-3"></div>
  <div class="tech-grid-overlay"></div>
</div>`;

  return `
<div class="scene clip" id="scene-${scene.id}"
     data-start="${start.toFixed(2)}" data-duration="${duration.toFixed(2)}" data-active="0"
     data-layout="${layoutName}">
  ${meshBg}
  ${bgHtml}
  <div class="scene-stacked">
    <div class="tier-top">
      ${topTierHtml}
    </div>
    <div class="tier-mid">
      ${midInner}
    </div>
    <div class="tier-bot">
      ${karaokeHtml}
      <div class="waveform-anim">
        <span class="w-bar bar-1"></span>
        <span class="w-bar bar-2"></span>
        <span class="w-bar bar-3"></span>
        <span class="w-bar bar-4"></span>
        <span class="w-bar bar-5"></span>
      </div>
    </div>
  </div>
</div>`.trim();
}

// ── MOCKUP RENDERING ───────────────────────────────────────────────────────
function renderMockupLaptop(domain: string, innerScreenHtml: string): string {
  return `
<div class="mockup-laptop">
  <div class="mockup-laptop-lid">
    <div class="mockup-laptop-notch">
      <div class="mockup-laptop-camera"></div>
    </div>
    <div class="mockup-browser-header">
      <div class="mockup-browser-dots">
        <span class="mockup-dot red"></span>
        <span class="mockup-dot yellow"></span>
        <span class="mockup-dot green"></span>
      </div>
      <div class="mockup-browser-address">
        <span class="lock-icon">🔒</span>
        <span>https://${escapeHtml(domain || "github.com")}</span>
      </div>
    </div>
    <div class="mockup-laptop-screen">
      ${innerScreenHtml}
    </div>
  </div>
  <div class="mockup-laptop-base"></div>
</div>`.trim();
}

// ── TIKTOK FOLLOW CARD ─────────────────────────────────────────────────────
function renderTiktokCard(tiktok: TiktokConfig, avatarRelPath: string): string {
  return `
<div id="tt-card" class="tt-card">
  <img class="tt-avatar" src="${escapeHtml(avatarRelPath)}" alt="${escapeHtml(tiktok.displayName)}" crossorigin="anonymous" />
  <div class="tt-profile-info">
    <div class="tt-display-name">${escapeHtml(tiktok.displayName)}</div>
    <div class="tt-handle">${escapeHtml(tiktok.handle)}</div>
    <div class="tt-followers">${escapeHtml(tiktok.followers)}</div>
  </div>
  <div id="tt-follow-btn" class="tt-follow-btn">
    <span id="tt-btn-follow" class="tt-btn-text">Follow</span>
    <span id="tt-btn-following" class="tt-btn-text tt-btn-text-following">
      <span>Following</span>
      <span class="tt-check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
    </span>
  </div>
</div>`.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
