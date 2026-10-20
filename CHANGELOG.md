# Changelog

All notable changes to the **Auto Video Gen** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.5.0] - 2026-10-20

### 🚀 Major Studio Upgrade (AI Video Editing Studio)

#### Added
- **Motion Design System:** Spring physics (`back.out`), bezier curves, 3-attribute entrance animations, subtle virtual camera push-in, and `brand.config.json` Brand Kit support.
- **12 New Templates (18 Total):** `tutorial-steps`, `before-after`, `product-showcase`, `timeline`, `map-route`, `github-repo-explainer`, `top-list-ranking`, `chat-conversation`, `code-walkthrough`, `data-dashboard`, `testimonial-reaction`, `cta-outro`.
- **6 Visual Styles (`--style`):** `news`, `tech`, `minimal`, `high-energy`, `luxury`, `retro`.
- **Viral Word-Level Captions:** 5 caption styles (`karaoke-highlight`, `pop-in`, `box-highlight`, `hand-drawn-underline`, `minimal`), smart keyword glowing, WebVTT and SRT export.
- **Sound Design & Mastering:** Automatic BGM sidechain ducking (-18dB under speech), broadcast loudness mastering (-14 LUFS, True Peak ≤ -1.0 dBTP), voice sampler tool (`npm run voice:sample`), and `manifest.json` asset registers with commercial licenses (`assets/LICENSES.md`).
- **AI Ghost Editor (`/edit-raw-video`):** Cuts silences with FFmpeg `silencedetect`, detects stutters/fillers, groups multi-takes of the same sentence, picks the best take, reframes to 9:16, alternates punch-in zooms (1.0x -> 1.18x -> 1.25x), and exports side-by-side comparison video.
- **Automated QA Verification Engine (`npm run qa:video`):** Measures loudness compliance, detects dead air/audio desync, extracts 5 keyframes for vision inspection, and computes composite quality score.
- **HyperFrames Studio & Advanced Rerender:** `npm run studio` interactive timeline editor, `--scene <id>` target scene rerender, SHA256 scene content caching, and batch processing (`npm run batch -- urls.txt`).
- **Multi-Aspect Ratio:** Coexists smoothly across `9:16`, `16:9`, `1:1`, and `4:5` aspect ratios.
- **Publishing Package (`publish/`):** Auto-generates captions, hashtags, and CTA for TikTok, YouTube Shorts, and Instagram Reels, pre-upload checklist, and cover thumbnails (9:16 & 16:9).
- **Environment Doctor (`npm run doctor`):** Diagnostic tool checking Node, FFmpeg, audio filters, TTS, and environment variables.
- **8 Agent Skills:** Synchronized bidirectional skills between Antigravity (`.agents/skills/`) and Claude Code (`.claude/skills/`) with `npm run skills:sync`.
- **Conventions & Schemas:** Root `AGENTS.md` and exported JSON schemas (`schemas/script.schema.json`).

#### Changed
- Preserved 100% backward compatibility for all legacy templates (`hook`, `stat-hero`, `comparison`, `feature-list`, `callout`, `outro`), CLI arguments, and legacy JSON scripts.
- Refactored `src/render/templates/animations.js` and `styles.css` into modular components.

---

## [2.0.0] - 2026-04-29
- Initial 3-tier vertical video pipeline with HyperFrames, TTS (Edge-TTS, LucyLab, ElevenLabs), and Telegram bot notification.
