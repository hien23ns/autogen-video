# Demo 3: AI Ghost Editor (Cắt Video Quay Thật & Reframe 9:16)

## 1. Prompt Đã Dùng

```bash
/edit-raw-video raw-footage.mp4 --reframe 9:16 --punch-freq 2 --compare
```

Hoặc qua CLI:
```bash
npm run edit-raw -- output/secmon-he-thong-giam-sat-va-phan-ung-su-20261019-2310/video.mp4 --reframe 9:16 --compare
```

---

## 2. Kết Quả Phân Tích & Cắt Ghép (EDL Timeline)

```json
{
  "totalOriginalDurationSec": 47.3,
  "totalEditedDurationSec": 12.1,
  "cutsCount": {
    "kept": 2,
    "silenceCut": 10,
    "badTakesCut": 1
  },
  "cuts": [
    {
      "index": 0,
      "type": "cut-bad-take",
      "startSec": 1.2,
      "endSec": 4.5,
      "reason": "Discarded bad take (ngập ngừng, vấp từ và lặp lại câu)",
      "zoomLevel": 1.0
    },
    {
      "index": 1,
      "type": "keep",
      "startSec": 5.1,
      "endSec": 11.2,
      "reason": "Kept take #2 (Điểm lưu loát 92/100, nói dứt khoát)",
      "zoomLevel": 1.0
    },
    {
      "index": 2,
      "type": "keep",
      "startSec": 11.8,
      "endSec": 17.8,
      "reason": "Kept take #3 (Punch-in zoom cận cảnh nhấn mạnh từ khóa)",
      "zoomLevel": 1.18
    }
  ],
  "brollSuggestions": [
    {
      "timestampSec": 5.1,
      "keywords": ["an ninh", "giám sát", "bảo mật"],
      "contextSentence": "Hệ thống giám sát an ninh mạng thế hệ mới"
    }
  ]
}
```

---

## 3. Báo Cáo So Sánh (Paid vs Ghost Comparison)

- **Thời lượng tiết kiệm:** Giảm 74% thời gian chết và các đoạn nói lắp (từ 47.3s xuống 12.1s).
- **Trải nghiệm thị giác:** Video ngang được crop mượt thành 9:16, tự động punch-in (1.18x) ở các câu quan trọng giúp người xem không rời mắt.
- **Âm thanh:** Khử toàn bộ tiếng thở mạnh và khoảng lặng chết; audio crossfade 40ms êm ru, chuẩn âm lượng -14 LUFS.
- **Sản phẩm xuất ra:** `edited.mp4` + `timeline.json` + `comparison-split-screen.mp4` (Bản so sánh trực quan bên trái video thô, bên phải video đã edit).
