import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import type { Script } from "../render/script-schema.js";

export interface PublishPackResult {
  publishDir: string;
  metadataPath: string;
  socialCopyPath: string;
  cover9x16Path?: string;
  cover16x9Path?: string;
  checklistPath: string;
}

export interface PublishPackOptions {
  compositionDir: string;
  videoPath: string;
  script: Script;
  extractCovers?: boolean;
}

export async function generatePublishPack(options: PublishPackOptions): Promise<PublishPackResult> {
  const { compositionDir, videoPath, script, extractCovers = true } = options;
  const publishDir = join(compositionDir, "publish");
  await mkdir(publishDir, { recursive: true });

  const title = script.metadata.title;
  const channel = script.metadata.channel;
  const domain = script.metadata.source?.domain || "tin công nghệ";

  // 1. Social Copywriting for 3 platforms
  const tiktokCopy = `🔥 ${title}

${script.scenes[0]?.voiceText || title}

👉 Follow @${channel.replace(/\s+/g, "").toLowerCase()} để không bỏ lỡ tin công nghệ mới nhất mỗi ngày!

#LearnOnTikTok #CongNghe #KienThuc #AI #TechTrends #TrendingVN #TinNong`;

  const shortsCopy = `🚀 ${title} | ${channel}

Tóm tắt nhanh: ${script.scenes.slice(0, 3).map((s) => s.voiceText).join(" ")}

📌 Nguồn tham khảo: ${domain}
🔔 Đăng ký kênh ${channel} để xem thêm nhiều video công nghệ hữu ích!

#Shorts #CongNghe #TechReview #AI #LapTrinh #KhamPha`;

  const reelsCopy = `💡 BẠN ĐÃ BIẾT CHƯA?
${title}

${script.scenes[1]?.voiceText || script.scenes[0]?.voiceText || title}

👇 Bạn nghĩ sao về điều này? Hãy để lại bình luận bên dưới nhé!

#ReelsVN #CongNghe24h #TechNews #TrendingReels #AI #KienThucMoi`;

  const socialCopyMd = `# 📱 BỘ NỘI DUNG ĐĂNG TẢI ĐA NỀN TẢNG (PUBLISH PACK)

> **Tiêu đề gốc:** ${title}  
> **Kênh:** ${channel}  
> **Thời lượng kịch bản:** ${script.scenes.length} cảnh

---

## 1. 🎵 TIKTOK (Ưu tiên nhịp nhanh, hook mạnh, 5-7 hashtag)
\`\`\`text
${tiktokCopy}
\`\`\`

---

## 2. 🔴 YOUTUBE SHORTS (Tối ưu SEO tìm kiếm, đầy đủ nguồn & link)
\`\`\`text
${shortsCopy}
\`\`\`

---

## 3. 📸 FACEBOOK & INSTAGRAM REELS (Tương tác cao, đặt câu hỏi cho cộng đồng)
\`\`\`text
${reelsCopy}
\`\`\`

---

## ⏰ GỢI Ý KHUNG GIỜ VÀNG ĐĂNG BÀI (THAM KHẢO)
- **Trưa (11:30 - 13:00):** Khung giờ nghỉ trưa, học sinh/sinh viên và dân văn phòng lướt mạng xã hội.
- **Tối (19:30 - 21:30):** Khung giờ vàng đỉnh điểm (Peak traffic) trên TikTok và Reels.
- **Đêm (22:30 - 23:30):** Khung giờ vàng cho cộng đồng Tech / Dev / Night owls.
`;

  // 2. Checklist
  const checklistMd = `# ✅ CHECKLIST TRƯỚC KHI ĐĂNG VIDEO

- [ ] **Kiểm tra âm thanh:** Giọng đọc TTS to, rõ ràng, không bị nuốt chữ; nhạc nền đã tự động ducking mượt mà (-14 LUFS).
- [ ] **Kiểm tra phụ đề:** Phụ đề tiếng Việt đầy đủ dấu, từ ngữ đúng chính tả, nằm trong vùng an toàn (Safe Zone), không bị nút Like / Share / Sound che.
- [ ] **Kiểm tra hình ảnh / Animation:** Không bị chớp giật, logo và font hiển thị sắc nét 1080x1920 60fps.
- [ ] **Chọn ảnh bìa (Cover thumbnail):** Chọn frame rõ mặt hoặc tiêu đề to nhất để hiển thị trên lưới kênh.
- [ ] **Âm thanh thương mại:** Nhạc nền và SFX nằm trong danh mục miễn phí bản quyền (Commercial Safe) từ \`assets/LICENSES.md\`.
`;

  // 3. Machine-readable metadata.json
  const metadataJson = {
    title,
    channel,
    source: script.metadata.source,
    platforms: {
      tiktok: { caption: tiktokCopy, hashtags: ["LearnOnTikTok", "CongNghe", "AI", "TrendingVN"] },
      youtubeShorts: { caption: shortsCopy, tags: ["Shorts", "CongNghe", "TechReview", "AI"] },
      reels: { caption: reelsCopy, hashtags: ["ReelsVN", "CongNghe24h", "TechNews"] },
    },
    postingTimes: [
      { slot: "Lunch", time: "11:30 - 13:00" },
      { slot: "Prime Evening", time: "19:30 - 21:30" },
      { slot: "Tech Night", time: "22:30 - 23:30" },
    ],
    generatedAt: new Date().toISOString(),
  };

  const metadataPath = join(publishDir, "metadata.json");
  const socialCopyPath = join(publishDir, "social-copy.md");
  const checklistPath = join(publishDir, "checklist.md");

  await writeFile(metadataPath, JSON.stringify(metadataJson, null, 2));
  await writeFile(socialCopyPath, socialCopyMd);
  await writeFile(checklistPath, checklistMd);

  let cover9x16Path: string | undefined;
  let cover16x9Path: string | undefined;

  // 4. Extract Cover Thumbnails if video exists
  if (extractCovers && existsSync(videoPath)) {
    cover9x16Path = join(publishDir, "cover-9x16.jpg");
    cover16x9Path = join(publishDir, "cover-16x9.jpg");

    try {
      // Extract 9:16 cover at 1.5s
      await extractFrame(videoPath, 1.5, cover9x16Path);
      // Extract 16:9 cover (crop center)
      await extractFrame16x9(videoPath, 1.5, cover16x9Path);
    } catch (e: any) {
      console.warn("⚠️ Thumbnail extraction warning:", e.message);
    }
  }

  return {
    publishDir,
    metadataPath,
    socialCopyPath,
    cover9x16Path,
    cover16x9Path,
    checklistPath,
  };
}

function extractFrame(videoPath: string, timestampSec: number, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-y",
      "-ss", String(timestampSec),
      "-i", videoPath,
      "-vframes", "1",
      "-q:v", "2",
      outPath,
    ]);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Thumbnail extraction exited with code ${code}`));
    });
    proc.on("error", reject);
  });
}

function extractFrame16x9(videoPath: string, timestampSec: number, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-y",
      "-ss", String(timestampSec),
      "-i", videoPath,
      "-vframes", "1",
      "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080",
      "-q:v", "2",
      outPath,
    ]);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`16:9 Thumbnail extraction exited with code ${code}`));
    });
    proc.on("error", reject);
  });
}
