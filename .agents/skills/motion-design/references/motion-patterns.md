# THƯ VIỆN 20 MOTION PATTERNS & COMPONENTS CHUẨN VIRAL

Tập hợp các mẫu chuyển động GSAP và CSS tái sử dụng cho video ngắn 9:16.

---

### 1. Kinetic Word-by-Word Reveal (Xuất hiện chữ theo nhịp nói)
- **Cơ chế:** Từng từ trượt lên kết hợp xoay nhẹ 2D, scale từ 0.8 -> 1.0, độ trễ `0.04s` giữa các từ.
- **GSAP:**
  ```javascript
  tl.fromTo(words, 
    { opacity: 0, y: 25, scale: 0.85, rotationZ: -2 }, 
    { opacity: 1, y: 0, scale: 1, rotationZ: 0, stagger: 0.05, ease: "back.out(1.8)", duration: 0.35 }
  );
  ```

### 2. Animated Number Counter (Bộ đếm số tăng tốc)
- **Cơ chế:** Con số đếm từ 0 (hoặc giá trị cũ) tới giá trị đích kèm hiệu ứng nảy khi chạm đích.
- **GSAP:**
  ```javascript
  const obj = { val: 0 };
  tl.to(obj, {
    val: targetValue,
    duration: 1.2,
    ease: "power2.out",
    onUpdate: () => { el.innerText = Math.round(obj.val).toLocaleString("vi-VN"); }
  });
  ```

### 3. Dynamic Bar Chart Rise (Cột biểu đồ vút lên)
- **Cơ chế:** Chiều cao cột tăng từ 0% lên mục tiêu, có độ nảy nhẹ ở đỉnh, nhãn dữ liệu bung ra sau khi cột đạt đỉnh.
- **GSAP:**
  ```javascript
  tl.fromTo(barEl, { scaleY: 0, transformOrigin: "bottom center" }, { scaleY: 1, duration: 0.6, ease: "back.out(1.5)" });
  ```

### 4. Donut Chart Fill (Vòng tròn chỉ số xoay lắp đầy)
- **Cơ chế:** `strokeDashoffset` của SVG chạy từ chu vi đầy về 0, icon trung tâm pop-in.

### 5. Line Chart Draw-On (Vẽ đường biểu đồ thời gian thực)
- **Cơ chế:** SVG path vẽ dần từ trái qua phải, các điểm nút tròn (data points) bung sáng khi đường kẻ đi qua.

### 6. Shimmer Light Sweep (Vệt sáng phản chiếu quét ngang)
- **Cơ chế:** Vệt sáng nghiêng 30 độ quét nhanh qua tiêu đề để tạo điểm nhấn sang trọng.
- **GSAP:**
  ```javascript
  tl.fromTo(shimmerMask, { x: "-120%" }, { x: "130%", duration: 0.85, ease: "power2.inOut" });
  ```

### 7. Glassmorphism Card Rise (Thẻ kính nổi 3D)
- **Cơ chế:** Nền mờ `backdrop-filter: blur(20px)`, viền phát sáng gradient, bay từ dưới lên kèm hiệu ứng tilt nhẹ.

### 8. Hand-Drawn Underline / Highlighter (Nét gạch chân vẽ tay)
- **Cơ chế:** Nét vẽ bằng SVG path giả lập bút dạ quang hoặc nét cọ vẽ lướt dưới từ khóa chính.

### 9. Pulsing Glow Badge (Huy hiệu phát sáng nhịp tim)
- **Cơ chế:** Viền phát sáng lặp lại 2 nhịp nhanh, 1 nhịp chậm như nhịp tim (`box-shadow: 0 0 25px currentColor`).

### 10. Web Mockup Auto-Scroll với Gia tốc
- **Cơ chế:** Khung laptop/smartphone lướt màn hình với gia tốc nhẹ ở đầu và giảm tốc ở cuối thay vì tốc độ đều `none`.

### 11. Staggered Bullet Points (Mục danh sách nối đuôi nhau)
- **Cơ chế:** Từng mục trượt từ trái vào, biểu tượng đầu dòng xoay nhẹ 180 độ.

### 12. Comparison Split-Screen Clash (Va chạm so sánh 2 nửa)
- **Cơ chế:** 2 nửa khung hình lao vào nhau từ 2 bên, hiệu ứng nảy nhẹ khi chạm điểm giữa, logo VS bùng nổ ở tâm điểm.

### 13. Virtual Camera Push-In (Máy quay lướt cận cảnh)
- **Cơ chế:** Toàn bộ khung canvas phóng to từ `1.0 -> 1.05` trong suốt thời lượng cảnh để tạo cảm giác chuyển động liên tục.

### 14. Camera Punch-In (Nhấn giật tiêu cự)
- **Cơ chế:** Thu phóng đột ngột `scale: 1.0 -> 1.15` trong 0.1s khi phát âm từ khóa sốc rồi trả về từ từ.

### 15. Audio Waveform Bounce (Cột sóng âm thanh sống động)
- **Cơ chế:** 5 đến 7 cột bar dao động ngẫu nhiên theo nhịp giọng nói, chứng minh âm thanh đang phát.

### 16. Glitch Distortion Flash (Hiệu ứng nhiễu kỹ thuật số)
- **Cơ chế:** Đổi màu kênh RGB (chromatic aberration) lệch 4px trong 3 frames để báo hiệu cảnh báo bảo mật hoặc tin nóng.

### 17. Whip-Pan Transition (Gạt lia chuyển cảnh siêu nhanh)
- **Cơ chế:** Cảnh cũ trượt cực nhanh sang trái kèm motion blur, cảnh mới nối liền mạch từ phải qua.

### 18. Zoom-Through Portal Transition (Phóng xuyên chuyển cảnh)
- **Cơ chế:** Cảnh cũ phóng to vô tận `scale: 3.0, opacity: 0`, cảnh mới từ tâm bung ra.

### 19. Floating Particles Background (Hạt bụi ánh sáng trôi lơ lửng)
- **Cơ chế:** Các chấm hạt phát sáng nhỏ di chuyển z-index phía sau với vận tốc và hướng trôi độc lập.

### 20. TikTok Interactive CTA Simulation (Thẻ Follow tương tác)
- **Cơ chế:** Thẻ profile xuất hiện, con trỏ chuột/chạm ảo nhấn nút Follow, nút chuyển từ Đỏ sang Xám "Đang theo dõi" kèm icon tick xanh.
