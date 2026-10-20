#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function findLatestCompositionDir(): string | null {
  const outputDir = join(process.cwd(), "output");
  if (!existsSync(outputDir)) return null;

  const entries = readdirSync(outputDir)
    .map((name) => join(outputDir, name))
    .filter((full) => statSync(full).isDirectory() && existsSync(join(full, "index.html")))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);

  return entries[0] || null;
}

async function main() {
  const targetDir = process.argv[2] || findLatestCompositionDir();

  if (!targetDir || !existsSync(targetDir)) {
    console.error("❌ Không tìm thấy thư mục composition nào trong output/ để mở Studio!");
    console.error("Vui lòng tạo video trước hoặc truyền đường dẫn: npm run studio -- <outputDir>");
    process.exit(1);
  }

  console.log(`\n🎬 Đang khởi động HyperFrames Visual Studio...`);
  console.log(`📁 Composition: ${targetDir}`);
  console.log(`🌐 Mở trình duyệt để chỉnh sửa timeline, kéo thả và tùy biến các cảnh.\n`);

  const proc = spawn("npx", ["hyperframes", "studio", targetDir], {
    stdio: "inherit",
    shell: true,
  });

  proc.on("close", (code) => {
    process.exit(code || 0);
  });
}

main();
