# Template: Before / After (`before-after`)

So sánh trực quan giữa tình trạng cũ (Before) và kết quả vượt trội sau khi áp dụng giải pháp mới (After).

---

## 🎯 Khi Nào Dùng?
- Đo điểm benchmark hiệu năng (vd: tốc độ tải trang 4.5s giảm xuống 0.3s).
- So sánh chi phí (Server cũ $2000/tháng giảm còn $50/tháng với Serverless).
- Hiệu suất mô hình AI thế hệ cũ vs thế hệ mới.

---

## 💬 Prompt Mẫu Sẵn Dùng

### Tiếng Việt:
> "Tạo video so sánh tốc độ render giữa hệ thống cũ dùng CPU và hệ thống mới tối ưu bằng GPU Turbo. Template 'before-after', bên trái là 15 phút, bên phải là 45 giây, chỉ số tăng trưởng gấp 20 lần."

### English:
> "Create a comparison video showcasing render speeds before and after GPU acceleration. Use 'before-after', left side showing 15 minutes, right side showing 45 seconds, with a 20x speedup banner."

---

## 📋 Cấu Trúc JSON Mẫu (`templateData`)

```json
{
  "template": "before-after",
  "beforeLabel": "Render CPU Cũ",
  "beforeValue": "15 Phút",
  "afterLabel": "GPU Turbo Mới",
  "afterValue": "45 Giây",
  "improvement": "Tốc độ tăng vọt gấp 20 lần"
}
```
