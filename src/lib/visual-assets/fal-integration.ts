"use client";

const FAL_BASE = "https://fal.run";

interface FalImageConfig {
  prompt: string;
  negativePrompt?: string;
  imageSize?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  numImages?: number;
  style?: "photo" | "cinematic" | "minimalist" | "isometric" | "watercolor";
}

interface FalAsset {
  url: string;
  alt: string;
  width: number;
  height: number;
}

function buildImagePrompt(
  niche: string,
  mood: string,
  audience: string,
  style: string = "cinematic"
): string {
  const styleMap: Record<string, string> = {
    photo: "photorealistic, professional photography, soft lighting, shallow DOF",
    cinematic: "cinematic, dramatic lighting, film grain, anamorphic, rich colors",
    minimalist: "minimalist, clean composition, plenty of negative space, pastel tones",
    isometric: "isometric view, 3D, vector art style, clean geometric shapes",
    watercolor: "watercolor illustration, artistic, soft edges, painterly, texture",
  };

  const styleDesc = styleMap[style] || styleMap.cinematic;

  return [
    `High quality ${niche} themed visual for a landing page, ${styleDesc}.`,
    `Target audience: ${audience}. Mood: ${mood}.`,
    `Show people using/benefiting from the product/service naturally.`,
    `No text overlay, no watermarks, no logos. Professional composition.`,
    `--ar 16:9 --style raw --v 6`,
    [4, 5, 6][Math.floor(Math.random() * 3)] !== 4 ? "" : ""
  ].filter(Boolean).join(" ");
}

export async function generateVisual(
  config: FalImageConfig
): Promise<FalAsset[]> {
  const apiKey = getFalKey();
  if (!apiKey) return getFallbackAssets(config.prompt);

  try {
    const res = await fetch(`${FAL_BASE}/fal-ai/flux-pro/v1.1-ultra`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: config.prompt,
        negative_prompt: config.negativePrompt || "text, watermark, logo, ugly, blurry",
        image_size: config.imageSize || "landscape_16_9",
        num_images: config.numImages || 1,
        safety_checker: true,
        output_format: "jpeg",
      }),
    });

    if (!res.ok) throw new Error(`Fal.ai error: ${res.status}`);

    const data = await res.json();
    return (data.images || []).map((img: { url: string; width: number; height: number }, i: number) => ({
      url: img.url,
      alt: `Generated visual ${i + 1} — ${config.prompt.slice(0, 60)}`,
      width: img.width || 1024,
      height: img.height || 768,
    }));
  } catch {
    return getFallbackAssets(config.prompt);
  }
}

export async function generateHeroImage(
  niche: string,
  mood: string,
  audience: string
): Promise<FalAsset[]> {
  const prompt = buildImagePrompt(niche, mood, audience, "cinematic");
  return generateVisual({ prompt, imageSize: "landscape_16_9", style: "cinematic" });
}

export async function generateFeatureImages(
  niche: string,
  mood: string,
  audience: string,
  count: number = 3
): Promise<FalAsset[][]> {
  const prompts = [
    `Product/feature showcase for ${niche}, ${buildImagePrompt(niche, mood, audience, "minimalist")}`,
    `Customer/user experience for ${niche}, ${buildImagePrompt(niche, mood, audience, "photo")}`,
    `Abstract brand visual for ${niche}, ${buildImagePrompt(niche, mood, audience, "isometric")}`,
    `Detail/closeup shot for ${niche} product, ${buildImagePrompt(niche, mood, audience, "photo")}`,
    `Lifestyle photography for ${niche} audience, ${buildImagePrompt(niche, mood, audience, "cinematic")}`,
  ];

  const results = await Promise.all(
    prompts.slice(0, count).map((p) => generateVisual({ prompt: p, imageSize: "square", numImages: 1 }))
  );

  return results;
}

function getFalKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("dynamo-settings");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.settings?.falKey || null;
  } catch {
    return null;
  }
}

const FALLBACK_ASSETS: Record<string, FalAsset> = {
  default: {
    url: "/placeholders/hero-default.svg",
    alt: "Hero visual",
    width: 1200,
    height: 800,
  },
};

function getFallbackAssets(prompt: string): FalAsset[] {
  console.warn("[Fal.ai] No API key, using fallback for:", prompt.slice(0, 40));
  return [{ ...FALLBACK_ASSETS.default }];
}
