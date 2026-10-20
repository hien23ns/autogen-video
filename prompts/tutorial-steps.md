# Template: Tutorial Steps (`tutorial-steps`)

Trình bày các bước hướng dẫn công nghệ, thủ thuật phần mềm hoặc quy trình thiết lập từng bước có thanh tiến trình (progress bar).

---

## 🎯 Khi Nào Dùng?
- Video hướng dẫn cài đặt môi trường, deploy phần mềm, cài AI local.
- Hướng dẫn thủ thuật 3 bước hoặc 5 bước tăng tốc máy tính.
- Kèm mẹo (tips) hữu ích ở cuối bước.

---

## 💬 Prompt Mẫu Sẵn Dùng

### Tiếng Việt:
> "Tạo video hướng dẫn 3 bước cài đặt DeepSeek R1 chạy offline trên máy tính cá nhân. Cảnh này là Bước 1: Cài đặt công cụ Ollama từ trang chủ. Sử dụng template 'tutorial-steps' với thanh tiến trình bước 1/3 kèm mẹo nhớ mở terminal kiểm tra."

### English:
> "Create a 3-step tutorial video on running DeepSeek R1 locally. This scene is Step 1: Install Ollama from the official website. Use 'tutorial-steps' with a 1/3 progress bar and an installation tip."

---

## 📋 Cấu Trúc JSON Mẫu (`templateData`)

```json
{
  "template": "tutorial-steps",
  "step": 1,
  "totalSteps": 3,
  "title": "Cài đặt Ollama Runtime",
  "instructions": [
    "Truy cập ollama.com tải bản cài",
    "Chạy file cài đặt và cấp quyền admin",
    "Gõ ollama --version trên terminal"
  ],
  "tips": "Nên có ít nhất 16GB RAM để chạy mượt"
}
```
