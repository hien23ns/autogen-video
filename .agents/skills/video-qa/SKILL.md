---
name: video-qa
description: Automated video QA analyzer — Extracts keyframes, inspects typography, safe-zone violations, audio sync, and measures loudness (-14 LUFS) with auto-repair loop.
---

# Video QA Verification Skill (`/video-qa`)

Vòng kiểm tra chất lượng tự động bắt buộc sau mỗi lần render video. Ngăn chặn tuyệt đối việc bàn giao video lỗi cho người dùng.

## Lệnh Chạy Kiểm Tra

```bash
npm run qa:video -- output/<compositionDir>/video.mp4
```

## Các Hạng Mục Kiểm Tra Tự Động

1. **Thông số kỹ thuật:**
   - Độ phân giải: 1080x1920 (9:16) hoặc tỉ lệ được chỉ định.
   - Frame rate: 30fps (draft) hoặc 60fps (final).
   - Codec: H.264 / AAC.
2. **Tiêu chuẩn âm thanh (Loudness Compliance):**
   - Đo Integrated Loudness bằng FFmpeg `ebur128`.
   - Báo động nếu độ lớn vượt quá -13 LUFS (quá to/chói) hoặc dưới -18 LUFS (quá nhỏ).
   - Kiểm tra True Peak (phải ≤ -0.5 dBTP để tránh clipping).
   - Quét tìm các khoảng lặng bất thường > 1.2s không có giọng đọc.
3. **Trích xuất Frame & Vision Inspection:**
   - Trích xuất 5 frame tiêu biểu tại các mốc: 1.5s (Hook), 25% (Body 1), 50% (Body 2), 75% (Body 3), 95% (Outro).
   - Agent kiểm tra bằng Vision:
     - Chữ có bị tràn ra ngoài màn hình không?
     - Chữ có đè lên vùng cấm (Safe Zone) của TikTok không?
     - Độ tương phản chữ trên nền có đủ đọc không?
     - Có cảnh nào bị màn hình đen hoặc mất ảnh không?
     - Font tiếng Việt có bị lỗi font (tofu / vỡ glyph) không?

## Vòng Tự Sửa Lỗi (Auto-Repair Loop)
Nếu phát hiện lỗi:
1. Xác định nguyên nhân (chữ quá dài, ảnh load hỏng, sai offset âm thanh).
2. Tự động điều chỉnh kịch bản `script.json` hoặc CSS.
3. Chạy `npm run rerender -- <outputDir>` để render lại.
4. Chạy lại `npm run qa:video` kiểm chứng (tối đa 5 vòng cho đến khi đạt điểm ≥ 80/100).
