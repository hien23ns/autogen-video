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
- 🔊 **Hệ Thống Hiệu Ứng Âm Thanh SFX Đa Tầng (Sound Effects)**:
  - Tích hợp 50 hiệu ứng âm thanh (Whoosh, Chime, Pop, Ding, ApplePay...) tự động mix mượt mà vào từng phân cảnh và keyword quan trọng dựa trên ngữ nghĩa (semantic keyword matching).
- 🤖 **AI Biên Tập Kịch Bản Chuyên Sâu (Google Gemini)**:
  - Tự động cào và đọc chi tiết toàn bộ nội dung file `README.md` từ GitHub repo (thay vì chỉ lấy thông tin sao/mô tả cơ bản), giúp AI phân tích sâu kiến trúc kỹ thuật và giải pháp cốt lõi.
  - Tích hợp Gemini API (`gemini-3.5-flash`, `gemini-3.5-flash-lite`) với chiến lược kịch bản viral TikTok 45-55s (Hook giật tít, Body 1 công nghệ lõi, Body 2 ba tính năng ăn tiền, Body 3 nhận định chuyên môn, Outro CTA follow kênh).
  - Tự động phiên âm thuật ngữ tiếng Anh ("AI" -> "ây ai", "LLM" -> "eo eo em", "Nginx" -> "en gin ích"...) và chuyển đổi số sang chữ đọc chuẩn tiếng Việt.

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

# Tải trọn bộ 50 hiệu ứng âm thanh chuyển cảnh SFX
npm run sfx:download
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

## 🤖 Tự Động Hóa 24/7: GitHub Actions + Make.com & Bot Telegram

Bạn hoàn toàn có thể vận hành hệ thống tạo video tự động **24/7 không cần bật máy tính**, hoàn toàn miễn phí thông qua GitHub Actions và Make.com. Người dùng chỉ cần gửi link vào Telegram, sau 2 - 3 phút video sẽ tự động bay về Telegram chat!

```
[ Người Dùng Gửi Link ] 
       │ 
       ▼
[ Bot Telegram / Make.com Webhook ] 
       │ 
       ▼ (Gửi repository_dispatch API)
[ GitHub Actions Cloud Runner (Ubuntu) ] 
       │ 1. Scrape nội dung & đọc README.md
       │ 2. Gemini AI tạo kịch bản 3-Giây Hook bùng nổ
       │ 3. Edge-TTS tạo giọng thuyết minh dồn dập
       │ 4. Render video 9:16 phụ đề Kinetic & SFX
       ▼ 
[ Telegram Bot API: Gửi video.mp4 về lại người dùng! ]
```

---

### PHƯƠNG ÁN 1: Điều Khiển Bằng Bot Telegram Trực Tiếp (Local / VPS)

Nếu bạn muốn chạy bot trực tiếp trên máy hoặc máy chủ cá nhân:

1. **Lấy Token Bot Telegram**:
   - Chat với `@BotFather` trên Telegram, gõ lệnh `/newbot` để tạo bot và nhận `TELEGRAM_BOT_TOKEN`.
   - Lấy Chat ID của bạn bằng cách chat `/start` với `@userinfobot`.

2. **Cấu hình trong file `.env.local`**:
   ```ini
   TELEGRAM_BOT_TOKEN=77xxxxxxxx:AAExxxxxxxxxxxxxxxxxxxxx
   # (Tùy chọn) Điền GITHUB_PAT nếu muốn bot ủy quyền cho GitHub Actions render thay vì chạy trên máy:
   # GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxxxxxx
   # GITHUB_REPO=hien23ns/autogen-video
   ```

3. **Khởi động Bot Telegram**:
   ```bash
   npm run bot
   ```
   > 💬 **Sử dụng**: Mở bot Telegram của bạn, gửi bất kỳ đường link bài viết hoặc link GitHub nào (hoặc gõ `/video <link> [cyberpunk|dark|light]`). Bot sẽ tự động tạo video và gửi file MP4 về cho bạn!

---

### PHƯƠNG ÁN 2: Thiết Lập Chạy 24/7 Miễn Phí Với Make.com + GitHub Actions

#### Bước 1: Tạo GitHub Personal Access Token (PAT)
1. Truy cập [GitHub Token Settings](https://github.com/settings/tokens).
2. Nhấn **Generate new token (classic)**.
3. Đặt tên (ví dụ: `MakeCom-Video-Trigger`) và tích chọn quyền:
   - ✅ `repo` (Toàn quyền quản lý repo)
   - ✅ `workflow` (Quyền chạy workflow)
4. Nhấn **Generate token** và lưu lại chuỗi token này (bắt đầu bằng `ghp_...`).

#### Bước 2: Thêm Secrets trên Repository GitHub
1. Vào trang repo GitHub của bạn: `https://github.com/<tên-bạn>/autogen-video/settings/secrets/actions`
2. Nhấn **New repository secret** và thêm 2 secret:
   - Name: `GEMINI_API_KEY` | Value: *API key Gemini của bạn*
   - Name: `TELEGRAM_BOT_TOKEN` | Value: *Token Bot Telegram lấy từ @BotFather*

#### Bước 3: Cấu Hình Kịch Bản (Scenario) trên Make.com
1. Tạo một kịch bản mới trên [Make.com](https://www.make.com/).
2. **Module 1**: Chọn app **Telegram Bot** -> Action **Watch Updates**:
   - Kết nối với Telegram Bot Token của bạn.
3. **Module 2**: Chọn app **HTTP** -> Action **Make a request**:
   - **URL**: `https://api.github.com/repos/hien23ns/autogen-video/dispatches`
   - **Method**: `POST`
   - **Headers**:
     - `Authorization`: `Bearer <GITHUB_PAT_CỦA_BẠN>`
     - `Accept`: `application/vnd.github.v3+json`
     - `Content-Type`: `application/json`
     - `User-Agent`: `Make-Automation`
   - **Body Type**: `Raw`
   - **Content Type**: `JSON (application/json)`
   - **Request content**:
     ```json
     {
       "event_type": "create_video",
       "client_payload": {
         "url": "{{1.message.text}}",
         "chat_id": "{{1.message.chat.id}}",
         "theme": "cyberpunk"
       }
     }
     ```
4. Bật kịch bản sang chế độ **ON**.
5. Bây giờ, bất kỳ khi nào bạn hoặc người dùng nhắn tin đường link bài báo/GitHub vào Bot Telegram, Make.com sẽ tự động kích hoạt máy ảo GitHub Actions tạo video và Telegram Bot sẽ gửi video hoàn tất về ngay trong cuộc trò chuyện!

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
