---
name: captions
description: Viral word-level captions generator — Generates karaoke, pop-in, box-highlight, hand-drawn underline, and minimal caption animations in Vietnamese safe zones with smart keyword highlighting.
---

# Viral Word-Level Captions Skill (`/make-captions`)

Hệ thống phụ đề từng từ (word-level) chuẩn phong cách TikTok/Reels/Shorts triệu view, tối ưu 100% cho tiếng Việt.

## 5 Phong Cách Phụ Đề (`--caption-style`)

1. **`karaoke-highlight` (Mặc định):** Từ đang nói sáng rực màu vàng/cyan `#00f0ff` kèm hiệu ứng glow, các từ còn lại mờ nhẹ.
2. **`pop-in`:** Từng từ nảy nhẹ (scale 1.25x -> 1.0x) đúng mili-giây được phát âm, tạo cảm giác dồn dập, cuốn hút.
3. **`box-highlight`:** Từ đang nói được đóng khung hộp màu tương phản cao (hộp vàng chữ đen hoặc hộp xanh neon).
4. **`hand-drawn-underline`:** Xuất hiện đường gạch chân vẽ tay chuyển động bên dưới từ khóa quan trọng.
5. **`minimal`:** Phong cách tối giản, chữ trắng bóng đổ nhẹ, không nền, tập trung tối đa vào nội dung hình ảnh.

## Quy Tắc Ngắt Dòng Tiếng Việt & Safe Zone

- **Safe Zone:** Phụ đề luôn được đặt cách đáy màn hình tối thiểu 180px–240px để không bị che bởi thanh điều hướng và caption gốc của TikTok/Shorts.
- **Ngắt nhịp:** Mỗi cụm từ chỉ từ 2–5 từ, tối đa 2 dòng hiển thị cùng lúc. Không ngắt rời cụm từ có nghĩa (ví dụ: "trí tuệ / nhân tạo", "hệ điều / hành").
- **Nhấn từ khóa tự động (`isViralKeyword`):** Tự động phát hiện số liệu (ví dụ: `200MP`, `99%`, `1 tỷ`), tên riêng công nghệ (`iPhone`, `Nvidia`, `OpenAI`), và các tính từ giật gân (`khủng`, `đột phá`, `nguy hiểm`) để tăng cỡ chữ và đổi màu neon.

## Xuất Định Dạng

- Nhúng trực tiếp vào HTML composition của HyperFrames thông qua `renderKaraokeHtml()`.
- Tự động xuất file rời `.srt` và `.vtt` chuẩn timestamp để tải lên phụ đề rời trên YouTube Shorts / Facebook.
