# Demo 1: Tin Tức Công Nghệ Từ Bài Báo (News Article to Viral Short)

## 1. Prompt Đã Dùng

```bash
/create-news-video https://vnexpress.net/apple-ra-mat-chip-m4-4742918.html --style tech --caption-style pop-in
```

Hoặc qua CLI:
```bash
npm run pipeline -- --url https://vnexpress.net/apple-ra-mat-chip-m4-4742918.html --theme dark
```

---

## 2. Kịch Bản JSON Sinh Ra (`script.json`)

```json
{
  "version": "1.0",
  "metadata": {
    "title": "Apple Ra Mắt Chip M4 Siêu Mạnh",
    "channel": "Công nghệ 24h",
    "source": {
      "url": "https://vnexpress.net/apple-ra-mat-chip-m4-4742918.html",
      "domain": "vnexpress.net",
      "image": null
    },
    "style": "tech"
  },
  "voice": {
    "provider": "edge-tts",
    "voiceId": "vi-VN-NamMinhNeural",
    "speed": 1.15
  },
  "scenes": [
    {
      "id": "hook",
      "type": "hook",
      "voiceText": "Apple vừa bất ngờ ra mắt chip M4 mới nhất với hiệu năng vượt trội thế hệ trước.",
      "templateData": {
        "template": "hook",
        "headline": "CHIP M4 RA MẮT!",
        "subhead": "Hiệu năng AI gấp đôi M3",
        "kenBurns": "zoom-in"
      }
    },
    {
      "id": "stat-1",
      "type": "body",
      "voiceText": "Bộ xử lý Neural Engine mới có thể đạt tới ba mươi tám nghìn tỷ phép tính mỗi giây.",
      "templateData": {
        "template": "stat-hero",
        "value": "38 TOPS",
        "label": "Tốc độ xử lý AI Neural Engine"
      }
    },
    {
      "id": "compare-1",
      "type": "body",
      "voiceText": "So với chip M2 trên iPad Pro trước đây, hiệu năng đồ họa tăng gấp bốn lần.",
      "templateData": {
        "template": "comparison",
        "left": { "label": "Chip M2 cũ", "value": "1x GPU", "color": "purple" },
        "right": { "label": "Chip M4 mới", "value": "4x GPU", "color": "cyan", "winner": true }
      }
    },
    {
      "id": "outro",
      "type": "outro",
      "voiceText": "Bấm theo dõi kênh để cập nhật các tin tức công nghệ mới nhất mỗi ngày nhé.",
      "templateData": {
        "template": "outro",
        "channel": "Công nghệ 24h",
        "ctaTop": "CÔNG NGHỆ 24H",
        "source": "VnExpress"
      }
    }
  ]
}
```

---

## 3. Báo Cáo Kiểm Tra Chất Lượng (QA Report)

- **Điểm chất lượng:** 95/100 (Pass)
- **Độ phân giải:** 1080x1920 (9:16 Vertical Video)
- **Frame Rate:** 60fps
- **Mastered Loudness:** -14.1 LUFS (Đạt chuẩn EBU R128)
- **True Peak:** -1.1 dBTP (Không clipping)
- **Safe Zone:** 100% chữ và phụ đề pop-in nằm trong vùng an toàn TikTok/Shorts
- **Font:** Be Vietnam Pro + Anton, hiển thị đầy đủ dấu tiếng Việt, không lỗi glyph
