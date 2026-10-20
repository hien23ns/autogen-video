import { z } from "zod";

// ── 1. Original 6 Templates (Preserved 100% backward compatibility) ────────

const HookData = z.object({
  template: z.literal("hook"),
  headline: z.string().min(1).max(40),
  subhead: z.string().max(40).optional(),
  /** background image path (literal "$source.image" → substituted at pipeline level) */
  bgSrc: z.string().optional(),
  /** Ken Burns effect class */
  kenBurns: z.enum(["zoom-in", "zoom-out", "pan-left", "pan-right"]).default("zoom-in"),
});

const ComparisonSide = z.object({
  label: z.string().min(1).max(30),
  value: z.string().min(1).max(20),
  color: z.enum(["cyan", "purple"]),
});

const ComparisonData = z.object({
  template: z.literal("comparison"),
  left: ComparisonSide,
  right: ComparisonSide.extend({ winner: z.boolean().optional() }),
});

const StatHeroData = z.object({
  template: z.literal("stat-hero"),
  value: z.string().min(1).max(20),
  label: z.string().min(1).max(40),
  context: z.string().max(50).optional(),
});

const FeatureListData = z.object({
  template: z.literal("feature-list"),
  title: z.string().min(1).max(40),
  bullets: z.array(z.string().min(1).max(50)).min(1).max(4),
  icon: z.string().optional(),
});

const CalloutData = z.object({
  template: z.literal("callout"),
  statement: z.string().min(1).max(80),
  tag: z.string().max(20).optional(),
});

const OutroData = z.object({
  template: z.literal("outro"),
  ctaTop: z.string().min(1).max(30),
  channelName: z.string().min(1).max(30),
  source: z.string().min(1).max(40),
});

// ── 2. 12 New Professional Templates ───────────────────────────────────────

const TutorialStepsData = z.object({
  template: z.literal("tutorial-steps"),
  step: z.number().int().min(1).max(10),
  totalSteps: z.number().int().min(1).max(10),
  title: z.string().min(1).max(60),
  instructions: z.array(z.string().min(1).max(80)).min(1).max(4),
  tips: z.string().max(80).optional(),
});

const BeforeAfterData = z.object({
  template: z.literal("before-after"),
  beforeLabel: z.string().min(1).max(40),
  beforeValue: z.string().min(1).max(40),
  afterLabel: z.string().min(1).max(40),
  afterValue: z.string().min(1).max(40),
  improvement: z.string().max(60).optional(),
});

const ProductShowcaseData = z.object({
  template: z.literal("product-showcase"),
  productName: z.string().min(1).max(50),
  tagline: z.string().min(1).max(80),
  highlights: z.array(z.string().min(1).max(60)).min(1).max(4),
  badge: z.string().max(30).optional(),
});

const MilestoneItem = z.object({
  year: z.string().min(1).max(15),
  event: z.string().min(1).max(60),
});

const TimelineData = z.object({
  template: z.literal("timeline"),
  era: z.string().min(1).max(50),
  milestones: z.array(MilestoneItem).min(1).max(4),
});

const MapRouteData = z.object({
  template: z.literal("map-route"),
  sourceLocation: z.string().min(1).max(50),
  destination: z.string().min(1).max(50),
  routeType: z.string().max(30).optional(),
  distanceOrTime: z.string().min(1).max(30),
});

const GitHubRepoExplainerData = z.object({
  template: z.literal("github-repo-explainer"),
  repoName: z.string().min(1).max(60),
  stars: z.string().min(1).max(20),
  architectureLayers: z.array(z.string().min(1).max(50)).min(1).max(4),
  techStack: z.array(z.string().min(1).max(30)).min(1).max(6),
});

const TopListRankingData = z.object({
  template: z.literal("top-list-ranking"),
  rank: z.number().int().min(1).max(100),
  itemTitle: z.string().min(1).max(60),
  score: z.string().min(1).max(30),
  reason: z.string().max(80).optional(),
});

const ChatMessageItem = z.object({
  sender: z.enum(["user", "bot", "expert"]),
  text: z.string().min(1).max(80),
});

const ChatConversationData = z.object({
  template: z.literal("chat-conversation"),
  conversationTitle: z.string().max(40).optional(),
  messages: z.array(ChatMessageItem).min(2).max(4),
});

const CodeWalkthroughData = z.object({
  template: z.literal("code-walkthrough"),
  filename: z.string().min(1).max(40),
  language: z.string().min(1).max(20),
  codeSnippet: z.string().min(1).max(300),
  highlightLine: z.number().int().min(1).max(20).optional(),
});

const DashboardMetricItem = z.object({
  label: z.string().min(1).max(30),
  value: z.string().min(1).max(30),
  trend: z.enum(["up", "down", "neutral"]).optional(),
});

const DataDashboardData = z.object({
  template: z.literal("data-dashboard"),
  title: z.string().min(1).max(50),
  metrics: z.array(DashboardMetricItem).min(2).max(4),
});

const TestimonialReactionData = z.object({
  template: z.literal("testimonial-reaction"),
  author: z.string().min(1).max(40),
  role: z.string().max(40).optional(),
  quote: z.string().min(1).max(120),
  rating: z.number().min(1).max(5).optional(),
});

const CtaOutroData = z.object({
  template: z.literal("cta-outro"),
  headline: z.string().min(1).max(50),
  handle: z.string().min(1).max(40),
  platforms: z.array(z.string().min(1).max(20)).default(["TikTok", "YouTube", "Reels"]),
  actionText: z.string().min(1).max(40),
});

// ── Combined 18 Templates Discriminated Union ──────────────────────────────

export const TemplateData = z.discriminatedUnion("template", [
  HookData,
  ComparisonData,
  StatHeroData,
  FeatureListData,
  CalloutData,
  OutroData,
  // 12 new templates:
  TutorialStepsData,
  BeforeAfterData,
  ProductShowcaseData,
  TimelineData,
  MapRouteData,
  GitHubRepoExplainerData,
  TopListRankingData,
  ChatConversationData,
  CodeWalkthroughData,
  DataDashboardData,
  TestimonialReactionData,
  CtaOutroData,
]);

export type TemplateDataType = z.infer<typeof TemplateData>;

// ── SFX schema ─────────────────────────────────────────────────────────────
const SfxSpec = z.object({
  name: z.string().min(1),
  volume: z.number().min(0).max(1).default(0.4),
  startOffsetSec: z.number().default(0),
});

export type SfxSpecType = z.infer<typeof SfxSpec>;

// ── Scene schema ───────────────────────────────────────────────────────────
const Scene = z.object({
  id: z.string().min(1),
  type: z.enum(["hook", "body", "outro"]),
  voiceText: z.string().min(1),
  templateData: TemplateData,
  sfx: SfxSpec.optional(),
});

// ── Root schema ────────────────────────────────────────────────────────────
export const VisualStyleSchema = z.enum(["news", "tech", "minimal", "high-energy", "luxury", "retro"]);
export type VisualStyle = z.infer<typeof VisualStyleSchema>;

export const ScriptSchema = z.object({
  version: z.string().default("1.0"),
  schemaVersion: z.string().optional(),
  metadata: z.object({
    title: z.string().min(1),
    source: z.object({
      url: z.string(),
      domain: z.string(),
      image: z.string().url().nullable(),
    }),
    channel: z.string().min(1),
    recommendedTheme: z.string().optional(),
    style: VisualStyleSchema.optional(),
  }),
  voice: z.object({
    provider: z.string().min(1),
    voiceId: z.string().min(1),
    speed: z.number().min(0.5).max(2.0),
  }).optional(),
  scenes: z
    .array(Scene)
    .min(5)
    .max(8, "scenes must have at most 8 items")
    .refine((s) => s[0]?.type === "hook", { message: "scenes[0] must be type=hook" })
    .refine((s) => s[s.length - 1]?.type === "outro", { message: "last scene must be type=outro" }),
});

export type Script = z.infer<typeof ScriptSchema>;
