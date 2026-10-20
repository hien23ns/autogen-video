// One-off script: re-render the existing composition without re-running TTS.
// Uses already-generated per-scene voice files in <outputDir>/voice/.
//
// Usage: npx tsx rerender.ts <outputDir>

import { readFile, writeFile, copyFile } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import { ScriptSchema } from "./src/render/script-schema.js";
import { loadConfig } from "./src/config.js";
import { getDurationSec, concatWithSilence, mixSfxOntoVoice, type SfxMixSpec } from "./src/assets/audio-tools.js";
import { indexSfxLibrary, pickSfxForScene, defaultPlayback } from "./src/assets/sfx-selector.js";
import { existsSync } from "node:fs";
import { composeHtml, type AspectRatio } from "./src/render/html-composer.js";
import { renderWithHyperframes } from "./src/render/hyperframes-runner.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TPL_DIR = join(__dirname, "src", "render", "templates");
const SFX_DIR = join(__dirname, "assets", "sfx");
const SCENE_GAP_SEC = 0.3;

const HYPERFRAMES_CONFIG = {
  $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
  registry: "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
  paths: { blocks: "compositions", components: "compositions/components", assets: "assets" },
};

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      scene: { type: "string" },
      preset: { type: "string", default: "draft" },
      ratio: { type: "string", default: "9:16" },
      fps: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
    args: process.argv.slice(2),
  });

  const outputDir = positionals[0];
  if (!outputDir || values.help) {
    console.log(`
🎬 Rerender Tool — Re-render composition without re-running TTS

Usage:
  npx tsx rerender.ts <outputDir> [options]

Options:
  --scene <id>       Only re-render a specific scene (e.g. --scene hook or --scene 1)
  --preset <preset>  draft (30fps) | final (60fps high quality) [default: draft]
  --ratio <ratio>    9:16 | 16:9 | 1:1 | 4:5 [default: 9:16]
  --fps <number>     Custom fps override (e.g. 60)
  -h, --help         Show this help
`);
    process.exit(values.help ? 0 : 2);
  }

  const cfg = loadConfig();
  const ratio = (values.ratio as AspectRatio) || "9:16";
  const preset = (values.preset as "draft" | "final") || "draft";
  const fps = values.fps ? parseInt(values.fps, 10) : (preset === "final" ? 60 : 30);
  const quality = preset === "final" ? "high" : "draft";

  console.log(`Re-rendering: ${outputDir}`);
  console.log(`  Preset: ${preset} (${fps}fps, quality: ${quality}) | Ratio: ${ratio}`);
  if (values.scene) console.log(`  Target scene only: ${values.scene}`);

  // Load script.json
  const raw = JSON.parse(await readFile(join(outputDir, "script.json"), "utf8"));
  if (raw.voice?.voiceId === "${VIETNAMESE_VOICEID}" || raw.voice?.voiceId === "${VOICE_ID}") {
    raw.voice.voiceId =
      cfg.ttsProvider === "edge-tts" ? cfg.edgeTtsVoice
      : cfg.ttsProvider === "lucylab" ? cfg.lucylabVoiceId!
      : cfg.ttsProvider === "elevenlabs" ? cfg.elevenlabsVoiceId!
      : cfg.vbeeVoiceCode;
  }
  const script = ScriptSchema.parse(raw);

  if (values.scene) {
    const target = script.scenes.find((s) => s.id === values.scene);
    if (!target) {
      console.error(`❌ Scene id "${values.scene}" không tồn tại trong script!`);
      console.error(`Danh sách cảnh: ${script.scenes.map((s) => s.id).join(", ")}`);
      process.exit(1);
    }
    script.scenes = [target];
  }

  // Scene cache detection
  const sceneHashes: Record<string, string> = {};
  for (const s of script.scenes) {
    sceneHashes[s.id] = createHash("sha256").update(JSON.stringify(s)).digest("hex").slice(0, 12);
  }
  const cacheFile = join(outputDir, "scene-cache.json");
  let oldHashes: Record<string, string> = {};
  if (existsSync(cacheFile)) {
    try { oldHashes = JSON.parse(await readFile(cacheFile, "utf8")); } catch {}
  }
  console.log("\n🔍 Scene Cache Status:");
  for (const s of script.scenes) {
    const isDirty = oldHashes[s.id] !== sceneHashes[s.id];
    console.log(`  - Scene ${s.id} [${sceneHashes[s.id]}]: ${isDirty ? "⚡ CHANGED / RE-RENDER" : "✔ UNCHANGED"}`);
  }
  await writeFile(cacheFile, JSON.stringify(sceneHashes, null, 2));

  // Probe per-scene durations from existing voice files
  const sceneAudio = await Promise.all(
    script.scenes.map(async (s) => {
      const path = join(outputDir, "voice", `scene-${s.id}.mp3`);
      const dur = await getDurationSec(path);
      console.log(`  scene ${s.id}: ${dur.toFixed(2)}s`);
      return { id: s.id, path, durationSec: dur };
    })
  );

  // Re-concat voice (in case audio-tools fix changed encoding)
  const voiceRawMp3 = join(outputDir, "voice-raw.mp3");
  const voiceMp3 = join(outputDir, "voice.mp3");
  await concatWithSilence(sceneAudio.map((a) => a.path), SCENE_GAP_SEC, voiceRawMp3);

  // Compute scene start times + collect SFX
  let cursor = 0;
  const sceneStarts: Record<string, number> = {};
  for (const a of sceneAudio) {
    sceneStarts[a.id] = cursor;
    cursor += a.durationSec + SCENE_GAP_SEC;
  }
  // Smart SFX selection — same 3-tier logic as pipeline
  const sfxIndex = indexSfxLibrary(SFX_DIR);
  const sfxList: SfxMixSpec[] = [];
  for (const scene of script.scenes) {
    const startSec = sceneStarts[scene.id];
    if (scene.sfx) {
      if (scene.sfx.name === "none") continue;
      const sfxPath = join(SFX_DIR, `${scene.sfx.name}.mp3`);
      if (existsSync(sfxPath)) {
        sfxList.push({ path: sfxPath, startSec: startSec + scene.sfx.startOffsetSec, volume: scene.sfx.volume });
        console.log(`  scene ${scene.id}: SFX override -> ${scene.sfx.name}`);
      }
      continue;
    }
    const picked = pickSfxForScene({
      voiceText: scene.voiceText,
      templateName: scene.templateData.template,
      sceneId: scene.id,
      index: sfxIndex,
    });
    if (!picked) continue;
    const sfxPath = join(SFX_DIR, picked.relPath);
    const playback = defaultPlayback(picked);
    sfxList.push({ path: sfxPath, startSec: startSec + playback.offsetSec, volume: playback.volume });
    const why = picked.source === "semantic" ? `semantic "${picked.matchedKeyword}"` : picked.source;
    console.log(`  scene ${scene.id}: SFX -> ${picked.relPath} (${why})`);
  }
  console.log(`mixing ${sfxList.length} SFX into voice.mp3`);
  await mixSfxOntoVoice(voiceRawMp3, sfxList, voiceMp3);

  const totalDur = await getDurationSec(voiceMp3);
  console.log(`voice.mp3 total: ${totalDur.toFixed(2)}s`);

  // Determine bg image
  const bgImagePath = join(outputDir, "images", "bg.jpg");
  const fs = await import("node:fs");
  const bgImageRelPath = fs.existsSync(bgImagePath) ? "images/bg.jpg" : null;
  console.log(`bgImage: ${bgImageRelPath ?? "(none — gradient fallback)"}`);

  // TikTok avatar — find bundled (jpg/jpeg/png/webp) and copy to output dir
  let bundledAvatar: string | null = null;
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const p = join(__dirname, "assets", `avatar.${ext}`);
    if (existsSync(p)) { bundledAvatar = p; break; }
  }
  if (!bundledAvatar) {
    throw new Error("No bundled avatar found. Place an image at assets/avatar.{jpg,png,webp}");
  }
  const ttAvatarExt = bundledAvatar.split(".").pop()!.toLowerCase();
  const ttAvatarFile = `tiktok-avatar.${ttAvatarExt}`;
  const ttAvatarOut = join(outputDir, ttAvatarFile);
  // Always re-copy in case bundled was updated
  await copyFile(bundledAvatar, ttAvatarOut);

  // Compose HTML
  const html = composeHtml({
    script,
    sceneAudio: sceneAudio.map((a) => ({ id: a.id, durationSec: a.durationSec })),
    gapSec: SCENE_GAP_SEC,
    bgImageRelPath,
    audioRelPath: "voice.mp3",
    tiktok: cfg.tiktok,
    tiktokAvatarRelPath: ttAvatarFile,
    outroHoldSec: 3,
    ratio,
  });
  await writeFile(join(outputDir, "index.html"), html);
  await writeFile(join(outputDir, "hyperframes.json"), JSON.stringify(HYPERFRAMES_CONFIG, null, 2));
  await writeFile(join(outputDir, "meta.json"), JSON.stringify({
    id: basename(outputDir),
    name: script.metadata.title,
    createdAt: new Date().toISOString(),
  }, null, 2));
  await copyFile(join(TPL_DIR, "styles.css"),    join(outputDir, "styles.css"));
  await copyFile(join(TPL_DIR, "animations.js"), join(outputDir, "animations.js"));

  // Render
  const videoName = values.scene ? `video-scene-${values.scene}.mp4` : "video.mp4";
  const videoPath = join(outputDir, videoName);
  await renderWithHyperframes({
    compositionDir: outputDir,
    outputPath: videoPath,
    fps,
    quality,
  });
  console.log(`\nDone: ${videoPath}`);
}

main().catch((e) => { console.error("Re-render failed:", e); process.exit(1); });
