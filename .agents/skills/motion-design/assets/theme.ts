import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface BrandConfig {
  name: string;
  handle: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    bgDeep?: string;
    surface?: string;
  };
  fonts?: {
    display?: string;
    body?: string;
    code?: string;
  };
  logo?: string;
}

export const EASING = {
  // Spring physics
  springOvershoot: "back.out(1.8)",
  springSubtle: "back.out(1.2)",
  springElastic: "elastic.out(1, 0.4)",

  // Cubic Bezier curves (CSS & GSAP)
  cubicSmooth: "cubic-bezier(0.16, 1, 0.3, 1)",
  cubicSnappy: "cubic-bezier(0.25, 1, 0.5, 1)",
  cubicSlowStart: "cubic-bezier(0.7, 0, 0.84, 0)",
};

export const DEFAULT_THEME = {
  colors: {
    primary: "#ffe600",
    secondary: "#00f0ff",
    accent: "#ff0055",
    bgDeep: "#070b14",
    surface: "rgba(15, 23, 42, 0.75)",
    textPrimary: "#ffffff",
    textMuted: "#94a3b8",
  },
  fonts: {
    display: "'Bebas Neue', 'Montserrat', sans-serif",
    body: "'Be Vietnam Pro', 'Inter', sans-serif",
    code: "'JetBrains Mono', 'Courier New', monospace",
  },
  spacing: {
    safeTop: 140,
    safeBottom: 320,
    safeLeft: 60,
    safeRight: 100,
  },
  durations: {
    badgeIn: 0.4,
    headlineIn: 0.55,
    shimmerSweep: 0.85,
    cardIn: 0.5,
    staggerItem: 0.08,
  },
  easing: EASING,
};

export function loadBrandKit(rootDir: string = process.cwd()): BrandConfig | null {
  const brandFile = join(rootDir, "brand.config.json");
  if (!existsSync(brandFile)) return null;
  try {
    const raw = readFileSync(brandFile, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function resolveTheme(rootDir: string = process.cwd()) {
  const brand = loadBrandKit(rootDir);
  if (!brand) return DEFAULT_THEME;

  return {
    ...DEFAULT_THEME,
    colors: {
      ...DEFAULT_THEME.colors,
      ...(brand.colors || {}),
    },
    fonts: {
      ...DEFAULT_THEME.fonts,
      ...(brand.fonts || {}),
    },
  };
}
