#!/usr/bin/env node
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const SCRIPT_JSON_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "AutoVideoGenScript",
  description: "JSON Schema for Auto Video Gen video composition scripts (v2.0.0)",
  type: "object",
  required: ["metadata", "scenes"],
  properties: {
    schemaVersion: {
      type: "string",
      description: "Version of the script schema (e.g. 2.0.0)",
      default: "2.0.0",
    },
    metadata: {
      type: "object",
      required: ["title", "channel", "source"],
      properties: {
        title: { type: "string", description: "Title of the video/article" },
        channel: { type: "string", description: "Channel name (e.g. Công nghệ 24h)" },
        source: {
          type: "object",
          required: ["url", "domain"],
          properties: {
            url: { type: "string" },
            domain: { type: "string" },
          },
        },
      },
    },
    voice: {
      type: "object",
      properties: {
        provider: { type: "string", enum: ["edge-tts", "lucylab", "elevenlabs", "vbee"] },
        voiceId: { type: "string" },
        speed: { type: "number", default: 1.0 },
      },
    },
    scenes: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "voiceText", "templateData"],
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          voiceText: { type: "string", description: "Spoken text in Vietnamese phonetic words" },
          bgSrc: { type: "string", description: "Optional background image path or URL" },
          sfx: {
            type: "object",
            properties: {
              name: { type: "string" },
              startOffsetSec: { type: "number" },
              volume: { type: "number" },
            },
          },
          templateData: {
            type: "object",
            required: ["template"],
            properties: {
              template: {
                type: "string",
                enum: [
                  "hook",
                  "stat-hero",
                  "comparison",
                  "feature-list",
                  "callout",
                  "outro",
                  "tutorial-steps",
                  "before-after",
                  "product-showcase",
                  "timeline",
                  "map-route",
                  "github-repo-explainer",
                  "top-list-ranking",
                  "chat-conversation",
                  "code-walkthrough",
                  "data-dashboard",
                  "testimonial-reaction",
                  "cta-outro",
                ],
              },
              style: {
                type: "string",
                enum: ["news", "tech", "minimal", "high-energy", "luxury", "retro"],
              },
            },
          },
        },
      },
    },
  },
};

async function main() {
  const schemasDir = join(process.cwd(), "schemas");
  await mkdir(schemasDir, { recursive: true });
  const schemaPath = join(schemasDir, "script.schema.json");
  await writeFile(schemaPath, JSON.stringify(SCRIPT_JSON_SCHEMA, null, 2));
  console.log(`✅ Đã xuất JSON Schema: ${schemaPath}`);
}

main().catch((err) => {
  console.error("Lỗi khi xuất schema:", err);
  process.exit(1);
});
