<a id="top"></a>

<div align="center">

# 🎬 Auto News Video

### Turn any Vietnamese article or GitHub repo URL into a 9:16 TikTok/Reels/Shorts video

**One command. Zero editing. Studio-quality 9:16 motion graphics.**

[![Stars](https://img.shields.io/github/stars/hien23ns/autogen-video?style=for-the-badge&logo=github&color=yellow)](https://github.com/hien23ns/autogen-video/stargazers)
[![Forks](https://img.shields.io/github/forks/hien23ns/autogen-video?style=for-the-badge&logo=github&color=blue)](https://github.com/hien23ns/autogen-video/network/members)
[![License](https://img.shields.io/github/license/hien23ns/autogen-video?style=for-the-badge&color=green)](LICENSE)
[![Node](https://img.shields.io/badge/node-22%2B-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5%2B-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[**🇬🇧 English**](README.en.md) · [**🇻🇳 Tiếng Việt**](README.md) · [**📖 Full Docs (VN)**](README.full.md) · [**📺 Watch Demo**](https://youtube.com/shorts/X8P_5tsHy4o) · [**🚀 Quick Start**](#-quick-start) · [**❓ FAQ**](#-faq)

</div>

---

<div align="center">

## 🎥 Live Demo

| 🕸️ CodeGraph | 🖥️ OpenScreen |
|-------------------|---------------------|
| [![CodeGraph Demo](https://img.youtube.com/vi/X8P_5tsHy4o/0.jpg)](https://youtube.com/shorts/X8P_5tsHy4o) | [![OpenScreen Demo](https://img.youtube.com/vi/5noesbFXK0k/0.jpg)](https://youtube.com/shorts/5noesbFXK0k) |
| [Watch on YouTube](https://youtube.com/shorts/X8P_5tsHy4o) | [Watch on YouTube](https://youtube.com/shorts/5noesbFXK0k) |

### 🎙️ Watch on Facebook Reels and TikTok

[Watch on Facebook](https://www.facebook.com/reel/2549425188850979) · [Watch on TikTok](https://www.tiktok.com/@cuongit96/video/7661226482458561799)

*This video was generated **entirely** by this pipeline — Vietnamese TTS + HyperFrames + GSAP animations, no manual editing.*

</div>

---

## 🤔 Why does this exist?

Creating short-form news videos is **time-consuming and repetitive**:

- ⏰ Manually scripting → 30 min per video
- 🎨 Picking visuals + animations → 1 hour per video
- 🎙️ Recording or sourcing voiceover → 30 min
- ✂️ Editing in CapCut / Premiere → 1 hour
- 📱 **Total: ~3 hours per 60-second video**

**Auto News Video does it in 5 minutes. Just paste a URL.**

| | Manual workflow | Auto News Video |
|---|---|---|
| ⏱️ Time per video | ~3 hours | **~5 minutes** |
| 🎓 Skill required | Video editor | **None** |
| 🎯 Consistency | Varies | **Studio-grade every time** |
| 💰 Cost per video | $50–200 (freelancer) | **$0 (Edge TTS Free) / AI Agent** |
| 🇻🇳 Vietnamese voice | Time-consuming | **Edge TTS (Free) / Vbee / LucyLab / ElevenLabs** |

---

## 🚀 Quick Start

```bash
# 1. Clone & install
git clone [https://github.com/hien23ns/autogen-video.git](https://github.com/hien23ns/autogen-video.git)
cd autogen-video
npm install

# 2. Configure environment (works out of the box with 100% Free Edge TTS)
cp .env.example .env
