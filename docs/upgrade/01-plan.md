# KẾ HOẠCH TRIỂN KHAI NÂNG CẤP TOÀN DIỆN AUTO VIDEO GEN (v3.0)

**Mục tiêu:** Nâng cấp hệ thống thành một Studio Edit Video AI chuyên nghiệp hoàn chỉnh.  
**Nguyên tắc:** Làm liên tục từ đầu đến cuối theo lộ trình 12 bước, cam kết tương thích ngược 100%, kiểm thử và render thật sau mỗi bước.

---

## 1. LỘ TRÌNH TRIỂN KHAI 12 BƯỚC

### 📌 Bước 1: Audit + Kế hoạch
- [x] Tạo `docs/upgrade/00-audit.md` (Kiến trúc, luồng dữ liệu, điểm yếu hình ảnh/animation/âm thanh, nợ kỹ thuật).
- [x] Tạo `docs/upgrade/01-plan.md` (Lộ trình chi tiết từng module, danh sách file, tiêu chuẩn nghiệm thu).

### 🎨 Bước 2: Hệ thống Motion Design & Refactor 6 Template cũ
- [ ] Xây dựng skill mới `.agents/skills/motion-design/` (SKILL.md, motion-patterns.md, design-rules.md, theme.ts).
- [ ] Đồng bộ skill sang `.claude/skills/motion-design/`.
- [ ] Hỗ trợ cấu hình thương hiệu Brand Kit (`brand.config.json`).
- [ ] Tách thư viện component dùng chung vào `src/render/components/` (Badge, Counter, Chart, Card, LowerThird, Waveform, VirtualCamera).
- [ ] Refactor 6 template cũ trong `html-composer.ts`, `animations.js`, `styles.css`:
  - 100% easing chuyển sang spring physics & custom cubic-bezier.
  - Entrance bắt buộc kết hợp ≥ 3 thuộc tính (Fade + Rise + Scale Pop).
  - Tối ưu Staggered choreography & Virtual Camera (push-in, pan, drift).
  - Nền Dynamic Mesh Gradient đa lớp + grain dynamic + vignette.
  - Safe zone chuẩn TikTok/Reels/Shorts (140px top, 320px bottom, 80px right).
- [ ] Kiểm thử vitest + render test template cũ.

### 🔍 Bước 3: Vòng QA Tự động & Smoke Test
- [ ] Xây dựng CLI `scripts/qa-video.ts` (`npm run qa:video -- <file.mp4>`).
  - Trích xuất frame tự động ở đầu/giữa/cuối mỗi scene và điểm chuyển cảnh bằng FFmpeg.
  - Đo độ ồn âm thanh theo chuẩn EBU R128 (Integrated Loudness LUFS, True Peak dBTP, LRA).
  - Phát hiện khoảng lặng bất thường (silence gaps), frame tối/trống, kiểm tra audio-visual drift.
  - Xuất báo cáo chi tiết `qa-report.md` và `qa-report.json`.
- [ ] Thêm test tự động trong vitest cho bộ QA và timing validation.

### 💬 Bước 4: Phụ đề (Captions) Chuẩn Viral
- [ ] Nâng cấp `src/render/karaoke-timing.ts`: Nhận word-level timestamps thực tế từ Edge TTS (SRT/WordBoundary) và LucyLab, fallback Whisper.
- [ ] Bổ sung ≥ 5 phong cách phụ đề viral:
  1. `karaoke-highlight` (chữ đổi màu theo nhịp đọc)
  2. `pop-in-kinetic` (từng từ nảy bật vào màn hình)
  3. `box-highlight` (hộp nền chữ đổi màu linh hoạt)
  4. `hand-drawn-underline` (gạch chân vẽ tay năng động)
  5. `minimal-clean` (phong cách tối giản tinh tế)
- [ ] Thuật toán nhận diện và làm nổi bật từ khóa thông minh (số liệu, từ cảm thán, tên công nghệ, thương hiệu).
- [ ] Ngắt dòng thông minh chuẩn tiếng Việt (tối đa 2 dòng, 2-5 từ mỗi nhịp, luôn trong safe zone).
- [ ] Xuất file `.srt`, `.vtt` và adapter dịch phụ đề đa ngôn ngữ (`--translate`).

### 🎵 Bước 5: Sound Design & Audio Mastering
- [ ] Nâng cấp `src/assets/audio-tools.ts`:
  - Tự động gắn SFX theo bảng ánh xạ animation (whoosh, pop, hit, riser, click).
  - Tích hợp **Sidechain Compressor Ducking** trong FFmpeg: BGM tự động dìm xuống khi có giọng nói và nâng lên ở khoảng nghỉ giữa các cảnh.
  - Chuẩn hoá âm thanh đầu ra đạt **-14 LUFS & True Peak ≤ -1.0 dBTP**.
- [ ] Tạo file `assets/sfx/manifest.json`, `assets/bgm/manifest.json` và `assets/LICENSES.md` ghi nhận bản quyền miễn phí thương mại.
- [ ] Bổ sung script `npm run voice:sample` thử giọng đọc nhanh.

### 🚀 Bước 6: 12 Template Mới + Thư viện Prompt (Tổng ≥ 18 Template)
- [ ] Bổ sung 12 template mới vào `script-schema.ts`, `html-composer.ts`, `animations.js`:
  1. `tutorial-steps` (hướng dẫn từng bước với thanh tiến trình)
  2. `before-after` (so sánh trước/sau dạng thanh trượt split)
  3. `product-showcase` (trưng bày tính năng & mockup 3D tilt)
  4. `timeline` (dòng thời gian tiến trình công nghệ)
  5. `map-route` (sơ đồ luồng/kiến trúc động kèm camera dẫn)
  6. `github-repo-explainer` (giới thiệu repo GitHub: cây thư mục, sơ đồ kiến trúc động, metrics)
  7. `top-list-ranking` (bảng xếp hạng top danh sách)
  8. `chat-conversation` (giả lập tin nhắn hội thoại động)
  9. `code-walkthrough` (hiệu ứng gõ code trực tiếp + highlight dòng)
  10. `data-dashboard` (bảng điều khiển đa biểu đồ động)
  11. `testimonial-reaction` (phản hồi, review, đánh giá thực tế)
  12. `cta-outro` (kêu gọi hành động & follow hiện đại đa nền tảng)
- [ ] Chế độ `--style`: `news`, `tech`, `minimal`, `high-energy`, `luxury`, `retro`.
- [ ] Cơ chế AI tự chọn template và style phù hợp theo nội dung nếu kịch bản không chỉ định.
- [ ] Tạo thư mục `prompts/` với `INDEX.md` và file `.md` cho từng template (kèm prompt mẫu song ngữ, ví dụ JSON).
- [ ] Script `npm run prompts:preview` tạo preview thumbnail/GIF.

### 🎛️ Bước 7: Studio Preview, Tuỳ chỉnh, Đa tỉ lệ & Batch Mode
- [ ] Tích hợp lệnh `npm run studio` mở HyperFrames Visual Timeline Studio.
- [ ] Mở rộng `rerender.ts`: Render lại từng cảnh riêng lẻ (`--scene <id>`) hoặc khoảng thời gian chỉ định qua content hash cache.
- [ ] Hỗ trợ đa tỉ lệ: `--ratio 9:16 | 16:9 | 1:1 | 4:5` tự động co giãn linh hoạt.
- [ ] Lệnh `npm run batch -- urls.txt` tạo video hàng loạt với hàng đợi và kiểm soát CPU.
- [ ] Preset chất lượng: `draft` (nhanh, 30fps) và `final` (1080x1920 60fps).

### 🎬 Bước 8: AI Edit Video Quay Thật (`/edit-raw-video`)
- [ ] Tạo skill `.agents/skills/edit-raw-video/` (+ bản đồng bộ `.claude/skills/edit-raw-video/`).
- [ ] CLI `npm run edit-raw -- <input.mp4> [options]`:
  - Trích xuất audio, transcribe Whisper từng từ.
  - Tự động cắt khoảng lặng (`silencedetect`), lọc từ đệm "ừm, à, ờ, thì, là", loại bỏ câu nói vấp.
  - Nhận diện các lần quay lại (takes) của cùng 1 câu và **tự chọn take tốt nhất**.
  - Ghép nối mượt mà với J/L-cuts, crossfade âm thanh ngắn, chuẩn hóa -14 LUFS.
  - Tự động reframe 9:16 theo chủ thể/khuôn mặt trung tâm.
  - Tự động punch-in zoom nhấn nhá câu nói trọng tâm.
  - Chèn phụ đề viral + motion graphics callout + B-roll gợi ý.
  - Xuất file video MP4 + `timeline.json` + bản so sánh split-screen demo.

### 📦 Bước 9: Đóng gói Nội dung Đăng tải (Publish Pack)
- [ ] Tự động sinh thư mục `publish/` sau mỗi lần render video:
  - Bộ tiêu đề giật tít, mô tả chi tiết, hashtag tối ưu riêng cho TikTok, YouTube Shorts, Facebook Reels.
  - Thumbnail cover chuẩn 9:16 và 16:9 (trích frame đẹp nhất + title card thương hiệu).
  - Gợi ý khung giờ vàng đăng bài và checklist kiểm duyệt nội dung.

### 🤖 Bước 10: Kiến trúc Agent Skills & Slash Commands
- [ ] Đồng bộ hóa toàn bộ skills: `create-news-video`, `motion-design`, `captions`, `edit-raw-video`, `sound-design`, `video-qa`, `github-repo-to-video`, `publish-pack`.
- [ ] Tạo script `npm run skills:sync` đảm bảo `.agents/skills` và `.claude/skills` luôn đồng bộ 100%.
- [ ] Cấu hình các lệnh slash: `/create-news-video`, `/edit-raw-video`, `/repo-to-video`, `/video-qa`, `/make-captions`, `/publish-pack`.
- [ ] Soạn thảo tài liệu `AGENTS.md` hướng dẫn quy ước hoạt động cho AI agent.

### 🛡️ Bước 11: Chất lượng Mã nguồn, Doctor & CI
- [ ] Bổ sung script `npm run doctor` chẩn đoán hệ thống (Node, Python, FFmpeg, fonts, Edge TTS, API keys).
- [ ] Xuất JSON Schema cho kịch bản vào thư mục `schemas/`.
- [ ] Cập nhật `.github/workflows/render.yml` tích hợp quy trình lint, typecheck, vitest và smoke test.
- [ ] Đo lường thời gian thực thi từng bước trong pipeline và in bảng tổng kết hiệu năng.

### 📖 Bước 12: Tài liệu, Demo & Báo cáo Tổng kết
- [ ] Cập nhật tài liệu: `README.md` (tiếng Việt), `README.en.md`, `README.full.md`, `README-UPGRADE.md`, `CHANGELOG.md`.
- [ ] Tạo 3 video demo trong `docs/demos/`:
  1. Demo 1: Video tin tức từ URL bài báo online.
  2. Demo 2: Video GitHub Repo Explainer kiến trúc động.
  3. Demo 3: Video biên tập từ clip quay thô (Ghost-Editor).
- [ ] Soạn thảo báo cáo hoàn tất `docs/upgrade/99-final-report.md`.
