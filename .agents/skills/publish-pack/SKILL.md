---
name: publish-pack
description: Multi-platform publishing packaging — Generates optimized captions, hashtags, golden posting hours, and cover thumbnails for TikTok, YouTube Shorts, and Reels.
---

# Multi-Platform Publish Pack Skill (`/publish-pack`)

Tự động sinh bộ tài nguyên đăng bài hoàn chỉnh cho mọi nền tảng video ngắn (TikTok, YouTube Shorts, Instagram Reels, Facebook Reels) ngay sau khi render xong video.

## Bộ Tài Nguyên Trong Thư Mục `publish/`

- `social-copy.md`: Bản thảo nội dung sẵn sàng để copy-paste cho từng nền tảng, bao gồm hook mở đầu, tóm tắt nội dung, lời kêu gọi hành động (CTA) và 5–7 hashtag thịnh hành chuẩn SEO.
- `metadata.json`: Định dạng máy đọc chứa toàn bộ thông tin phục vụ kết nối tự động với các công cụ lên lịch đăng (Buffer, Hootsuite, Make.com, n8n).
- `cover-9x16.jpg`: Ảnh bìa tỷ lệ 9:16 sắc nét trích xuất từ khung hình ấn tượng nhất.
- `cover-16x9.jpg`: Ảnh bìa tỷ lệ 16:9 cắt trung tâm phục vụ bài đăng Facebook feed hoặc YouTube Shorts thumbnail.
- `checklist.md`: Bảng kiểm tra tiền xuất bản (Pre-flight checklist) đảm bảo âm thanh, phụ đề và bản quyền an toàn trước khi bấm nút đăng.

## Nguyên Tắc Không Can Thiệp Tự Động
Hệ thống tạo sẵn toàn bộ tài nguyên đóng gói nhưng **không bao giờ tự động đăng lên mạng xã hội** trừ khi người dùng cấu hình tài khoản và yêu cầu rõ ràng.
