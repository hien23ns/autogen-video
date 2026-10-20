# Demo 2: GitHub Repository Explainer Video

## 1. Prompt Đã Dùng

```bash
/repo-to-video https://github.com/hien23ns/autogen-video --style tech --ratio 9:16
```

Hoặc qua CLI:
```bash
npm run pipeline -- --url https://github.com/hien23ns/autogen-video --theme cyberpunk
```

---

## 2. Kịch Bản JSON Sinh Ra (`script.json`)

```json
{
  "version": "1.0",
  "metadata": {
    "title": "Auto Video Gen: Studio AI Tạo Video 9:16 Siêu Tốc",
    "channel": "Code Suy 24h 🔱",
    "source": {
      "url": "https://github.com/hien23ns/autogen-video",
      "domain": "github.com",
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
      "voiceText": "Đây là công cụ tự động biến link bài viết và repo GitHub thành video ngắn chuẩn Tik Tok trong một nốt nhạc.",
      "templateData": {
        "template": "github-repo-explainer",
        "repoName": "hien23ns/autogen-video",
        "stars": "1.2k ⭐",
        "primaryLanguage": "TypeScript",
        "tagline": "Tự sinh video 9:16 60fps hoàn toàn bằng code"
      }
    },
    {
      "id": "code-demo",
      "type": "body",
      "voiceText": "Chỉ với một dòng lệnh duy nhất, hệ thống tự động cào bài viết, sinh kịch bản và ghép giọng đọc chuyên nghiệp.",
      "templateData": {
        "template": "code-walkthrough",
        "language": "bash",
        "filename": "terminal.sh",
        "codeSnippet": "npm run pipeline -- --url https://github.com/facebook/react\n# Tự động render 1080x1920 60fps kèm phụ đề karaoke!",
        "highlightLines": [1, 2]
      }
    },
    {
      "id": "features",
      "type": "body",
      "voiceText": "Hệ thống sở hữu mười tám template chuyển động đỉnh cao, âm thanh tự động đắc kinh và chuẩn hóa âm lượng chuẩn phát sóng.",
      "templateData": {
        "template": "feature-list",
        "heading": "TÍNH NĂNG ĐỈNH CAO",
        "items": [
          "18 Motion Templates chuyên nghiệp",
          "Phụ đề từng từ Karaoke triệu view",
          "Mastering -14 LUFS chống vỡ tiếng"
        ]
      }
    },
    {
      "id": "cta",
      "type": "outro",
      "voiceText": "Thả sao cho repo trên GitHub và theo dõi kênh để nhận thêm nhiều mã nguồn hay ho nhé.",
      "templateData": {
        "template": "cta-outro",
        "heading": "MÃ NGUỒN MIỄN PHÍ",
        "actionText": "STAR TRÊN GITHUB NGAY",
        "handle": "@codesuy24h",
        "platforms": ["GitHub", "TikTok", "YouTube"]
      }
    }
  ]
}
```

---

## 3. Báo Cáo Kiểm Tra Chất Lượng (QA Report)

- **Điểm chất lượng:** 98/100 (Xuất sắc)
- **Độ phân giải:** 1080x1920 60fps
- **Code Highlighting:** Code box syntax hiển thị rõ ràng, hiệu ứng gõ phím mượt mà
- **Mastered Loudness:** -14.0 LUFS
- **True Peak:** -1.0 dBTP
- **BGM Ducking:** Âm lượng nhạc nền giảm -18dB đúng lúc giọng nói xuất hiện
