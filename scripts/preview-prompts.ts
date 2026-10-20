#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { composeHtml } from "../src/render/html-composer.js";
import type { Script } from "../src/render/script-schema.js";

const TEMPLATES_LIST = [
  { id: "hook", name: "Breaking News / Hook", category: "News" },
  { id: "stat-hero", name: "Stat Callout / Big Number", category: "News" },
  { id: "comparison", name: "Comparison / Split-Screen", category: "Viral" },
  { id: "feature-list", name: "Feature List / Listicle", category: "Viral" },
  { id: "callout", name: "Quote Card / Callout", category: "News" },
  { id: "outro", name: "Outro Channel Follow", category: "Social" },
  { id: "tutorial-steps", name: "Tutorial Steps with Progress", category: "Education" },
  { id: "before-after", name: "Before vs After Comparison", category: "Product" },
  { id: "product-showcase", name: "Product Showcase 3D", category: "Product" },
  { id: "timeline", name: "Timeline & Milestones", category: "Education" },
  { id: "map-route", name: "Map Route Navigation", category: "Education" },
  { id: "github-repo-explainer", name: "GitHub Architecture Explainer", category: "Tech" },
  { id: "top-list-ranking", name: "Top List Ranking #1", category: "Viral" },
  { id: "chat-conversation", name: "Chat Conversation Simulation", category: "Viral" },
  { id: "code-walkthrough", name: "Code Walkthrough & Highlight", category: "Tech" },
  { id: "data-dashboard", name: "Data Metrics Dashboard", category: "Tech" },
  { id: "testimonial-reaction", name: "Testimonial & 5-Star Review", category: "Product" },
  { id: "cta-outro", name: "Multi-Platform CTA Outro", category: "Social" },
];

async function main() {
  console.log("\n========================================================");
  console.log("🎨 AUTO VIDEO GEN — THƯ VIỆN 18 MOTION TEMPLATES");
  console.log("========================================================\n");

  console.log("| STT | Tên Template | Thể Loại | Trạng Thái Hỗ Trợ |");
  console.log("|---|---|---|---|");
  TEMPLATES_LIST.forEach((t, idx) => {
    console.log(`| ${idx + 1} | \`${t.id}\` (${t.name}) | ${t.category} | ✅ Ready for Render |`);
  });

  const previewDir = join(process.cwd(), "output", "prompts-preview");
  await mkdir(previewDir, { recursive: true });

  const catalogMd = `# CATALOG 18 TEMPLATES CHUẨN MOTION GRAPHICS

Tổng hợp danh sách 18 templates có sẵn trong hệ thống:

${TEMPLATES_LIST.map((t, idx) => `${idx + 1}. **${t.name}** (\`${t.id}\`) — Thể loại: *${t.category}*`).join("\n")}
`;

  await writeFile(join(previewDir, "CATALOG.md"), catalogMd, "utf8");
  console.log(`\n✨ Đã lưu danh mục preview tại: ${join(previewDir, "CATALOG.md")}\n`);
}

main();
