/**
 * Reusable Motion & UI Components for HyperFrames HTML Video Rendering
 */

export interface BadgeOptions {
  icon?: string;
  text: string;
  themeColor?: string;
}

export function renderBadge(options: BadgeOptions): string {
  const icon = options.icon || "⚡";
  const text = escapeHtml(options.text);
  return `
<div class="tier-top-badge motion-3attr-badge">
  <span class="badge-icon">${icon}</span>
  <span class="badge-text">${text}</span>
</div>`.trim();
}

export interface HeadlineOptions {
  text: string;
  subhead?: string;
  shimmer?: boolean;
}

export function renderHeadline(options: HeadlineOptions): string {
  const text = escapeHtml(options.text);
  const subhead = options.subhead ? `<div class="hook-subhead motion-3attr-subhead">${escapeHtml(options.subhead)}</div>` : "";
  const shimmerClass = options.shimmer !== false ? "shimmer-sweep-target" : "";

  return `
<h1 class="tier-top-headline motion-3attr-headline ${shimmerClass}">${text}</h1>
${subhead}`.trim();
}

export interface MockupLaptopOptions {
  domain: string;
  innerHtml: string;
}

export function renderMockupLaptop(options: MockupLaptopOptions): string {
  const domain = escapeHtml(options.domain || "github.com");
  return `
<div class="mockup-laptop motion-3attr-mockup">
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
        <span>https://${domain}</span>
      </div>
    </div>
    <div class="mockup-laptop-screen">
      ${options.innerHtml}
    </div>
  </div>
  <div class="mockup-laptop-base"></div>
</div>`.trim();
}

export function renderDynamicMeshBackground(): string {
  return `
<div class="dynamic-mesh-bg parallax-mesh">
  <div class="mesh-orb mesh-orb-1"></div>
  <div class="mesh-orb mesh-orb-2"></div>
  <div class="mesh-orb mesh-orb-3"></div>
  <div class="mesh-orb mesh-orb-4"></div>
  <div class="tech-grid-overlay"></div>
  <div class="vignette-radial"></div>
</div>`.trim();
}

export function renderWaveformBars(): string {
  return `
<div class="waveform-anim">
  <span class="w-bar bar-1"></span>
  <span class="w-bar bar-2"></span>
  <span class="w-bar bar-3"></span>
  <span class="w-bar bar-4"></span>
  <span class="w-bar bar-5"></span>
  <span class="w-bar bar-6"></span>
  <span class="w-bar bar-7"></span>
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
