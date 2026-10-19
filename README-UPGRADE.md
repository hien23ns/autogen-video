# 🎬 Hướng Dẫn Nâng Cấp Hệ Thống Auto Video Gen (v2.5)

Tài liệu này hướng dẫn chi tiết cách thiết lập, cấu hình tự động hóa 24/7 và chạy thử nghiệm hệ thống tạo video tin tức ngắn công nghệ dạng 9:16 (TikTok/Reels/Shorts) với **Bố cục 3 tầng hiện đại**, **Khung Mockup Laptop/Smartphone với Web Auto-Scroll**, và **Phụ đề Karaoke động**.

---

## 1. Danh Sách GitHub Secrets Cần Thiết Lập

Truy cập repository trên GitHub: **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**:

| Tên Secret | Bắt buộc | Mô tả |
| :--- | :---: | :--- |
| `TELEGRAM_BOT_TOKEN` | **Có** | Token của Telegram Bot dùng để gửi file video MP4 hoàn tất về người nhận. |
| `GEMINI_API_KEY` | Khuyên dùng | API Key của Google Gemini (`gemini-2.5-flash`) từ Google AI Studio để tự động tóm tắt bài viết và sinh kịch bản chuẩn TTS tiếng Việt. *(Nếu không có, hệ thống sẽ tự động chuyển sang bộ sinh kịch bản offline thông minh).* |
| `GH_PAT` (Personal Access Token) | Để Make.com gọi | Token tài khoản GitHub (cấp quyền `repo`) dùng khi cấu hình Webhook gọi API `repository_dispatch`. |

### Hướng dẫn tạo Telegram Bot & lấy Chat ID:
1. Mở Telegram, tìm kiếm **`@BotFather`**, gửi lệnh `/newbot` và đặt tên bot để nhận `TELEGRAM_BOT_TOKEN`.
2. Gửi bất kỳ một tin nhắn cho bot vừa tạo (ví dụ: `xin chao`).
3. Lấy `chat_id` của bạn bằng cách:
   * Mở trình duyệt truy cập: `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates`
   * Tìm giá trị `"id"` trong đối tượng `"chat"` (ví dụ: `123456789`).
   * *Hoặc nhắn tin cho bot `@userinfobot` để xem ID cá nhân ngay lập tức.*

---

## 2. Cấu Hình Tự Động Hóa 24/7 qua Make.com (hoặc Webhook)

Khi có bài viết mới hoặc người dùng gửi link qua Telegram, Make.com sẽ kích hoạt GitHub Actions thông qua module **HTTP - Make a request**.

### Cấu hình Module HTTP trên Make.com:
* **URL:** `https://api.github.com/repos/<GITHUB_USERNAME>/<REPO_NAME>/dispatches`
* **Method:** `POST`
* **Headers:**
  * `Accept`: `application/vnd.github.v3+json`
  * `Authorization`: `Bearer <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>`
  * `User-Agent`: `Make-Automation-Agent`
  * `Content-Type`: `application/json`

### JSON Request Body mẫu:
```json
{
  "event_type": "render_video",
  "client_payload": {
    "url": "https://github.com/facebook/react",
    "chat_id": "123456789",
    "theme": "cyberpunk"
  }
}
```

*Tuỳ chọn `theme` hỗ trợ:* `cyberpunk` (mặc định), `dark` (dark-neon), `light` (light-pro).

---

## 3. Lệnh Chạy Thử Nghiệm Thủ Công trên Máy Local

Bạn có thể chạy thử nghiệm trực tiếp trên máy tính cá nhân để kiểm tra chất lượng video trước khi kích hoạt quy trình tự động.

### Cài đặt môi trường ban đầu:
```bash
npm install
```

### 1. Tạo video tự động từ một URL (Bài báo hoặc GitHub Repo):
```bash
# Render với theme Cyberpunk công nghệ (Neon Yellow + Cyan):
npm run pipeline -- --url https://github.com/facebook/react --theme cyberpunk

# Render với theme Dark hiện đại và xuất ra file MP4 chỉ định:
npm run pipeline -- --url https://vnexpress.net/so-hoa --output output/tin-tuc.mp4 --theme dark

# Render với theme Light Pro tinh tế:
npm run pipeline -- --url https://github.com/Cuongyd196/auto-compare-video --theme light
```

### 2. Chạy từ file kịch bản mẫu có sẵn:
```bash
npm run pipeline -- tests/fixtures/sample-script-with-image.json --theme cyberpunk
```

### 3. Kiểm tra toàn bộ Test Suite:
```bash
npm test
```
*(Hiện tại 70/70 tests đều pass 100%, bao gồm kiểm tra Layout 3 tầng, Karaoke Timing, Mockups, Scraper, AI Script và TTS Providers).*

---

## 4. Các Điểm Nâng Cấp Nổi Bật Trong Phiên Bản v2.5

1. **Bố cục 3 tầng chuẩn 9:16:**
   * **Tầng trên (20%):** Glassmorphism Badge chủ đề (`🔥 TIN NÓNG ĐỘT PHÁ`, `⚡ CÔNG NGHỆ 24H`) và tiêu đề giật tít, font **Be Vietnam Pro & Montserrat** với viền đổ bóng chống chìm chữ trên mọi nền.
   * **Tầng giữa (50%):** Khung Mockup Laptop MacBook Pro / Smartphone iPhone với camera notch và màn hình hỗ trợ **Web Auto-Scroll mượt mà**.
   * **Tầng dưới (30%):** Module **Phụ đề Karaoke động**, highlight từng từ theo thời gian thực đồng bộ cùng giọng đọc TTS.
2. **Nền Dynamic Mesh Gradient:** Chuyển động nhẹ với 3-4 glowing orbs và lưới công nghệ tech grid thay thế nền tĩnh.
3. **Theme Cyberpunk mới:** Phối màu vàng neon `#fcee0a`, xanh cyan `#00f0ff` và magenta `#ff0055` cực kỳ cuốn hút trên TikTok/Reels.
4. **Tích hợp Gemini AI Script Generator & Scraper:** Tự động chuyển đổi số và ký hiệu theo quy tắc phát âm TTS tiếng Việt chuẩn xác (ví dụ: `GPT 5.5` -> `GPT năm chấm năm`, `82.7%` -> `tám mươi hai phẩy bảy phần trăm`).
