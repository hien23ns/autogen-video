---
name: sound-design
description: Sound design, dynamic BGM sidechain ducking, animation SFX synchronization, and broadcast loudness mastering (-14 LUFS).
---

# Sound Design & Audio Mastering Skill (`/sound-design`)

Thiết kế âm thanh chuyên nghiệp chuẩn phòng thu cho video ngắn: đồng bộ hiệu ứng âm thanh (SFX) với chuyển động hình ảnh, tự động hạ nhạc nền khi có giọng nói (Ducking), và chuẩn hóa âm lượng phát sóng.

## Các Trụ Cột Kỹ Thuật

### 1. Đồng Bộ SFX Theo Chuyển Động (Frame-Accurate SFX Mapping)
Hệ thống lựa chọn SFX 3 tầng:
- **Tầng 1 (Ghi đè kịch bản):** Đọc trực tiếp từ `scene.sfx` nếu kịch bản chỉ định rõ tên và offset.
- **Tầng 2 (Ngữ nghĩa ngữ cảnh):** Tự động phát hiện từ khóa trong lời thoại (`"nhanh"`, `"tăng vọt"`, `"sập"`, `"kỷ lục"`) để ghép âm thanh phù hợp (`whoosh`, `impact`, `glitch`).
- **Tầng 3 (Template mặc định):**
  - Chuyển cảnh / Mở đầu: `whoosh-deep-sweep.mp3`
  - Hiện số liệu / Thống kê: `digital-cash-register.mp3` / `impact-sub-drop.mp3`
  - Đóng thẻ / Outro: `chime-notification.mp3`

### 2. Auto-Ducking Nhạc Nền (Sidechain Compression)
Sử dụng bộ lọc FFmpeg `sidechaincompress`:
- Khi giọng đọc cất lên: Nhạc nền tự động giảm âm lượng xuống -18dB trong 0.2s.
- Khi người nói ngừng nghỉ hoặc hết câu: Nhạc nền tự động dâng lên mượt mà để lấp đầy không gian âm thanh.

### 3. Chuẩn Hóa Âm Lượng Phát Sóng (-14 LUFS)
Áp dụng tiêu chuẩn EBU R128 thông qua bộ lọc `loudnorm`:
- **Integrated Loudness:** `-14.0 LUFS` (chuẩn quốc tế của YouTube, TikTok, Spotify)
- **True Peak:** `≤ -1.0 dBTP` (chống vỡ tiếng và rè loa điện thoại)
- **Loudness Range (LRA):** `11 LU`

### 4. Công Cụ Thử Giọng Nhanh (Voice Sampler)
```bash
npm run voice:sample -- --provider edge-tts --voice vi-VN-NamMinhNeural --text "Xin chào các bạn"
```
Tạo mẫu giọng đọc và kiểm tra cao độ, ngữ điệu, tốc độ trước khi render cả video.
