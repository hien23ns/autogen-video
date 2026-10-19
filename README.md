<a id="top"></a>

<div align="center">

# 🎬 Auto Video Gen 2.5

### 🚀 Biến URL Bài Báo & Repo GitHub Thành Video Dọc 9:16 Chuyên Nghiệp

**1 câu lệnh · Bố cục 3 tầng TikTok/Reels hiện đại · 0đ Voice (Edge Neural TTS) · Phụ đề Karaoke Real-time**

[![Stars](https://img.shields.io/github/stars/hien23ns/autogen-video?style=for-the-badge&logo=github&color=yellow)](https://github.com/hien23ns/autogen-video/stargazers)
[![Forks](https://img.shields.io/github/forks/hien23ns/autogen-video?style=for-the-badge&logo=github&color=blue)](https://github.com/hien23ns/autogen-video/network/members)
[![License](https://img.shields.io/github/license/hien23ns/autogen-video?style=for-the-badge&color=green)](LICENSE)
[![Node](https://img.shields.io/badge/node-20%2B-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5%2B-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## ✨ Điểm Nổi Bật Ở Phiên Bản 2.5

- 📐 **Bố Cục 3 Tầng Chuẩn Shorts / Reels / TikTok (Stacked Layout 9:16)**:
  - **Tầng trên (20%)**: Header nhận diện thương hiệu độc quyền (`>_ LOGO`, Tên kênh, Tag chủ đề) cùng Badge động phát sáng glassmorphism.
  - **Tầng giữa (50%)**: Từng phân cảnh hiển thị linh kiện chuyên biệt:
    - *Hook*: Khung Laptop Mockup hiển thị web preview cuộn mượt bài viết với nhãn `LIVE PREVIEW`.
    - *Body 1 (Stat Hero)*: Số liệu thống kê **150px Neon** rực rỡ kèm hiệu ứng spotlight.
    - *Body 2 (Feature Card)*: Thẻ tính năng kính mờ (Glassmorphism) với bullet points cyan.
    - *Body 3 (Callout Quote)*: Thẻ trích dẫn viền neon hồng sang trọng.
    - *Outro*: TikTok Follow Card nổi bật ở trung tâm, animation nút bấm chuyển từ "Follow" sang "Following".
- 🎙️ **Giọng Đọc Thật Tiếng Việt 100% (Miễn Phí với Edge Neural TTS)**:
  - Tích hợp Microsoft Neural TTS qua Python `edge_tts`, hỗ trợ giọng `vi-VN-HoaiMyNeural` (Nữ truyền cảm) và `vi-VN-NamMinhNeural` (Nam dứt khoát).
  - Không tốn tiền, không cần API Key, không lo timeout.
- 🎶 **Phụ Đề Karaoke Thời Gian Thực (Word-by-Word Highlight)**:
  - Từ đang đọc được phóng to và chuyển màu vàng/trắng neon nổi bật.
  - Visualizer sóng âm Equalizer chuyển động đồng bộ nhịp nói.
- 🤖 **AI Biên Tập Kịch Bản Đa Năng (Google Gemini)**:
  - Tích hợp Gemini API (`gemini-3.5-flash`, `gemini-3.5-flash-lite`) tự động đọc nội dung web/GitHub để viết kịch bản 5 cảnh giật tít, phiên âm số và ký hiệu chuẩn ngữ pháp tiếng Việt.
  - Có sẵn bộ tổng hợp Offline Heuristic thông minh tự động kích hoạt nếu không có API key.

---

## 🚀 Hướng Dẫn Cài Đặt Nhanh

### 1. Yêu Cầu Hệ Thống
- **Node.js**: v20+ hoặc v22+
- **Python**: 3.10+ (Đã cài `edge-tts`: `pip install edge-tts`)
- **FFmpeg**: Đã thêm vào biến môi trường PATH máy tính.

### 2. Cài Đặt Dự Án
```bash
# Clone repository
git clone https://github.com/hien23ns/autogen-video.git
cd autogen-video

# Cài đặt thư viện Node.js
npm install

# Cài đặt thư viện Python TTS (nếu chưa có)
pip install edge-tts
```

---

## 🛠️ Hướng Dẫn Tùy Biến Thông Tin Độc Quyền & Thương Hiệu (Branding)

Tất cả thông tin thương hiệu độc quyền được cấu hình qua file `.env.local` (file này được bảo mật và tự động bỏ qua khi push lên GitHub).

### Bước 1: Tạo file cấu hình `.env.local`
```powershell
# Trên Windows PowerShell
Copy-Item .env.example .env.local

# Trên Linux/macOS
cp .env.example .env.local
```

### Bước 2: Tùy Biến Thông Tin Kênh & Mạng Xã Hội
Mở file `.env.local` và chỉnh sửa:

```ini
# ════════════════════════════════════════════════════════════════════════════
# THÔNG TIN KÊNH & PROFILE CARD (Header & Outro)
# ════════════════════════════════════════════════════════════════════════════
# Tên kênh của bạn
TIKTOK_DISPLAY_NAME=Code Suy 24h 🔱

# Tên người dùng / Handle mạng xã hội (bắt đầu bằng dấu @)
TIKTOK_HANDLE=@codesuy24h

# Số người theo dõi hiển thị trên thẻ Outro Follow
TIKTOK_FOLLOWERS=2x followers

# (Tùy chọn) URL ảnh đại diện online, hoặc để trống để dùng ảnh trong thư mục assets/
# TIKTOK_AVATAR_URL=https://example.com/avatar.jpg
```

#### Cách thay đổi Avatar đại diện:
Bạn chỉ cần thả file ảnh đại diện (định dạng `.png`, `.jpg`, `.jpeg` hoặc `.webp`, tỷ lệ 1:1) vào thư mục:
📁 `assets/` (Ví dụ: `assets/codesuy24h.png` hoặc `assets/avatar.png`).
Pipeline sẽ tự động quét và nhận diện ảnh đại diện của bạn.

#### Cách thay đổi Logo / Biểu tượng ở góc trên bên trái:
Trong file `src/render/html-composer.ts` (dòng 94–98):
- `<div class="brand-icon">&gt;_</div>`: Đổi ký tự icon hoặc thay bằng thẻ `<img src="..." />`.
- `<div class="brand-tag">BLOG IT</div>`: Đổi chữ nhãn phụ (ví dụ: `AI NEWS`, `TECH REVIEW`...).

---

### Bước 3: Cấu Hình Giọng Đọc AI & Tốc Độ (TTS)
Trong file `.env.local`:
```ini
# Chọn nhà cung cấp TTS: "edge-tts" (Miễn phí, chất lượng cao)
TTS_PROVIDER=edge-tts

# Lựa chọn giọng đọc tiếng Việt:
# - vi-VN-HoaiMyNeural   : Giọng Nữ miền Bắc truyền cảm (Khuyên dùng)
# - vi-VN-NamMinhNeural  : Giọng Nam miền Bắc trầm ấm
EDGE_TTS_VOICE=vi-VN-HoaiMyNeural

# Tốc độ đọc:
# - "+0%"  : Tốc độ chuẩn
# - "+10%" : Tốc độ nhanh hơn (rất thích hợp cho TikTok/Reels để giữ chân người xem)
EDGE_TTS_RATE=+10%
```

---

### Bước 4: Thêm API Key Google Gemini (Viết Kịch Bản Tự Động)
Để video có kịch bản biến hóa sâu sắc theo từng link bài viết:
1. Đăng ký nhận API key miễn phí tại: [Google AI Studio](https://aistudio.google.com/).
2. Dán API key vào file `.env.local`:
```ini
GEMINI_API_KEY=AIzaSyYourSecretKeyHere
```
> 🔒 **Lưu ý bảo mật**: File `.env.local` đã nằm trong `.gitignore`, tuyệt đối không bao giờ bị push lên GitHub.

---

### Bước 5: Lựa Chọn Theme Giao Diện Video

Hệ thống hỗ trợ 3 theme được trau chuốt tỉ mỉ:
1. `cyberpunk` (Mặc định được khuyến nghị): Phong cách viễn tưởng neon vàng (`#ffe600`), cyan (`#00f0ff`) và magenta (`#ff0055`) với hiệu ứng lưới công nghệ 3D.
2. `dark-neon`: Xanh navy, tím neon và xanh dương huyền bí.
3. `light-pro`: Tông trắng xám sang trọng cho tin tức doanh nghiệp, tài chính.

Bạn có thể chỉnh mặc định trong `.env.local`:
```ini
VIDEO_THEME=cyberpunk
```

---

## 🎬 Cách Sử Dụng Tạo Video Một Chạm

Chạy lệnh với bất kỳ URL bài báo (VnExpress, Zing, Dev.to, Medium...) hoặc GitHub repository:

```bash
# Tạo video từ GitHub repository với theme Cyberpunk
npm run pipeline -- --url https://github.com/hien23ns/Secmon --theme cyberpunk

# Hoặc tạo video từ bài báo công nghệ
npm run pipeline -- --url https://github.com/facebook/react --theme cyberpunk
```

### Kết Quả Đầu Ra
Sau khi chạy xong, video và toàn bộ tài nguyên sẽ được lưu tại:
📁 `output/<tên-dự-án>-<timestamp>/`:
- 📹 `video.mp4`: Video hoàn thiện 1080x1920 30FPS chuẩn 9:16 có đầy đủ hình ảnh, âm thanh, giọng đọc và phụ đề karaoke.
- 🎙️ `voice.mp3`: File giọng thuyết minh riêng biệt (dễ dàng import vào CapCut/Premiere).
- 📜 `script.txt`: Toàn bộ kịch bản và timestamp phụ đề SRT.

---

## 🧪 Kiểm Thử (Unit Tests)

Dự án đi kèm bộ test toàn diện bảo đảm hệ thống luôn hoạt động ổn định:
```bash
npm test
```
*(Hiện tại 70/70 unit tests đều pass 100%).*

---

## 📜 Giấy Phép (License)
Dự án được phân phối dưới giấy phép MIT License.
