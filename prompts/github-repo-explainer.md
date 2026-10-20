# Template: GitHub Repo Explainer (`github-repo-explainer`)

Biến một kho mã nguồn mở GitHub thành video phân tích kiến trúc trực quan, hiển thị các tầng thành phần và tech stack.

---

## 🎯 Khi Nào Dùng?
- Giới thiệu các framework mới, thư viện hot trên trending GitHub.
- Giải thích kiến trúc phân tầng (Frontend, Backend, AI Engine, Database).
- Tổng hợp số sao (Stars) và các công nghệ sử dụng.

---

## 💬 Prompt Mẫu Sẵn Dùng

### Tiếng Việt:
> "Hãy tạo kịch bản video giới thiệu repository GitHub 'facebook/react'. Sử dụng template 'github-repo-explainer' làm cảnh trọng tâm. Phân tích 3 tầng kiến trúc cốt lõi: Virtual DOM, Fiber Reconciler và Hooks Engine. Nêu bật số sao hơn 220 nghìn stars trên GitHub và các tech stack chính."

### English:
> "Create a video script introducing the GitHub repository 'facebook/react'. Use the 'github-repo-explainer' template for the core architecture scene. Highlight the 3 main layers: Virtual DOM, Fiber Reconciler, and Hooks Engine. Emphasize over 220k stars and the core tech stack."

---

## 📋 Cấu Trúc JSON Mẫu (`templateData`)

```json
{
  "template": "github-repo-explainer",
  "repoName": "facebook/react",
  "stars": "228k",
  "architectureLayers": [
    "Virtual DOM & JSX Parser",
    "React Fiber Reconciler",
    "Concurrent Mode & Hooks Engine"
  ],
  "techStack": ["JavaScript", "TypeScript", "Flow", "WebAssembly"]
}
```

---

## ⚙️ Tham Số Tùy Chỉnh
- `repoName`: Tên repo dạng `owner/name` (tối đa 60 ký tự).
- `stars`: Số sao rút gọn (vd: "15.4k", "228k").
- `architectureLayers`: Mảng từ 1 đến 4 tầng kiến trúc (hiển thị theo thứ tự từ trên xuống).
- `techStack`: Mảng từ 1 đến 6 thẻ công nghệ.
