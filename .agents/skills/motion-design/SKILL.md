---
name: motion-design
description: Quy chuẩn Motion Graphics chuyên nghiệp cho video ngắn 9:16 (TikTok/Reels/Shorts). Áp dụng hệ thống Spring Easing, Cubic Bezier, 3-Attribute Entrance, Staggered Choreography, Dynamic Mesh Parallax, Virtual Camera và Safe Zone.
---

# Motion Design Skill for Professional Short-Form Video

Bộ kỹ năng và quy tắc chuyển động bắt buộc áp dụng cho mọi template và cảnh quay trong hệ thống Auto Video Gen.

## 1. NGUYÊN TẮC BẤT DI BẤT DỊCH (NON-NEGOTIABLE RULES)

### 1.1. Cấm Linear Easing & Default easeInOut
- **Bắt buộc:** Mọi chuyển động thị giác phải sử dụng **Spring Physics** (`back.out(1.7)`, `elastic.out(1, 0.3)`) hoặc **Custom Cubic Bezier** mượt mà (`cubic-bezier(0.16, 1, 0.3, 1)` - chuẩn Apple/iOS ease-out).
- **Cấm:** Tuyệt đối không dùng `ease: "none"` (tuyến tính) cho các phần tử đồ họa chính (trừ hiệu ứng ticker hoặc noise vô tận). Không dùng `easeInOut` đối xứng gây cảm giác lười biếng.

### 1.2. Quy tắc Entrance 3 Thuộc tính (3-Attribute Entrance)
- Mỗi phần tử khi bước vào cảnh (entrance animation) **PHẢI** kết hợp đồng thời ít nhất 3 thuộc tính chuyển động:
  1. **Opacity:** Fade-in từ `0` đến `1`.
  2. **Translate / Rise:** Trượt nhẹ theo trục Y (`y: 30px -> 0`) hoặc X (`x: -40px -> 0`).
  3. **Scale Pop / Blur:** Độ phóng đại nhẹ (`scale: 0.92 -> 1.0` hoặc `scale: 1.08 -> 1.0`) hoặc rũ bỏ độ mờ (`filter: blur(8px) -> blur(0px)`).
- **Cấm:** "Lonely opacity fade" (chỉ mờ dần sang rõ) hoặc trượt thô không đổi kích thước.

### 1.3. Phối cảnh So le (Staggered Choreography)
- Các thành phần trong một cảnh không bao giờ xuất hiện đồng thời một lúc:
  - **Thứ bậc ưu tiên:** Huy hiệu chủ đề (Badge) -> Tiêu đề chính (Headline) -> Khối nội dung / Số liệu (Body / Number) -> Chú thích (Context) -> Biểu tượng / Nút kêu gọi (Icon / CTA).
  - Khoảng cách xuất hiện giữa các lớp: từ **3 đến 6 frames** (~0.05s - 0.1s ở 60fps).

### 1.4. Nền Sống Động (Dynamic Multi-Layer Parallax)
- Cấm nền màu phẳng đơn sắc.
- Nền bắt buộc gồm 3 lớp chiều sâu (Parallax Depth):
  - **Lớp sâu nhất (Deep Background):** Gradient Mesh động với các glowing orbs trôi nhẹ đa chiều.
  - **Lớp giữa (Midground):** Lưới công nghệ (Tech Grid) hoặc Vignette tối góc 4 cạnh hướng mắt người xem vào trung tâm.
  - **Lớp phủ bề mặt (Foreground Noise):** Lớp hạt điện ảnh (Cinematic Grain Texture) chuyển động bước hạt tinh tế, chống bết màu dải gradient.

### 1.5. Ảnh Tĩnh & Ken Burns 2.0
- Ảnh tĩnh bắt buộc áp dụng chuyển động Ken Burns định hướng (Zoom-In chậm 1.0 -> 1.12 hoặc Pan ngang nhẹ theo tiêu điểm chủ thể).
- Hướng di chuyển của Ken Burns phải **thay đổi luân phiên** giữa các cảnh liên tiếp (Scene 1 zoom-in -> Scene 2 pan-left -> Scene 3 zoom-out) để duy trì cảm giác tươi mới.

### 1.6. Virtual Camera (Camera Ảo)
- Mỗi cảnh có thể kích hoạt hiệu ứng camera ảo:
  - `push-in`: Tiến lại gần để tạo sự kịch tính.
  - `pull-out`: Lùi rộng để hé lộ toàn cảnh hoặc bức tranh lớn.
  - `punch-in`: Giật nhẹ tiêu cự vào khoảnh khắc phát âm từ khóa quan trọng.
  - `drift`: Trôi dạt góc nghiêng nhẹ (`rotation: -0.5deg -> 0.5deg`).

### 1.7. Pacing (Nhịp điệu Thị giác)
- Không có bất kỳ cảnh nào đứng yên (static freeze) quá **1.2 giây**.
- Cứ mỗi **2 đến 3 giây** phải có một "Visual Beat" mới (chữ đổi màu, icon nhấp nháy, biểu đồ chạy nấc, waveform sóng âm nhảy).
- Trong 3 giây đầu tiên (Hook), tốc độ chuyển động và mật độ thông tin phải cao nhất để giữ chân người xem.

### 1.8. Vùng An Toàn TikTok/Reels/Shorts (Safe Zone)
- Khung hình chuẩn: 1080 x 1920 (9:16).
- Vùng cấm đặt văn bản / thông tin quan trọng:
  - **Top Safe Margin:** Cách mép trên tối thiểu **140px** (tránh status bar và thanh tìm kiếm).
  - **Bottom Safe Margin:** Cách mép dưới tối thiểu **320px** (tránh caption bài đăng, hashtag, thanh âm thanh nhạc).
  - **Right Safe Margin:** Cách mép phải tối thiểu **100px** (tránh cụm nút Like, Comment, Share, Bookmark, Profile).
  - **Left Safe Margin:** Cách mép trái tối thiểu **60px**.

---

## 2. BRAND KIT CONFIGURATION (`brand.config.json`)

Mọi thông số màu sắc, font chữ và logo có thể được ghi đè thông qua file `brand.config.json` ở thư mục gốc:

```json
{
  "name": "Code Suy 24h",
  "handle": "@codesuy24h",
  "colors": {
    "primary": "#ffe600",
    "secondary": "#00f0ff",
    "accent": "#ff0055",
    "bgDeep": "#070b14",
    "surface": "rgba(15, 23, 42, 0.75)"
  },
  "fonts": {
    "display": "'Bebas Neue', 'Montserrat', sans-serif",
    "body": "'Be Vietnam Pro', 'Inter', sans-serif",
    "code": "'JetBrains Mono', 'Courier New', monospace"
  },
  "logo": "assets/avatar.png"
}
```
