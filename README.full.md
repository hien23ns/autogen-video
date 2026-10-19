<a id="top"></a>

<div align="center">

# 🎬 Auto Video Gen

### Biến bài báo tiếng Việt/URL repo Github thành video 9:16 TikTok/Reels/Shorts

**Một câu lệnh. Không cần edit. Chất lượng motion graphic studio.**

[![Stars](https://img.shields.io/github/stars/hien23ns/autogen-video?style=for-the-badge&logo=github&color=yellow)](https://github.com/hien23ns/autogen-video/stargazers)
[![Forks](https://img.shields.io/github/forks/hien23ns/autogen-video?style=for-the-badge&logo=github&color=blue)](https://github.com/hien23ns/autogen-video/network/members)
[![License](https://img.shields.io/github/license/hien23ns/autogen-video?style=for-the-badge&color=green)](LICENSE)
[![Node](https://img.shields.io/badge/node-22%2B-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5%2B-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[**🇬🇧 English**](README.en.md) · [**🇻🇳 Tiếng Việt**](README.md) · [**📺 Xem Demo**](https://youtube.com/shorts/X8P_5tsHy4o) · [**🚀 Bắt Đầu Nhanh**](#-bắt-đầu-nhanh) · [**❓ FAQ**](#-faq)

</div>

> 📌 **Bạn đang xem bản tài liệu kỹ thuật chi tiết đầy đủ (Full Documentation).**
> Để xem bản tóm tắt nhanh gọn dễ hiểu, vui lòng xem [👉 README.md (Bản rút gọn)](README.md).

---

<div align="center">

## 🎥 Xem Demo Sản Phẩm

| 🕸️ CodeGraph | 🖥️ OpenScreen |
|-------------------|---------------------|
| [![CodeGraph Demo](https://img.youtube.com/vi/X8P_5tsHy4o/0.jpg)](https://youtube.com/shorts/X8P_5tsHy4o) | [![OpenScreen Demo](https://img.youtube.com/vi/5noesbFXK0k/0.jpg)](https://youtube.com/shorts/5noesbFXK0k) |
| [Xem trên YouTube](https://youtube.com/shorts/X8P_5tsHy4o) | [Xem trên YouTube](https://youtube.com/shorts/5noesbFXK0k) |

### 🎙️ Xem trên Facebook Reels và TikTok

[Xem trên Facebook](https://www.facebook.com/reel/2549425188850979) · [Xem trên TikTok](https://www.tiktok.com/@cuongit96/video/7661226482458561799)

*Video này được tạo **hoàn toàn** bằng pipeline này — Vbee TTS + HyperFrames + GSAP animations, không edit thủ công.*

</div>

---

## 🤔 Tại sao có dự án này?

Việc tạo video tin tức ngắn rất **tốn thời gian và lặp đi lặp lại**:

- ⏰ Viết kịch bản thủ công → 30 phút mỗi video
- 🎨 Chọn visual + animation → 1 tiếng mỗi video
- 🎙️ Thu hoặc tìm voice → 30 phút
- ✂️ Edit trên CapCut / Premiere → 1 tiếng
- 📱 **Tổng: ~3 tiếng cho 1 video 60 giây**

**Auto News Video chỉ cần 5 phút. Paste URL là xong.**

| | Cách thủ công | Auto Video Gen |
|---|---|---|
| ⏱️ Thời gian | ~3 tiếng | **~5 phút** |
| 🎓 Kỹ năng cần | Editor video | **Không cần** |
| 🎯 Độ ổn định | Phụ thuộc người làm | **Studio-grade mọi video** |
| 💰 Chi phí | $50–200 (freelancer) | **0đ (Edge TTS Free) / AI Agent** |
| 🇻🇳 Giọng tiếng Việt | Tốn thời gian | **Edge TTS (Free) / Vbee / LucyLab / ElevenLabs** |

---

## 🚀 Bắt Đầu Nhanh

```bash
# 1. Clone & cài dependencies
git clone [https://github.com/hien23ns/autogen-video.git](https://github.com/hien23ns/autogen-video.git)
cd autogen-video
npm install

# 2. Cấu hình môi trường (mặc định đã sẵn sàng với Edge TTS miễn phí 100%)
cp .env.example .env
