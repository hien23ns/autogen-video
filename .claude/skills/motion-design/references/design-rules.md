# QUY CHUẨN THIẾT KẾ THỊ GIÁC (DESIGN RULES) CHO VIDEO NGẮN 9:16

---

## 1. HỆ THỐNG TYPOGRAPHY TIẾNG VIỆT HOÀN HẢO

### 1.1. Bộ Font Khuyên Dùng
- **Tiêu đề giật tít (Display Headlines):**
  - `Bebas Neue` (Caps, dày, thể thao, tin tức khẩn cấp)
  - `Montserrat` (Trọng số 800 - 900, hiện đại, hỗ trợ dấu tiếng Việt 100%)
  - `Anton` (Impact cao, chắc chắn, phù hợp con số lớn)
- **Văn bản nội dung & Phụ đề (Body & Subtitles):**
  - `Be Vietnam Pro` (Thiết kế tối ưu riêng cho tiếng Việt, dấu thanh cân đối, không bị lệch dòng)
  - `Inter` (Chuẩn mực UI/UX hiện đại, sắc nét ở mọi kích thước)
- **Code & Tech Terminal:**
  - `JetBrains Mono` / `Fira Code` / `Courier New`

### 1.2. Kích thước & Phân cấp (Type Hierarchy)
- **Tiêu đề chính (Tier Top Headline):** 64px – 84px (Line-height: 1.1)
- **Con số kỷ lục (Stat Hero Number):** 140px – 200px (Font Anton/Bebas)
- **Nhãn phụ đề / Thẻ Badge:** 26px – 32px (All Caps, Letter-spacing: 2px)
- **Phụ đề Karaoke (Tier Bot Captions):** 44px – 56px (Đậm, Text-shadow dày chống chìm trên mọi nền)
- **Tối đa 2 font family** trong cùng một video để tránh phân tâm thị giác.

---

## 2. BẢNG MÀU & ĐỘ TƯƠNG PHẢN (PALETTE & CONTRAST)

- Đảm bảo độ tương phản tối thiểu **WCAG AA (4.5:1)** giữa chữ và nền.
- Mọi văn bản trên ảnh hoặc gradient đều phải có lớp phủ tối (`overlay: rgba(0,0,0,0.55)`) hoặc `text-shadow: 0 4px 20px rgba(0,0,0,0.85)`.
- **6 Bảng màu chủ đạo (Visual Styles):**
  1. `cyberpunk`: Vàng chanh neon (`#ffe600`), Xanh ngọc cyan (`#00f0ff`), Hồng magenta (`#ff0055`) trên nền than chì obsidian (`#080c16`).
  2. `matrix-code`: Xanh lá hacker (`#00ff66`), Xanh ngọc sáng (`#22d3ee`) trên nền đen sâu (`#040806`).
  3. `sunset-vibes`: Cam hoàng hôn (`#ff6b35`), Tím synthwave (`#8a2be2`), Vàng mật ong (`#ffc107`).
  4. `crimson-beast`: Đỏ lửa rực cháy (`#ff1744`), Vàng kim hoàng gia (`#ffd700`) trên nền obsidian tối.
  5. `dark-neon`: Xanh navy sâu thẳm (`#0a1628`), Xanh điện tử (`#38bdf8`), Tím neon (`#a855f7`).
  6. `light-pro`: Trắng ngọc trai (`#f8fafc`), Xám phiến đá (`#334155`), Xanh navy doanh nghiệp (`#1e3a8a`).

---

## 3. SAFE ZONE TIÊU CHUẨN (1080 × 1920)

```
┌──────────────────────────────────────────────┐
│  Top Unsafe: 0px -> 140px (Status bar/search)│
├──────────────────────────────────────────────┤
│  Top Safe Zone (140px -> 450px):             │
│  - Huy hiệu chủ đề (Badge)                   │
│  - Tiêu đề giật tít (Headline)               │
├──────────────────────────────────────────────┤
│  Mid Safe Zone (450px -> 1350px):            │
│  - Laptop / Phone Mockup                     │
│  - Biểu đồ, Số liệu lớn, Thẻ so sánh         │
├──────────────────────────────────────────────┤
│  Bot Safe Zone (1350px -> 1600px):           │
│  - Phụ đề Karaoke động (Word-level)          │
│  - Cột sóng âm thanh (Waveform)              │
├──────────────────────────────────────────────┤
│  Bottom Unsafe: 1600px -> 1920px             │
│  (Caption, Hashtag, Audio Disk của TikTok)   │
└──────────────────────────────────────────────┘
```
- **Lề phải:** Chừa trống ít nhất **100px** tính từ cạnh phải để không bị cụm nút Like/Share của TikTok che khuất.
- **Lề trái:** Giữ tối thiểu **60px** đệm an toàn.
