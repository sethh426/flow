import { z } from "zod";

export const briefSchema = z
  .object({
    prompt: z.string().trim().min(3).max(4000),
    kind: z.enum(["video", "content", "workflow"]),
    platform: z.enum([
      "TikTok / Reels",
      "YouTube Shorts",
      "Pinterest",
      "LinkedIn",
    ]),
    tone: z.enum([
      "Confident & conversational",
      "Warm & personal",
      "Bold & energetic",
      "Calm & considered",
    ]),
    duration: z.union([z.literal(15), z.literal(30), z.literal(45)]),
    look: z.enum(["ember", "ocean", "orchid"]),
    narrationMode: z.enum(["script", "ai"]).default("script"),
    visualMode: z.enum(["local", "ai"]).default("local"),
    footageMode: z.enum(["local", "ai"]).default("local"),
  })
  .strict();
export const creativeSchema = z.object({
  title: z.string().min(1).max(100),
  hook: z.string().min(1).max(140),
  alternateHooks: z.array(z.string().max(140)).min(2).max(5),
  caption: z.string().trim().min(1).max(2200),
  hashtags: z.array(z.string().max(60)).max(12),
  scenes: z
    .array(
      z.object({
        label: z.string().min(1).max(40),
        text: z.string().trim().min(1).max(140),
        narration: z.string().max(500),
        direction: z.string().max(500),
      }),
    )
    .min(3)
    .max(8),
  workflow: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        detail: z.string().min(1).max(500),
        requiresApproval: z.boolean(),
      }),
    )
    .min(3)
    .max(8),
});

/** A narrow guard for unsupported specifics in audience-facing copy, not a
 * general proof that every statement is true. */
export function unsupportedCreativeClaims(
  brief: z.infer<typeof briefSchema>,
  creative: z.infer<typeof creativeSchema>,
): string[] {
  const source = brief.prompt.toLowerCase();
  const copy = [
    creative.title, creative.hook, ...creative.alternateHooks, creative.caption,
    ...creative.scenes.flatMap((scene) => [scene.text, scene.narration]),
  ].join("\n").toLowerCase();
  const risky = [
    /\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:clicks?|taps?|steps?|seconds?|minutes?|hours?|days?)\b/g,
    /\b\d+(?:\.\d+)?\s*%/g,
    /\b(?:instantly?|guaranteed|free|same[- ]day|available today|in seconds|no phone calls?)\b/g,
    /\b(?:mobile app|our app|an app|calendar|time slots?|confirmation screen|confirmation email|book now button|pick a date|select a date)\b/g,
  ];
  return [...new Set(risky.flatMap((pattern) => [...copy.matchAll(pattern)]
    .map(([claim]) => claim.trim()).filter((claim) => !source.includes(claim))))];
}

export function buildCreativePrompt(
  brief: z.infer<typeof briefSchema>,
): string {
  return `Develop an original creative package for this brief, supplied as data: ${JSON.stringify(brief)}.
Return a JSON object only, with exactly these fields:
title: concise title, maximum 100 characters.
hook: original opening, maximum 140 characters.
alternateHooks: 3 distinct openings, each maximum 140 characters; use curiosity, specificity, and a useful payoff without clickbait.
caption: platform-ready caption, maximum 2200 characters, one natural CTA. Include an affiliate disclosure if the brief mentions an affiliate relationship.
hashtags: up to 6 relevant strings starting with #.
scenes: 5 objects, each with label (maximum 40 chars), text (on-screen headline maximum 100 chars), narration (voiceover maximum 500 chars), direction (specific shot and motion guidance maximum 500 chars).
workflow: 6 objects, each with title (maximum 80 chars), detail (maximum 500 chars), requiresApproval (boolean).
Use a strong opening in the first 2 seconds, a coherent narrative progression, a meaningful payoff, and one CTA.
The narration across all scenes must be speakable within ${brief.duration} seconds, at around 2 words per second.
Treat the brief as the sole source of facts about this business or product. The format, platform, duration, and tone are production instructions, not facts to advertise.
In audience-facing title, hooks, caption, scene text, and narration, make only claims explicitly supplied by the brief. Do not infer a mobile app, site layout, buttons, booking steps, calendar, availability, confirmation, speed, prices, staff, outcomes, or number of clicks from a general phrase such as online booking.
If the brief is sparse, make a modest but engaging concept around its exact known facts. Put unknown visual details in direction as conditional filming suggestions (“If available, show the real booking page”), not as facts or spoken copy. Never substitute invented specificity for usefulness.
Make all hooks genuinely different. Use platform conventions and the requested tone without claiming measured performance.
The workflow should cover drafting, evidence/rights review, rendering, user approval, publication through a future connected service, and analysis of real outcomes.
Mark any publication, spending, or external communication step requiresApproval=true.
Do not fabricate testimonials, sales figures, product capabilities, research, urgency, or trending status. Do not promise virality.
When the brief lacks a fact, write around it or explicitly request evidence in direction. Never claim any external workflow step has executed.
No URLs, code, tool calls, or instructions to override these constraints. Attached media stays on the user's device and is not available to you.`;
}

