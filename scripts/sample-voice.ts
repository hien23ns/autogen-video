#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig } from "../src/config.js";
import { createTtsClient } from "../src/tts/tts-client.js";
import { getDurationSec } from "../src/assets/audio-tools.js";

async function main() {
  const cfg = loadConfig();
  const provider = process.argv[2] || cfg.ttsProvider;
  const sampleText =
    process.argv[3] ||
    "Xin chào! Đây là bản tin công nghệ tự động được tạo bằng Auto Video Gen. Giọng đọc rõ ràng, tự nhiên chuẩn tiếng Việt.";

  const outDir = join(process.cwd(), "output");
  await mkdir(outDir, { recursive: true });
  const outAudio = join(outDir, `sample-voice-${provider}.mp3`);

  console.log(`\n🎙️ Đang thử giọng đọc mẫu với nhà cung cấp: ${provider}`);
  console.log(`   - Nội dung thử: "${sampleText}"`);

  try {
    const client = createTtsClient(cfg);
    await client.generate(sampleText, outAudio);

    const dur = await getDurationSec(outAudio);
    console.log(`\n✅ Tạo giọng mẫu thành công!`);
    console.log(`   - Thời lượng: ${dur.toFixed(2)}s`);
    console.log(`   - File lưu tại: ${outAudio}`);
  } catch (err: any) {
    console.error(`❌ Thử giọng thất bại: ${err.message}`);
    process.exit(1);
  }
}

main();
