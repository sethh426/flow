import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";

test("one floating workspace creates, edits, saves and restores real drafts", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Big ideas. One little button." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create starter outline" }),
  ).toBeDisabled();
  await page
    .getByLabel("Describe what you want to create")
    .fill("A handmade ceramic coffee mug");
  await page.getByRole("button", { name: "Create starter outline" }).click();
  await expect(
    page.getByRole("heading", { name: "Your idea, in motion." }),
  ).toBeVisible();
  await expect(page.getByText("Editable outline", { exact: true })).toBeVisible();
  await page.getByLabel("ON-SCREEN TEXT").fill("Make mornings meaningful.");
  await page.getByRole("button", { name: "Play preview" }).click();
  await expect(
    page.getByRole("button", { name: "Pause preview" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause preview" }).click();
  await page.getByRole("tab", { name: "Post copy" }).click();
  await page
    .getByLabel("YOUR CAPTION")
    .fill("Small moments. Handmade details.");
  const packDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Creative pack", exact: true })
    .click();
  const pack = await packDownload;
  const { readFileSync } = await import("node:fs");
  const saved = JSON.parse(readFileSync((await pack.path())!, "utf8"));
  expect(saved.creative.scenes[0].text).toBe("Make mornings meaningful.");
  expect(saved.creative.caption).toBe("Small moments. Handmade details.");
  await page.reload();
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  await page.getByRole("button", { name: "Open saved creations" }).click();
  await page
    .getByRole("button", { name: /^A handmade ceramic coffee mug/ })
    .click();
  await expect(page.getByLabel("ON-SCREEN TEXT")).toHaveValue(
    "Make mornings meaningful.",
  );
  await page.getByRole("tab", { name: "Workflow", exact: true }).click();
  await expect(
    page.getByText("Publishing is not connected · No posts have been sent"),
  ).toBeVisible();
  expect(failures).toEqual([]);
});

test("local outline extracts the subject without echoing production instructions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  await page.getByLabel("Describe what you want to create").fill(
    "Make a 15-second video that helps an Indianapolis home-cleaning business explain its easy online booking. Friendly and specific, no invented claims.",
  );
  await page.getByRole("button", { name: "Create starter outline" }).click();
  await expect(page.getByRole("heading", { name: "Easy online booking", exact: true })).toBeVisible();
  await expect(page.getByText("Editable outline", { exact: true })).toBeVisible();
  await expect(page.getByLabel("ON-SCREEN TEXT")).not.toHaveValue(/Friendly and specific|no invented claims/);
});

test("local outline carries supplied facts into scenes and post copy without inventing process", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  await page.getByLabel("Describe what you want to create").fill(
    "Create a 15-second video for an Indianapolis home-cleaning service. Online booking is available. The service covers Indianapolis. Use only verified facts. Do not mention prices.",
  );
  await page.getByRole("button", { name: "Create starter outline" }).click();
  await page.getByRole("tabpanel").getByRole("button", { name: /From your brief/ }).click();
  await expect(page.getByLabel("ON-SCREEN TEXT")).toHaveValue("Online booking is available.");
  await page.getByRole("tabpanel").getByRole("button", { name: /Another detail/ }).click();
  await expect(page.getByLabel("ON-SCREEN TEXT")).toHaveValue("The service covers Indianapolis.");
  await page.getByRole("tab", { name: "Post copy" }).click();
  await expect(page.getByLabel("YOUR CAPTION")).toHaveValue(/Online booking is available\. The service covers Indianapolis\./);
  await expect(page.getByLabel("YOUR CAPTION")).not.toHaveValue(/Do not mention prices|Use only verified facts/);
});

test("mobile composer and settings remain usable without navigation clutter", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard/");
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Big ideas. One little button." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open creative settings" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("VIDEO LENGTH").selectOption("30");
  await page.getByRole("button", { name: "Ocean", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Content", exact: true }).click();
  await page
    .getByLabel("Describe what you want to create")
    .fill("A thoughtful product launch");
  await page.getByRole("button", { name: "Create starter outline" }).click();
  await expect(page.getByRole("tab", { name: "Post copy" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText("9:16 · 30s")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("workflow reports unavailable video export next to its action", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "MediaRecorder", { configurable: true, value: undefined });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  await page.getByRole("button", { name: "Workflow", exact: true }).click();
  await page.getByLabel("Describe what you want to create").fill("A local product launch");
  await page.getByRole("button", { name: "Create starter outline" }).click();
  await page.getByRole("button", { name: "Run local workflow", exact: true }).click();
  const alert = page.getByRole("tabpanel").getByRole("alert");
  await expect(alert).toContainText("Video export is unavailable in this browser");
  const action = (await page.getByRole("button", { name: "Run local workflow", exact: true }).boundingBox())!;
  const message = (await alert.boundingBox())!;
  expect(message.y).toBeGreaterThan(action.y);
  expect(message.y - action.y).toBeLessThan(180);
});

test("exports a playable 1080 by 1920 video with uploaded images and audio", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  const png = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#669999";
    context.fillRect(0, 0, 100, 100);
    return canvas.toDataURL().split(",")[1];
  });
  await page
    .locator('input[type=file][accept="image/jpeg,image/png,image/webp"]')
    .setInputFiles({
      name: "product.png",
      mimeType: "image/png",
      buffer: Buffer.from(png, "base64"),
    });
  // A short generated WAV exercises actual audio decoding, looping, and muxing.
  const rate = 8000,
    samples = 8000,
    wav = Buffer.alloc(44 + samples * 2);
  wav.write("RIFF");
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++)
    wav.writeInt16LE(
      Math.round(Math.sin((i * 2 * Math.PI * 220) / rate) * 2000),
      44 + i * 2,
    );
  await page
    .locator('input[type=file][accept="audio/*"]')
    .setInputFiles({
      name: "soundtrack.wav",
      mimeType: "audio/wav",
      buffer: wav,
    });
  await page
    .getByLabel("Describe what you want to create")
    .fill("Ceramic coffee mug");
  await page.getByRole("button", { name: "Create starter outline" }).click();
  const download = page.waitForEvent("download", { timeout: 40_000 });
  await page.getByRole("button", { name: "Export video", exact: true }).click();
  const exported = await download;
  const path = testInfo.outputPath(exported.suggestedFilename());
  await exported.saveAs(path);
  const probe = JSON.parse(
    execFileSync(
      "ffprobe",
      ["-v", "error", "-show_streams", "-show_format", "-of", "json", path],
      { encoding: "utf8" },
    ),
  );
  const video = probe.streams.find(
    (stream: { codec_type: string }) => stream.codec_type === "video",
  );
  expect(video.width).toBe(1080);
  expect(video.height).toBe(1920);
  expect(
    probe.streams.some(
      (stream: { codec_type: string }) => stream.codec_type === "audio",
    ),
  ).toBe(true);
  expect(Number(probe.format.duration)).toBeGreaterThan(14);
  expect(Number(probe.format.duration)).toBeLessThan(17);
  await expect(
    page.getByText("Your video is ready. The download has started."),
  ).toBeVisible();
});

test("canceling a video export stops work without downloading a partial video", async ({
  page,
}) => {
  let downloads = 0;
  page.on("download", () => downloads++);
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  await page
    .getByLabel("Describe what you want to create")
    .fill("An elegant launch");
  await page.getByRole("button", { name: "Create starter outline" }).click();
  await page.getByRole("button", { name: "Export video", exact: true }).click();
  await page.getByRole("button", { name: "Cancel export" }).click();
  await expect(
    page.getByRole("button", { name: "Export video", exact: true }),
  ).toBeEnabled();
  expect(downloads).toBe(0);
});

test("the composer has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter(
      (item) => item.impact === "serious" || item.impact === "critical",
    ),
  ).toEqual([]);
});

test("workspace opens on first load; the avatar can minimize, move, and reopen it", async ({ page }) => {
  await page.goto("/");
  const studio = page.getByRole("region", { name: "Flow creation studio" });
  await expect(studio).toBeVisible();
  await expect(page.getByLabel("Describe what you want to create")).toBeVisible();
  await page.getByRole("button", { name: "Close creation studio" }).click();
  const avatar = page.getByRole("button", { name: "Open Flow", exact: true });
  await expect(studio).not.toBeVisible();
  const bounds = (await avatar.boundingBox())!;
  await page.mouse.move(bounds.x + 40, bounds.y + 40);
  await page.mouse.down();
  await page.mouse.move(bounds.x - 110, bounds.y - 100, { steps: 8 });
  await page.mouse.up();
  await expect(avatar).toHaveAttribute("aria-expanded", "false");
  const moved = (await avatar.boundingBox())!;
  expect(moved.x).toBeLessThan(bounds.x - 80);
  await page.reload();
  await expect(studio).toBeVisible();
  await page.getByRole("button", { name: "Close creation studio" }).click();
  expect((await avatar.boundingBox())!.x).toBeCloseTo(moved.x, 0);
  await avatar.focus();
  await page.keyboard.press("Enter");
  const brief = page.getByLabel("Describe what you want to create");
  await expect(brief).toBeFocused();
  await brief.fill("Keep this idea when I minimize");
  await page.keyboard.press("Escape");
  await expect(avatar).toBeFocused();
  await avatar.click();
  await expect(brief).toHaveValue("Keep this idea when I minimize");
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = (await page.getByRole("button", { name: "Minimize Flow" }).boundingBox())!;
  expect(mobile.x + mobile.width).toBeLessThanOrEqual(390);
});

test("creative packs can be imported and invalid files do not replace a draft", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  await page.getByLabel("Describe what you want to create").fill("A reusable content campaign");
  await page.getByRole("button", { name: "Create starter outline" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Creative pack", exact: true }).click();
  const file = await download;
  await page.getByRole("button", { name: "New idea", exact: true }).click();
  const input = page.locator('input[accept="application/json,.json"]');
  await input.setInputFiles((await file.path())!);
  await expect(page.getByRole("heading", { name: "A reusable content campaign", exact: true })).toBeVisible();
  await input.setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from('{}') });
  await expect(page.getByRole("region", { name: "Flow creation studio" }).getByRole("alert")).toContainText("not a valid Flow creative pack");
  await expect(page.getByRole("heading", { name: "A reusable content campaign", exact: true })).toBeVisible();
});

test("Hosting runtime configuration enables account controls without build-time configuration", async ({ page }) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.route("**/__/firebase/init.json", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ apiKey: "public-test-config", authDomain: "runtime-test.firebaseapp.com", projectId: "runtime-test", appId: "runtime-test-app" }),
  }));
  await page.route("**/api/studio/status", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ configured: true }),
  }));
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  await page.getByRole("button", { name: "Open account", exact: true }).click();
  await expect(page.getByText("Account connection configured.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
  expect(failures).toEqual([]);
});

test("malformed Hosting configuration and disconnected AI leave local creation usable", async ({ page }) => {
  const envFile = ".env.production.local";
  test.skip(
    existsSync(envFile) && /^NEXT_PUBLIC_FIREBASE_API_KEY=.+/m.test(readFileSync(envFile, "utf8")),
    "This case requires a client export without embedded Firebase configuration.",
  );
  let recover = false;
  await page.route("**/__/firebase/init.json", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify(recover ? { apiKey: "public-test-config", authDomain: "runtime-test.firebaseapp.com", projectId: "runtime-test", appId: "runtime-test-app" } : { projectId: "incomplete" }),
  }));
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  await page.getByRole("button", { name: "Open account", exact: true }).click();
  await expect(page.getByText("Account connection unavailable in this build.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toBeDisabled();
  recover = true;
  await page.getByRole("button", { name: "Retry connections", exact: true }).click();
  await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Back to creating", exact: false }).click();
  await expect(page.getByRole("button", { name: "Sign in for AI draft" })).toBeDisabled();
  await page.getByLabel("Describe what you want to create").fill("A locally useful draft");
  await page.getByLabel("Describe what you want to create").press("Control+Enter");
  await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back to creating", exact: false }).click();
  await expect(page.getByRole("button", { name: "Sign in for AI draft" })).toBeVisible();
  await page.getByRole("button", { name: "Sign in for AI draft" }).click();
  await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back to creating", exact: false }).click();
  await page.getByRole("button", { name: "Make an editable outline without signing in" }).click();
  await expect(page.getByRole("heading", { name: "A locally useful draft", exact: true })).toBeVisible();
});

test("local workflow renders and packages verified files into a valid ZIP", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Flow creation studio" })).toBeVisible();
  await page.getByRole("button", { name: "Workflow", exact: true }).click();
  await page.getByLabel("Describe what you want to create").fill("A local product launch");
  await page.getByRole("button", { name: "Create starter outline" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Run local workflow", exact: true }).click();
  const archive = await download;
  const path = testInfo.outputPath(archive.suggestedFilename());
  await archive.saveAs(path);
  expect(execFileSync("unzip", ["-t", path], { encoding: "utf8" })).toContain("No errors detected");
  const list = execFileSync("unzip", ["-Z1", path], { encoding: "utf8" });
  expect(list).toMatch(/video\.(mp4|webm)/);
  expect(list).toContain("creative.json");
  expect(list).toContain("post.txt");
  expect(list).toContain("voiceover.txt");
  const pack = JSON.parse(execFileSync("unzip", ["-p", path, "creative.json"], { encoding: "utf8" }));
  expect(pack.creative.title).toBe("A local product launch");
  expect(execFileSync("unzip", ["-p", path, "README.txt"], { encoding: "utf8" })).toContain("No posts were published");
  await expect(page.getByRole("status", { name: "" }).filter({ hasText: "Completed locally" })).toBeVisible();
});