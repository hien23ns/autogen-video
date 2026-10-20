---
name: edit-raw-video
description: AI Ghost Video Editor — Analyzes raw spoken video footage, cuts silences, removes filler words and bad takes, auto-reframes to 9:16, applies punch-ins, and masters audio.
---

# AI Raw Video Editor Skill (`/edit-raw-video`)

Biến video quay thô của người nói (nhiều lần vấp, ngập ngừng, nói đi nói lại) thành một video ngắn 9:16 hoàn chỉnh, nhịp điệu nhanh, dứt khoát như được biên tập bởi editor chuyên nghiệp (Ghost-editor).

## Quy Trình 6 Bước

1. **Ingest & Probe:**
   - Trích xuất thông số kỹ thuật (độ dài, khung hình, fps, codec).
   - Tách stream audio 16kHz mono để đưa vào AI phân tích.

2. **Transcribe & Word Timestamps:**
   - Sử dụng Whisper API (`verbose_json` với timestamp từng từ) hoặc bộ phân tích offline.
   - Nhận diện các từ đệm tiếng Việt ("ừm", "ờ", "à", "thì", "là", "kiểu như") và stutters lặp từ.

3. **Phát Hiện Khoảng Lặng (Silence Detection):**
   - Chạy bộ lọc FFmpeg `silencedetect=noise=-32dB:d=0.35` để đánh dấu chính xác mọi khoảng lặng chết giữa các câu.

4. **Chấm Điểm & Chọn Take Tốt Nhất (Best Take Selection):**
   - Khi người nói bắt đầu lại cùng một câu (nhiều takes):
     - Chấm điểm từng take dựa trên: tốc độ nói (WPS), số lượng từ đệm, độ ngập ngừng, độ trọn vẹn ngữ nghĩa.
     - **Chỉ giữ lại duy nhất 1 take có điểm cao nhất.**
     - Đánh dấu các take hỏng trước đó là `bad_take_duplicate` để cắt bỏ.

5. **Reframe 9:16 & Visual Dynamics (Punch-ins):**
   - Cắt khung hình từ ngang sang 9:16 vertical video.
   - Tự động thay đổi cỡ cảnh (wide 1.0x -> medium 1.18x -> close-up 1.25x) sau mỗi 2 câu để tạo nhịp điệu sinh động và tránh nhàm chán.

6. **Ghép Nối Mượt Mà & Master Âm Thanh:**
   - Nối các đoạn bằng FFmpeg, crossfade audio 40ms để triệt tiêu tiếng click/pop.
   - Chuẩn hóa âm lượng chuẩn phát sóng TikTok/Reels: **-14 LUFS, True Peak ≤ -1.0 dBTP**.
   - Xuất file so sánh `comparison-split-screen.mp4` (Paid vs Ghost) khi cần demo.

## Lệnh Thực Thi

```bash
# Phân tích & edit video quay thật thành 9:16:
npm run edit-raw -- input.mp4 --reframe 9:16

# Chế độ xem trước kế hoạch cắt (không render video):
npm run edit-raw -- input.mp4 --dry-run

# Xuất thêm video so sánh split-screen (Gốc vs Đã edit):
npm run edit-raw -- input.mp4 --compare
```

## Sản Phẩm Đầu Ra

- `output/edited-<timestamp>/edited.mp4` – Video 9:16 hoàn thiện đã cắt gọn.
- `output/edited-<timestamp>/timeline.json` – EDL chi tiết lý do từng đoạn bị cắt/giữ.
- `output/edited-<timestamp>/comparison-split-screen.mp4` – Video so sánh trước & sau edit (nếu chọn `--compare`).
