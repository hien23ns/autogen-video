<a id="top"></a>

<div align="center">

# 🎬 Auto Video Gen

### 🚀 Biến URL bài báo & Repo GitHub thành Video ngắn 9:16 chuyên nghiệp

**1 câu lệnh với AI Coding · 0đ Voice (Edge TTS) · Không cần edit thủ công · Sẵn sàng đăng TikTok, Reels, Shorts**

[![Stars](https://img.shields.io/github/stars/hien23ns/autogen-video?style=for-the-badge&logo=github&color=yellow)](https://github.com/hien23ns/autogen-video/stargazers)
[![Forks](https://img.shields.io/github/forks/hien23ns/autogen-video?style=for-the-badge&logo=github&color=blue)](https://github.com/hien23ns/autogen-video/network/members)
[![License](https://img.shields.io/github/license/hien23ns/autogen-video?style=for-the-badge&color=green)](LICENSE)
[![Node](https://img.shields.io/badge/node-22%2B-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5%2B-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[**📖 Tài liệu chi tiết (Full Docs)**](README.full.md) · [**🇬🇧 English Docs**](README.en.md) · [**📺 Xem Demo**](https://youtube.com/shorts/X8P_5tsHy4o) · [**🚀 Cài đặt nhanh**](#-bắt-đầu-nhanh-3-bước) · [**💬 Cộng đồng**](#-cộng-đồng--các-mẫu-tạo-video-khác)

</div>

> 💡 **Bạn cần tài liệu chuyên sâu?**
> Bản README này tóm tắt nhanh để bạn có thể bắt đầu tạo video trong 5 phút. Để xem đầy đủ kiến trúc, JSON Schema kịch bản, bảng tính chi phí và hướng dẫn nâng cao, vui lòng xem [👉 README.full.md](README.full.md).

---

## 🎥 Xem Demo Video Hoàn Thiện

Toàn bộ video dưới đây được tạo **100% tự động** từ kịch bản text — Voice TTS + Visuals HTML/CSS + Hiệu ứng SFX/BGM, không qua bước edit video thủ công:

| 🕸️ Demo CodeGraph | 🖥️ Demo OpenScreen |
| :---: | :---: |
| [![CodeGraph Demo](https://img.youtube.com/vi/X8P_5tsHy4o/0.jpg)](https://youtube.com/shorts/X8P_5tsHy4o) | [![OpenScreen Demo](https://img.youtube.com/vi/5noesbFXK0k/0.jpg)](https://youtube.com/shorts/5noesbFXK0k) |
| [📺 Xem Shorts](https://youtube.com/shorts/X8P_5tsHy4o) | [📺 Xem Shorts](https://youtube.com/shorts/5noesbFXK0k) |

🔗 Xem thêm tại: [Facebook Reels](https://www.facebook.com/reel/2549425188850979) · [TikTok @cuongit96](https://www.tiktok.com/@cuongit96/video/7661226482458561799)

---

## ✨ Điểm nổi bật

- ⚡ **Tự động hóa toàn diện**: Từ URL bài báo hoặc file `.txt`/`.md` → Kịch bản → Giọng đọc (TTS) → HTML Motion Graphics → Ghép âm thanh & SFX → Render file MP4 1080x1920 60FPS.
- 🎙️ **Voice miễn phí 100% (Edge TTS)**: Tích hợp sẵn giọng đọc tiếng Việt của Microsoft Edge, **không tốn tiền, không cần API Key**. Đồng thời hỗ trợ **LucyLab** (voice cloning tiếng Việt kèm SRT), **Vbee** (chuẩn giọng tin tức Việt Nam) và **ElevenLabs** (đa ngôn ngữ cao cấp).
- 🎨 **HTML-to-Video Engine (HyperFrames)**: Layout video được viết bằng HTML + CSS + GSAP animation. Dễ dàng can thiệp, tuỳ biến font chữ, màu sắc thương hiệu như lập trình web.
- 🤖 **Thiết kế riêng cho AI Coding Agents**: Tối ưu sẵn cho **Google Antigravity IDE** (`.agents/skills`) và **Claude Code** (`.claude/skills`) qua lệnh `/create-news-video`. Bạn chỉ cần đưa URL bài báo hoặc file `.txt`, AI sẽ tự đọc hiểu, tóm tắt, chọn template đồ họa và chạy pipeline tạo video trọn gói từ A đến Z.
- 📐 **6 Template dựng sẵn linh hoạt**:
  - 🚨 `breaking-news`: Tin nóng, sự kiện giật gân
  - 📊 `stat-callout`: Nhấn mạnh số liệu, biểu đồ
  - 🔀 `split-screen`: So sánh 2 đối tượng hoặc chèn ảnh minh họa bài viết
  - 💬 `quote-card`: Trích dẫn phát biểu, châm ngôn
  - 📋 `listicle`: Danh sách điểm tin, bảng xếp hạng
  - 🔢 `big-number`: Số liệu thống kê ấn tượng

---

## 🚀 Bắt đầu nhanh (3 bước)

### 1. Yêu cầu & Cài đặt

Dự án sử dụng cơ chế **Agentic Video Generation**:
- **Công cụ bắt buộc**: **Node.js 22+** và **FFmpeg** trên máy.
- **AI Coding Agent (Khuyên dùng để tự động hoá 100%)**:
  - 🪐 **[Antigravity IDE](https://antigravity.google)** — AI IDE của Google DeepMind.
  - 🧠 **[Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code)** — Agentic CLI của Anthropic.
  - Hoặc bất kỳ AI tool nào khác (Cursor, Codex, Windsurf) thông qua kịch bản JSON.

```bash
# Clone repository
git clone [https://github.com/hien23ns/autogen-video.git](https://github.com/hien23ns/autogen-video.git)
cd autogen-video

# Cài đặt dependencies
npm install
