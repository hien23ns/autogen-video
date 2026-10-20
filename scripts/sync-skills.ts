#!/usr/bin/env node
import { readdir, cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

async function main() {
  const root = process.cwd();
  const agentsSkillsDir = join(root, ".agents", "skills");
  const claudeSkillsDir = join(root, ".claude", "skills");

  if (!existsSync(agentsSkillsDir)) {
    console.error(`❌ Thư mục nguồn không tồn tại: ${agentsSkillsDir}`);
    process.exit(1);
  }

  await mkdir(claudeSkillsDir, { recursive: true });

  const skills = await readdir(agentsSkillsDir, { withFileTypes: true });
  const skillDirs = skills.filter((s) => s.isDirectory()).map((s) => s.name);

  console.log(`\n========================================================`);
  console.log(`🔄 SYNC AGENT SKILLS: .agents/skills -> .claude/skills`);
  console.log(`📦 Tìm thấy ${skillDirs.length} skills cần đồng bộ`);
  console.log(`========================================================\n`);

  for (const name of skillDirs) {
    const src = join(agentsSkillsDir, name);
    const dest = join(claudeSkillsDir, name);
    await cp(src, dest, { recursive: true });
    console.log(`  ✔ Đồng bộ skill: ${name}`);
  }

  console.log(`\n✨ ĐỒNG BỘ SKILLS THÀNH CÔNG! (${skillDirs.length} skills)\n`);
}

main().catch((err) => {
  console.error("Lỗi khi đồng bộ skills:", err);
  process.exit(1);
});
