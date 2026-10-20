# 🤖 AGENTS.MD — AI AGENT CONVENTIONS & ARCHITECTURE

Tài liệu này quy định các nguyên tắc, chuẩn mực kiến trúc và quy ước bắt buộc cho mọi AI Agent (Antigravity, Claude Code, Cursor, Windsurf) khi làm việc trong repository **Auto Video Gen**.

---

## 1. TỔNG QUAN HỆ THỐNG & CÔNG NGHỆ

- **Ngôn ngữ & Runtime:** Node.js 20+ (ESM modules), TypeScript strict mode.
- **Motion Graphics Engine:** HyperFrames (HTML5, Vanilla CSS, GSAP 3).
- **Audio & Video Processing:** FFmpeg 7+ / 8+ (ebur128, loudnorm, silencedetect, sidechaincompress).
- **TTS Providers:** Edge TTS (miễn phí, mặc định), LucyLab, Vbee, ElevenLabs.
- **Kiểm thử (Test Suite):** Vitest (`npm test`).

---

## 2. NGUYÊN TẮC BẮT BUỘC (NON-NEGOTIABLES)

1. **Tương thích ngược 100%:**
   - Lệnh `/create-news-video`, CLI hiện tại (`--url`, `--output`, `--theme`), và cấu trúc `script.json` cũ phiên bản 1.0/2.0 phải luôn chạy bình thường.
   - Khi mở rộng schema, sử dụng `zod` với các trường tuỳ chọn hoặc có giá trị mặc định.

2. **Quy tắc kiểm chứng (Never Say Done Without Verification):**
   - Mọi thay đổi mã nguồn phải chạy qua `npm test` và đạt 100% test xanh trước khi hoàn tất.
   - Khi chỉnh sửa render, bắt buộc kiểm tra bằng video thật hoặc công cụ `npm run qa:video`.

3. **Bảo mật & Giấy phép (Licenses):**
   - Tuyệt đối không commit API key hoặc secrets vào git. Luôn dùng `.env` và cập nhật `.env.example`.
   - Mọi asset (SFX, BGM, font) phải có giấy phép thương mại (Commercial Safe) và được ghi danh trong `assets/LICENSES.md`.

4. **Tiếng Việt là ưu tiên số 1:**
   - `voiceText`: Đọc bằng TTS nên các số liệu, phiên bản phải được phiên âm chữ tiếng Việt (ví dụ: `2.0` -> `hai chấm không`).
   - `templateData`: Chữ hiển thị trên màn hình giữ nguyên định dạng số (`2.0`, `15.4k`).
   - Phụ đề phải ngắt dòng thông minh (2–5 từ/nhịp), không ngắt cụm từ có nghĩa, nằm gọn trong vùng an toàn (Safe Zone).

---

## 3. QUY ƯỚC MOTION DESIGN & ANIMATION

- **Easing:** Bắt buộc dùng Spring physics (`back.out(1.7)`, `elastic.out`) hoặc Custom Bezier; **cấm dùng linear hoặc easeInOut mặc định**.
- **Quy tắc 3 thuộc tính:** Mọi phần tử xuất hiện phải kết hợp tối thiểu 3 thuộc tính: `opacity` + `y/x translate` + `scale/blur`. Cấm "lonely opacity fade".
- **Staggered Choreography:** Các phần tử vào so le 3–6 frame theo thứ bậc (Badge -> Tiêu đề -> Số liệu -> Chú thích).
- **Không nền phẳng (No Flat Backgrounds):** Luôn dùng Dynamic Mesh Gradient + Grain noise overlay + Vignette viền tối.
- **Ảnh tĩnh:** Luôn có hiệu ứng Ken Burns (zoom-in/pan chậm) đổi hướng theo từng cảnh.
- **Safe Zone:** Tránh vùng UI TikTok/Shorts (đỉnh 12%, đáy 22%, cạnh phải 10%).

---

## 4. QUY ƯỚC SOUND DESIGN & MASTERING

- **Mastering Loudness:** Âm lượng tổng thể đạt chuẩn phát sóng quốc tế: **-14.0 LUFS, True Peak ≤ -1.0 dBTP**.
- **Dynamic BGM Ducking:** Sử dụng FFmpeg `sidechaincompress`, tự động hạ nhạc nền -18dB khi có giọng đọc và dâng mượt khi nghỉ câu.
- **SFX Frame-Accurate:** Ánh xạ âm thanh đúng frame xuất hiện của chuyển động (`whoosh`, `impact`, `chime`).

---

## 5. DANH MỤC LỆNH SLASH & AGENT SKILLS

Repository hỗ trợ đồng bộ hoàn toàn giữa Antigravity (`.agents/skills/`) và Claude Code (`.claude/skills/`). Chạy `npm run skills:sync` để đồng bộ.

| Lệnh Slash | Skill Tương Ứng | Mô Tả |
| :--- | :--- | :--- |
| `/create-news-video` | `create-news-video` | Tạo video 9:16 từ bài báo hoặc file .txt |
| `/edit-raw-video` | `edit-raw-video` | AI Ghost Editor: cắt lỗi, chọn best take, reframe 9:16 |
| `/repo-to-video` | `github-repo-to-video` | Biến repo GitHub thành video giới thiệu công nghệ |
| `/video-qa` | `video-qa` | Chạy bộ phân tích chất lượng video và đo LUFS |
| `/make-captions` | `captions` | Tạo phụ đề karaoke 5 phong cách chuẩn viral |
| `/publish-pack` | `publish-pack` | Xuất copy đa nền tảng, checklist và cover thumbnail |

---

## 6. DANH MỤC NPM SCRIPTS

```bash
npm test                  # Chạy toàn bộ 80+ unit tests (Vitest)
npm run pipeline -- ...   # Chạy pipeline tạo video từ URL hoặc script.json
npm run rerender -- ...   # Re-render composition có sẵn (--scene, --preset, --ratio)
npm run studio            # Mở HyperFrames Visual Studio chỉnh sửa timeline
npm run batch -- urls.txt # Tạo hàng loạt video từ danh sách URL
npm run edit-raw -- ...   # AI Ghost Editor cắt video quay thật
npm run qa:video -- ...   # Kiểm tra chất lượng và loudness video MP4
npm run voice:sample      # Thử giọng đọc TTS nhanh
npm run prompts:preview   # Tạo ảnh preview cho thư viện prompts
npm run skills:sync       # Đồng bộ skills sang .claude/skills/
npm run doctor            # Chẩn đoán môi trường máy (Node, FFmpeg, API keys)
```
