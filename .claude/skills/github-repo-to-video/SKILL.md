---
name: github-repo-to-video
description: Converts any GitHub repository into an engaging viral showcase video with architecture diagram, directory tree, code typing walkthrough, and stars badge.
---

# GitHub Repo To Video Skill (`/repo-to-video`)

Biến một kho mã nguồn GitHub bất kỳ (URL `https://github.com/owner/repo`) thành một video ngắn giới thiệu công nghệ sinh động, cuốn hút lập trình viên và cộng đồng mã nguồn mở.

## Kịch Bản Chuẩn 5 Cảnh

1. **Cảnh 1: Hook (Repo Explainer)**
   - Template: `github-repo-explainer`
   - Hiển thị: Logo/Tên Repo, số sao GitHub ⭐ (ví dụ: `15.4k stars`), ngôn ngữ chính (TypeScript, Rust, Python), mô tả ngắn 1 câu gây tò mò.
2. **Cảnh 2: Vấn Đề & Giải Pháp**
   - Template: `before-after` hoặc `callout`
   - Nhấn mạnh bài toán mà thư viện này giải quyết so với cách làm truyền thống.
3. **Cảnh 3: Code Demo Thực Tế**
   - Template: `code-walkthrough`
   - Hiệu ứng gõ code trực tiếp, highlight dòng code cốt lõi (`highlightLines: [3, 4]`).
4. **Cảnh 4: Tính Năng Nổi Bật / Benchmark**
   - Template: `stat-hero` hoặc `data-dashboard`
   - Biểu đồ tốc độ hoặc tính năng vượt trội (nhanh hơn 10x, dung lượng siêu nhẹ).
5. **Cảnh 5: Kêu Gọi Hành Động (CTA Outro)**
   - Template: `cta-outro`
   - Hiển thị lệnh cài đặt (`npm i ...` hoặc `pip install ...`), link GitHub và kêu gọi Star repo.

## Lệnh Chạy

```bash
# Tạo video tự động từ link GitHub repo:
npm run pipeline -- --url https://github.com/facebook/react --theme cyberpunk

# Hoặc dùng style tech:
npm run pipeline -- --url https://github.com/hien23ns/autogen-video --theme dark
```
