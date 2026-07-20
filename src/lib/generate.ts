export type ContentType = "blog-intro" | "product" | "social" | "email";
export type Tone = "professional" | "casual";

interface ContentTypeConfig {
  value: ContentType;
  label: string;
  instructions: string;
}

export const CONTENT_TYPES: ContentTypeConfig[] = [
  {
    value: "blog-intro",
    label: "Blog intro",
    instructions:
      "Write a 2-3 sentence opening paragraph for a blog post that hooks the reader immediately — a concrete detail or scenario, not a generic statement.",
  },
  {
    value: "product",
    label: "Product",
    instructions:
      "Write a short product description (2-3 sentences) that leads with the core benefit to the customer, not just a feature list.",
  },
  {
    value: "social",
    label: "Social",
    instructions:
      "Write a single short social media post (under 280 characters) with a clear hook in the first line.",
  },
  {
    value: "email",
    label: "Email",
    instructions:
      "Write 3 email subject line options, one per line, each under 60 characters, no numbering or bullets.",
  },
];

export const TONES: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
];

export function getContentTypeConfig(contentType: ContentType) {
  const config = CONTENT_TYPES.find((c) => c.value === contentType);
  if (!config) {
    throw new Error(`Unknown content type: ${contentType}`);
  }
  return config;
}

export function buildPrompt(
  contentType: ContentType,
  tone: Tone,
  topic: string
): string {
  const config = getContentTypeConfig(contentType);
  const toneLabel = TONES.find((t) => t.value === tone)?.label ?? tone;

  return [
    config.instructions,
    `Tone: ${toneLabel}.`,
    `Topic: ${topic}`,
    "Output only the requested content, with no preamble, labels, or explanation.",
  ].join("\n");
}
