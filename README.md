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

### Bước 5: Lựa Chọn Bộ Giao Diện Video (Themes)

Dự án tích hợp sẵn **6 theme đồ họa cao cấp**, được thiết kế chuyên biệt cho từng chủ đề nội dung trên TikTok / Reels:

| Icon | Tên Theme (`theme`) | Bảng Màu Chủ Đạo | Phong Cách & Nội Dung Phù Hợp |
| :---: | :--- | :--- | :--- |
| ⚡ | **`cyberpunk`** *(Mặc định)* | Vàng Neon (`#ffe600`), Cyan (`#00f0ff`), Hồng Magenta (`#ff0055`) | Công nghệ tương lai, siêu ứng dụng, tin tức công nghệ tổng hợp |
| 💻 | **`matrix-code`** (`matrix`) | Hacker Black (`#030805`), Matrix Green (`#00ff66`), Emerald | Mã nguồn mở GitHub, lập trình viên, an ninh mạng, Linux, DevOps |
| 🌅 | **`sunset-vibes`** (`sunset`) | Synthwave Retro, Tím hoàng hôn (`#8b5cf6`), Cam lửa, Vàng ấm | Trí tuệ nhân tạo (AI), Design, UI/UX, đồ họa, lối sống công nghệ |
| 🔥 | **`crimson-beast`** (`crimson`)| Obsidian Black, Huyết long Đỏ rực (`#ff1e42`), Vàng kim hoàng gia | Cảnh báo khẩn cấp, lỗ hổng Zero-Day, tin tức sốc, drama công nghệ |
| 🌌 | **`dark-neon`** (`dark`) | Xanh đen Navy, Neon Blue (`#3b82f6`), Tím huyền bí | Fintech, điện toán đám mây, kiến trúc hệ thống, server enterprise |
| 💼 | **`light-pro`** (`light`) | Trắng xám sang trọng, Xanh Slate chuyên nghiệp | Tin tức tài chính, kinh doanh số, doanh nghiệp B2B, bài báo chính thống |

Bạn có thể chỉnh theme mặc định trong `.env.local`:
```ini
VIDEO_THEME=cyberpunk
```

---

## 🎬 Cách Sử Dụng Tạo Video Một Chạm

Chạy lệnh với bất kỳ URL bài báo (VnExpress, Zing, Dev.to, Medium...) hoặc GitHub repository kèm theme yêu thích:

```bash
# 1. Tạo video với Theme Hacker Xanh Lá (Matrix Code)
npm run pipeline -- --url https://github.com/hien23ns/Secmon --theme matrix

# 2. Tạo video với Theme Hoàng Hôn Tím Cam (Sunset Vibes)
npm run pipeline -- --url https://github.com/facebook/react --theme sunset

# 3. Tạo video với Theme Cảnh Báo Đỏ Rực (Crimson Beast)
npm run pipeline -- --url https://github.com/hien23ns/Secmon --theme crimson

# 4. Tạo video với Theme Cyberpunk Mặc Định
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

Bạn hoàn toàn có thể vận hành hệ thống tạo video tự động **24/7 không cần bật máy tính**, hoàn toàn miễn phí thông qua GitHub Actions và Make.com. Người dùng chỉ cần gửi link vào Telegram kèm theme mong muốn, sau 2 - 3 phút video sẽ tự động bay về Telegram chat!

```
[ Người Dùng Nhắn Tin Link + Theme Vào Bot Telegram ] 
                          │ 
                          ▼
       [ Make.com Scenario (Bắt Webhook Tức Thì) ] 
                          │ 
                          ▼ (POST repository_dispatch API)
 [ GitHub Actions Cloud Runner (Ubuntu Miễn Phí của GitHub) ] 
       │ 1. Scrape dữ liệu & đọc toàn bộ README.md repo
       │ 2. Gemini AI tạo kịch bản 3-Giây Hook bùng nổ
       │ 3. Edge-TTS đọc voice tốc độ dồn dập +16%
       │ 4. HyperFrames render video 9:16 theo đúng Theme đã chọn
       │ 5. Tự động đồng bộ phụ đề Pop-in Kinetic & hiệu ứng SFX
                          ▼ 
   [ Telegram Bot API: Gửi file video.mp4 về lại cho Người Dùng! ]
```

---

### PHƯƠNG ÁN 1: Điều Khiển Bằng Bot Telegram Trực Tiếp (Local / VPS)

Module Telegram Bot đã được tích hợp sẵn đầy đủ tính năng thông minh trong `src/bot/telegram-bot.ts`:

1. **Khởi động Bot Telegram**:
   ```bash
   npm run bot
   ```

2. **Cách điều khiển qua Telegram**:
   - Gõ `/start` hoặc `/help`: Xem hướng dẫn sử dụng.
   - Gõ `/themes`: Xem danh sách và mô tả 6 theme đồ họa.
   - **Tạo video cực nhanh**: Chỉ cần gửi link trực tiếp kèm tên theme vào chat bot:
     - `https://github.com/facebook/react` *(Tự động áp dụng theme mặc định Cyberpunk)*
     - `https://github.com/hien23ns/Secmon matrix` *(Áp dụng theme Matrix Code xanh lá)*
     - `https://github.com/facebook/react sunset` *(Áp dụng theme Synthwave Sunset)*
     - `https://github.com/hien23ns/Secmon crimson` *(Áp dụng theme Crimson Đỏ lửa)*
   - Bot sẽ tự động thông báo tiến trình từng bước và trả file video MP4 trực tiếp về chat!

---

### PHƯƠNG ÁN 2: Hướng Dẫn Chi Tiết Thiết Lập Chạy 24/7 Với Make.com + GitHub Actions

#### Bước 1: Lấy Token Bot Telegram & Chat ID
1. Mở Telegram, tìm kiếm bot `@BotFather`.
2. Gõ lệnh `/newbot`, đặt tên cho bot (ví dụ: `My Video Gen Bot`) và username (ví dụ: `my_video_autogen_bot`).
3. Copy chuỗi **HTTP API Token** (dạng `77xxxxxxxx:AAExxxxxxxxxxxxx`).
4. Tìm kiếm bot `@userinfobot` trên Telegram, nhấn `/start` để lấy **ID** của bạn (dạng số: `123456789`).

#### Bước 2: Tạo GitHub Personal Access Token (PAT)
1. Truy cập [GitHub Token Settings](https://github.com/settings/tokens).
2. Nhấn **Generate new token (classic)**.
3. Đặt Note: `MakeCom Video Trigger` và chọn Expiration: `No expiration` (hoặc 90 ngày).
4. Tích chọn 2 quyền bắt buộc:
   - ✅ **`repo`** (Full control of private repositories)
   - ✅ **`workflow`** (Update GitHub Action workflows)
5. Cuộn xuống cuối nhấn **Generate token**. Copy và lưu lại token này (`ghp_...`).

#### Bước 3: Thêm Secrets trên Repository GitHub
1. Vào trang repo GitHub của bạn: `https://github.com/<username>/autogen-video`.
2. Chọn tab **Settings** -> **Secrets and variables** -> **Actions**.
3. Nhấn **New repository secret** để thêm 2 secret:
   - Secret 1:
     - Name: `GEMINI_API_KEY`
     - Value: *(Dán API Key Gemini của bạn)*
   - Secret 2:
     - Name: `TELEGRAM_BOT_TOKEN`
     - Value: *(Dán Token Bot Telegram lấy từ @BotFather)*

#### Bước 4: Thiết Lập Kịch Bản (Scenario) Tự Động Hóa Trên Make.com
1. Đăng nhập vào [Make.com](https://www.make.com/) và nhấn **Create a new scenario**.
2. **Thêm Module 1 (Telegram Bot)**:
   - Tìm kiếm và chọn app **Telegram Bot**.
   - Chọn trigger: **Watch Updates**.
   - Nhấn **Add Connection** và dán `TELEGRAM_BOT_TOKEN` của bạn vào -> Nhấn Save.
   - Mục **Limit**: điền `10`.
3. **Thêm Module 2 (HTTP Request đến GitHub API)**:
   - Nhấn dấu `+` nối tiếp Module 1, tìm kiếm và chọn app **HTTP**.
   - Chọn action: **Make a request**.
   - Cấu hình chính xác như sau:
     - **URL**: `https://api.github.com/repos/<username-của-bạn>/autogen-video/dispatches`
       *(Ví dụ: `https://api.github.com/repos/hien23ns/autogen-video/dispatches`)*
     - **Method**: `POST`
     - **Headers**:
       - Name: `Authorization` | Value: `Bearer <GITHUB_PAT_CỦA_BẠN>`
       - Name: `Accept` | Value: `application/vnd.github.v3+json`
       - Name: `Content-Type` | Value: `application/json`
       - Name: `User-Agent` | Value: `Make-Video-Automation`
     - **Body type**: `Raw`
     - **Content type**: `JSON (application/json)`
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
4. **Nhấn Save** kịch bản ở góc dưới và gạt công tắc kích hoạt kịch bản sang **ON** (Immediately as data arrives).

> 🎯 **Thử nghiệm ngay**: Mở bot Telegram của bạn lên và nhắn một đường link (ví dụ: `https://github.com/hien23ns/Secmon`).
> Make.com sẽ lập tức bắt tín hiệu và gửi dispatch sang GitHub Actions. Sau khoảng 2 phút render trên máy ảo Cloud, video hoàn thiện sẽ tự động gửi thẳng về cuộc trò chuyện Telegram của bạn!

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
