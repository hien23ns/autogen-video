# BÁO CÁO AUDIT TOÀN DIỆN HỆ THỐNG AUTO VIDEO GEN (v2.5)

**Ngày lập:** 2026-10-20  
**Tác giả:** Đội ngũ Kỹ sư Motion-Graphics, AI Video Pipeline, Audio & QA  
**Repository:** `hien23ns/autogen-video`  
**Công nghệ lõi:** Node 20+, TypeScript 5+, HyperFrames 0.4.34 (HTML5/CSS3/GSAP/Chromium Headless), FFmpeg 8.0, Vitest 4.1.

---

## 1. KIẾN TRÚC HIỆN TẠI & LUỒNG DỮ LIỆU

### 1.1. Sơ đồ luồng dữ liệu (End-to-End Pipeline)

```
[Input: URL / GitHub Repo / File .txt / script.json]
   │
   ├─► Step 1: Scraper (`src/scraper/web-scraper.ts`)
   │     - Trích xuất Title, Description, Body Text, og:image
   │     - Xử lý đặc thù GitHub: REST API repos metadata + README raw
   │
   ├─► Step 2: Kịch bản AI (`src/generator/ai-script.ts`)
   │     - Model: Gemini 3.5 Flash (hoặc offline heuristic synthesizer)
   │     - Chuẩn hoá phiên âm TTS tiếng Việt (quy tắc đọc số, % , đơn vị, từ viết tắt)
   │     - Phân loại Theme tự động (cyberpunk, matrix-code, sunset-vibes, crimson-beast, light-pro, dark-neon)
   │     - Xuất cấu trúc `script.json` (ScriptSchema Zod)
   │
   ├─► Step 3 & 4: Assets & TTS song song (`src/pipeline.ts`)
   │     - Tải ảnh nền `og:image` -> `output/.../images/bg.jpg`
   │     - Sinh giọng đọc TTS: Edge TTS / LucyLab / ElevenLabs / Vbee
   │     - Xuất các file giọng nói từng cảnh: `scene-<id>.mp3` + file subtitle `.srt`
   │
   ├─► Step 5: Xử lý âm thanh & Sound Design (`src/assets/audio-tools.ts`, `sfx-selector.ts`)
   │     - Ghép các file voice với khoảng lặng 0.3s (FFmpeg concat filter với 8ms micro-fade chống click/pop)
   │     - Quét từ khoá chọn SFX tự động 3 tầng (override -> semantic keyword -> template default)
   │     - Trộn SFX và nhạc nền BGM (looping, âm lượng cố định 0.08) -> `voice.mp3`
   │
   ├─► Step 6: Tổng hợp HTML Composition (`src/render/html-composer.ts`)
   │     - Bố cục 3 tầng 1080x1920 9:16:
   │         * Tier Top (20%): Badge + Headline + Shimmer sweep
   │         * Tier Mid (50%): Template Layout (Laptop mockup, Stat hero, Comparison, Feature list, Callout, Outro)
   │         * Tier Bot (30%): Dynamic Karaoke subtitles + Waveform bars
   │     - Gắn GSAP timeline vào `window.__timelines["news-video"]`
   │
   ├─► Step 7: Render Video (`src/render/hyperframes-runner.ts`)
   │     - Gọi `npx hyperframes render <outputDir> --output video.mp4 --fps 30/60`
   │     - Chromium headless seek từng frame và chụp hình -> FFmpeg mã hóa H.264
   │
   └─► Step 8: Hoàn tất & Tự động hoá
         - Xuất: `video.mp4`, `voice.mp3`, `script.txt`, `index.html`, `styles.css`
         - Hỗ trợ Bot Telegram (`src/bot/telegram-bot.ts`) & GitHub Actions CI (`render.yml`)
```

---

## 2. AUDIT 6 TEMPLATE HIỆN TẠI

Codebase hiện tại xây dựng 6 layout template chính:

| STT | Template Name | Dữ liệu `templateData` | Đặc điểm trực quan | Trạng thái chuyển động |
|---|---|---|---|---|
| 1 | `hook` (`breaking-news`) | `headline`, `subhead`, `bgSrc`, `kenBurns` | Khung Mockup Laptop MacBook Pro viền kim loại, browser bar `https://<domain>`, màn hình auto-scroll ảnh bài báo hoặc code. | Mockup trượt lên `y: 60 -> 0`, headline `scale: 0.5 -> 1`, scroll track cuộn tuyến tính `ease: "none"`. |
| 2 | `stat-hero` (`stat-callout` / `big-number`) | `value`, `label`, `context` | Khối số lớn trung tâm font Anton/Bebas phát sáng neon orb, nhãn giải thích và context. | Con số phóng to `scale: 0.4 -> 1` kèm shimmer mask quét qua, nhãn trượt lên `y: 40 -> 0`. |
| 3 | `comparison` (`split-screen`) | `left` (label, value, color), `right` (label, value, color, winner) | 2 thẻ bài đối xứng Cyan vs Purple, huy hiệu VS ở giữa, badge WINNER trên thẻ thắng cuộc. | 2 thẻ trượt từ 2 bên mép vào (`x: -80/+80 -> 0`), huy hiệu VS pop `scale: 0.5 -> 1`. |
| 4 | `feature-list` (`listicle`) | `title`, `bullets` (1-4), `icon` | Thẻ danh sách viền neon bo góc, đường kẻ phát sáng, các mục bullet point xếp dọc. | Card đẩy từ dưới lên, đường line bung ngang `scaleX: 0 -> 1`, các bullet trượt so le `i * 0.15s`. |
| 5 | `callout` (`quote-card`) | `statement`, `tag` | Thẻ trích dẫn Glassmorphism mờ đục, biểu tượng ngoặc kép lớn `“`, tag chủ đề. | Toàn bộ card nâng lên `y: 50 -> 0`, `scale: 0.92 -> 1`. |
| 6 | `outro` | `ctaTop`, `channelName`, `source` | Thẻ TikTok Profile tương tác giả lập: Avatar, Tên kênh, Handle, Followers, nút Follow tự động ấn thành "Following". | CTA trượt xuống, đường underline bung rộng, thẻ trôi lên, nút follow nén lại rồi chuyển trạng thái kèm tick xanh. |

---

## 3. ĐIỂM YẾU HÌNH ẢNH, ANIMATION VÀ ÂM THANH

### 3.1. Hình ảnh & Motion Graphics
1. **Thiếu vật lý Spring và Bezier Curves:** Đa số animation dùng easing cơ bản của GSAP (`power1.inOut` hoặc tuyến tính `none`). Chưa có độ nảy sinh động (spring overshoot), tạo cảm giác giật và cơ học.
2. **Quy tắc Entrance chưa chuẩn:** Một số phần tử chỉ thay đổi độ mờ (opacity) hoặc trượt đơn thuần, vi phạm nguyên tắc kết hợp đồng thời **≥ 3 thuộc tính** (Fade + Rise/Slide + Scale Pop).
3. **Choreography thiếu liên kết:** Thiếu chuyển động camera tổng thể (virtual camera navigation: push-in, pull-out, tilt, punch-in) kết nối các tầng giao diện.
4. **Nền chuyển động còn thô:** Nền `.dynamic-mesh-bg` dùng các `div` orb bo tròn di chuyển đơn điệu, chưa có shader gradient mesh nhiều lớp, thiếu dynamic grain và parallax depth.
5. **Ken Burns chưa tối ưu:** Ảnh tĩnh chỉ zoom 1 hướng duy nhất theo class CSS cố định, chưa thích ứng theo tiêu điểm hình ảnh thực tế.
6. **Nguy cơ Safe Zone:** Các phần tử ở sát cạnh trên/dưới/phải có nguy cơ bị che bởi giao diện của TikTok (nút like/share, thanh tìm kiếm, mô tả video, âm thanh gốc).

### 3.2. Phụ đề (Captions)
1. **Heuristic Karaoke giả lập:** `karaoke-timing.ts` ước lượng thời gian hiển thị từng từ theo số ký tự và dấu câu. Chưa bắt đúng timestamp thực tế từ audio TTS hoặc Whisper.
2. **Đơn điệu về Style:** Chỉ có 1 kiểu karaoke màu vàng nảy chữ, chưa có các phong cách viral như Pop-in từng từ, Box highlight, Underline vẽ tay hay Minimalist.
3. **Thiếu Smart Keyword Color:** Chưa tự động làm nổi bật từ khóa (tên riêng, số liệu, tính từ mạnh).

### 3.3. Âm thanh & Sound Design
1. **Chưa có BGM Sidechain Ducking:** Nhạc nền BGM chạy âm lượng cố định 0.08, đè lên giọng nói hoặc làm mờ giọng ở các đoạn cao trào; cần sidechain compressor tự dìm BGM khi có giọng đọc.
2. **Chưa chuẩn hóa Loudness EBU R128:** Chưa tích hợp bộ lọc -14 LUFS / -1 dBTP theo tiêu chuẩn video ngắn.
3. **Thiếu Manifest bản quyền:** Thư mục SFX/BGM chưa có tài liệu chứng minh nguồn mở / miễn phí bản quyền (CC0 / Royalty Free).

### 3.4. Nợ kỹ thuật & Hạn chế tính năng
1. **Chưa có tính năng Edit Video quay thật:** Hoàn toàn chưa có pipeline xử lý video thô (transcribe, cắt khoảng lặng, chọn take tốt nhất, punch-in reframe 9:16).
2. **Chưa có Vòng lặp QA tự động:** Chưa có script trích frame để kiểm tra visual clipping, contrast, lệch audio-visual sau khi render.
3. **Chưa hỗ trợ Đa tỉ lệ khung hình:** Mọi layout bị gắn chặt cứng vào 1080x1920 (9:16), chưa thích ứng được cho 16:9, 1:1, 4:5.

---

## 4. BẢNG PHÂN TÍCH RỦI RO KỸ THUẬT

| Rủi ro | Tác động | Xác suất | Giải pháp kiểm soát |
|---|---|---|---|
| Lệch đồng bộ Audio - Visual khi ghép word-level timestamps | Lỗi giật phụ đề, tiếng đi trước chữ | Cao | Xây dựng bộ đồng bộ thời gian tuyệt đối `TimelineCoordinator` với độ lệch cho phép < 30ms. |
| Hiệu năng render HyperFrames ở 60fps | Render chậm, Chromium ngốn RAM | Trung bình | Tối ưu DOM/CSS (chỉ dùng CSS transform/opacity có GPU composite), phân tách preset `draft` (30fps) và `final` (60fps). |
| Phụ thuộc môi trường Whisper cho video thật | Lỗi khi máy người dùng không có Python/GPU | Cao | Kiến trúc Adapter kép: tự động dò Whisper cục bộ (faster-whisper/whisper.cpp), fallback sang OpenAI API nếu có key, hoặc ffmpeg silencedetect offline. |
| Phá vỡ tương thích ngược với kịch bản cũ | Lỗi crash CLI hoặc bot Telegram | Cao | Giữ nguyên schema cũ và mở rộng bằng Zod optional fields; mọi schema mới đều có migration adapter. |
