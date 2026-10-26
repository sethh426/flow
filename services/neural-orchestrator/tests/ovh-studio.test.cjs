const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { createHash, randomUUID } = require("node:crypto");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { execFileSync } = require("node:child_process");
const { SignJWT, importPKCS8 } = require("jose");
const routeStore = mkdtempSync(join(tmpdir(), "flow-route-tools-"));
process.env.FLOW_STUDIO_USAGE_DIR = routeStore;
const { handle, verifyFirebaseToken } = require("../dist/ovh-studio");
const { buildCreativePrompt, unsupportedCreativeClaims, repairUnsupportedCreativeClaims, creativeSchema } = require("../dist/studio-contract");

test("AI prompt and groundedness guard reject invented booking mechanics", () => {
  const brief = {
    prompt: "Make a 15-second video for an Indianapolis home-cleaning business explaining easy online booking. No invented claims.",
    kind: "video", platform: "TikTok / Reels", tone: "Warm & personal", duration: 15, look: "ember",
    narrationMode: "script", visualMode: "local", footageMode: "local",
  };
  assert.match(buildCreativePrompt(brief), /sole source of facts/);
  const creative = {
    title: "Easy online booking",
    hook: "Book in 2 clicks",
    alternateHooks: ["Online booking", "Book from our app"],
    caption: "Pick a time in seconds.",
    scenes: [{ text: "Confirm instantly", narration: "Choose a slot on our calendar.", direction: "If available, show the real calendar." }],
  };
  assert.deepEqual(unsupportedCreativeClaims(brief, creative), ["2 clicks", "in seconds", "instantly", "our app", "calendar"]);
  assert.deepEqual(unsupportedCreativeClaims(brief, { ...creative, hook: "Our team helps you choose a date in a few steps", alternateHooks: [], caption: "", scenes: [] }), ["our team", "choose a date", "few steps"]);
  const forbidden = { ...brief, prompt: brief.prompt + " Do not claim 2 clicks or an app." };
  assert.deepEqual(unsupportedCreativeClaims(forbidden, { ...creative, alternateHooks: [], caption: "", scenes: [] }), ["2 clicks"]);
  const complete = {
    ...creative,
    scenes: [
      { label: "Open", text: "Book in 2 clicks", narration: "It takes seconds.", direction: "Show the calendar." },
      { label: "Detail", text: "Online booking", narration: "Indianapolis home cleaning.", direction: "If available, show real footage." },
      { label: "Close", text: "Get started", narration: "Learn more.", direction: "Show real footage." },
    ],
    workflow: [
      { title: "Draft", detail: "Prepare draft", requiresApproval: false },
      { title: "Review", detail: "Check evidence", requiresApproval: true },
      { title: "Share", detail: "Await approval", requiresApproval: true },
    ],
    hashtags: ["#Cleaning"],
  };
  const repaired = repairUnsupportedCreativeClaims(brief, complete);
  assert.equal(repaired.edited, true);
  assert.equal(creativeSchema.safeParse(repaired.creative).success, true);
  assert.deepEqual(unsupportedCreativeClaims(brief, repaired.creative), []);
  assert.equal(repaired.creative.scenes[0].text, repaired.creative.hook);
  assert.match(repaired.creative.scenes[1].text, /Indianapolis home-cleaning business/);
  assert.equal(repaired.creative.scenes.at(-1).text, "Learn more");
  assert.doesNotMatch(JSON.stringify(repaired.creative), /Book in 2 clicks|It takes seconds|Show the calendar/);
  const invented = { ...complete, caption: "Warm glaze and unique shape. Tap to shop.", scenes: complete.scenes.map((scene) => ({ ...scene, narration: "Warm glaze and unique shape." })) };
  const constrained = repairUnsupportedCreativeClaims({ ...brief, prompt: "Create a video about a handmade ceramic coffee mug. It is handmade in Indiana. Use only these facts." }, invented);
  assert.doesNotMatch(JSON.stringify(constrained.creative), /warm glaze|unique shape|tap to shop/i);
  assert.match(constrained.creative.caption, /handmade in Indiana/i);
  const supplied = { ...brief, prompt: brief.prompt + " Customers can book in 2 clicks through our app with a calendar." };
  assert.deepEqual(unsupportedCreativeClaims(supplied, { ...creative, caption: "Online booking", scenes: [{ text: "Online booking", narration: "See how it works.", direction: "" }] }), []);
});

test("OVH service reports only configured capabilities and rejects untrusted requests", async () => {
  const server = createServer((req, res) => { void handle(req, res); });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const status = await fetch(`${base}/api/studio/status`, { headers: { Origin: "https://affiliateflow-abzfy.web.app" } });
    assert.equal(status.status, 200);
    assert.equal(status.headers.get("access-control-allow-origin"), "https://affiliateflow-abzfy.web.app");
    assert.deepEqual((await status.json()).capabilities, {
      creative: false, video: "local", workflow: "local", productionJobs: false, serverRender: true, renderScheduling: true, narration: false,
      visuals: false, footage: false, publishing: false, serverMedia: true,
    });
    const preflight = await fetch(`${base}/api/studio/create`, {
      method: "OPTIONS", headers: { Origin: "https://affiliateflow-abzfy.web.app", "Access-Control-Request-Method": "POST" },
    });
    assert.equal(preflight.status, 204);
    assert.equal((await fetch(`${base}/api/studio/status`, { headers: { Origin: "https://attacker.example" } })).status, 403);
    assert.equal((await fetch(`${base}/api/studio/create`, { method: "POST" })).status, 401);
    assert.equal((await fetch(`${base}/api/studio/workflows/execute`, { method: "POST" })).status, 401);
    assert.equal((await fetch(`${base}/api/studio/workflows`)).status, 401);
    assert.equal((await fetch(`${base}/api/studio/tools`)).status, 401);
    assert.equal((await fetch(`${base}/api/studio/tools`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })).status, 401);
    assert.equal((await fetch(`${base}/api/studio/tools/00000000-0000-4000-8000-000000000000`, { method: "DELETE" })).status, 401);
    assert.equal((await fetch(`${base}/api/studio/workflows/00000000-0000-4000-8000-000000000000`)).status, 401);
    assert.equal((await fetch(`${base}/api/studio/workflows/00000000-0000-4000-8000-000000000000`, { method: "DELETE" })).status, 401);
    assert.equal((await fetch(`${base}/api/studio/workflows/00000000-0000-4000-8000-000000000000`, { method: "PUT" })).status, 401);
    assert.equal((await fetch(`${base}/api/studio/workflows/00000000-0000-4000-8000-000000000000/render`, { method: "POST" })).status, 401);
    assert.equal((await fetch(`${base}/api/studio/workflows/00000000-0000-4000-8000-000000000000/video`)).status, 401);
    assert.equal((await fetch(`${base}/api/studio/workflows/00000000-0000-4000-8000-000000000000/media/images/0`, { method: "PUT" })).status, 401);
    assert.equal((await fetch(`${base}/api/studio/workflows/00000000-0000-4000-8000-000000000000/media`, { method: "DELETE" })).status, 401);
    assert.equal((await fetch(`${base}/api/studio/jobs/abc`)).status, 404);
    assert.equal((await fetch(`${base}/healthz`)).status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("Firebase token verification enforces signature, project, issuer, and subject", async () => {
  const directory = mkdtempSync(join(tmpdir(), "flow-cert-"));
  const previousFetch = global.fetch;
  try {
    execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", join(directory, "key.pem"), "-out", join(directory, "cert.pem"), "-subj", "/CN=test", "-days", "1"], { stdio: "ignore" });
    const cert = readFileSync(join(directory, "cert.pem"), "utf8");
    const key = await importPKCS8(readFileSync(join(directory, "key.pem"), "utf8"), "RS256");
    global.fetch = async () => new Response(JSON.stringify({ test: cert }), { status: 200, headers: { "Cache-Control": "max-age=300" } });
    const sign = (claims = {}, audience = "affiliateflow-abzfy", issuer = "https://securetoken.google.com/affiliateflow-abzfy", subject = "firebase-user") => new SignJWT({ auth_time: Math.floor(Date.now() / 1000), ...claims })
      .setProtectedHeader({ alg: "RS256", kid: "test" })
      .setSubject(subject)
      .setAudience(audience)
      .setIssuer(issuer)
      .setIssuedAt().setExpirationTime("1h").sign(key);
    assert.equal(await verifyFirebaseToken(await sign()), "firebase-user");
    const signed = await sign();
    const parts = signed.split(".");
    parts[1] = Buffer.from(JSON.stringify({ sub: "attacker", aud: "affiliateflow-abzfy" })).toString("base64url");
    await assert.rejects(verifyFirebaseToken(parts.join(".")));
    await assert.rejects(verifyFirebaseToken(await sign({}, "other-project")));
    await assert.rejects(verifyFirebaseToken(await sign({}, "affiliateflow-abzfy", "https://attacker.example")));
    await assert.rejects(verifyFirebaseToken(await sign({ auth_time: Math.floor(Date.now() / 1000) + 3600 })));
    const server = createServer((req, res) => { void handle(req, res); });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const base = `http://127.0.0.1:${server.address().port}`;
      const alice = await sign({}, undefined, undefined, "alice");
      const bob = await sign({}, undefined, undefined, "bob");
      const input = { pluginId: "brief-check", version: "1.0.0", title: "Brief check", artifacts: [{ name: "brief-review.json", type: "application/json", content: "{\"ready\":true}" }] };
      const create = await previousFetch(base + "/api/studio/tools", { method: "POST", headers: { Authorization: `Bearer ${alice}`, "Content-Type": "application/json" }, body: JSON.stringify(input) });
      assert.equal(create.status, 201);
      const id = (await create.json()).run.id;
      const list = async (token) => (await (await previousFetch(base + "/api/studio/tools", { headers: { Authorization: `Bearer ${token}` } })).json()).runs;
      assert.equal((await list(alice)).length, 1);
      assert.deepEqual(await list(bob), []);
      assert.equal((await previousFetch(base + "/api/studio/tools/" + id, { method: "DELETE", headers: { Authorization: `Bearer ${bob}` } })).status, 404);
      assert.equal((await list(alice)).length, 1);
      assert.equal((await previousFetch(base + "/api/studio/tools/" + id, { method: "DELETE", headers: { Authorization: `Bearer ${alice}` } })).status, 200);
      assert.deepEqual(await list(alice), []);
      const runId = randomUUID();
      const ownerDir = join(routeStore, "workflow-runs", createHash("sha256").update("alice").digest("hex"));
      mkdirSync(ownerDir, { recursive: true });
      writeFileSync(join(ownerDir, runId + ".json"), JSON.stringify({ executionId: runId, version: 1 }));
      const mediaUrl = base + "/api/studio/workflows/" + runId + "/media";
      const sample = Buffer.from([255, 216, 255, 224, 0, 1, 2, 3]);
      const upload = (token, version, bytes, type = "image/jpeg") => previousFetch(mediaUrl + "/images/0", { method: "PUT", headers: { Authorization: `Bearer ${token}`, "X-Flow-Draft-Version": String(version), "Content-Type": type }, body: bytes });
      assert.equal((await upload(bob, 1, sample)).status, 404);
      assert.equal((await upload(alice, 2, sample)).status, 409);
      assert.equal((await upload(alice, 1, Buffer.from("not an image"))).status, 415);
      assert.equal((await upload(alice, 1, sample)).status, 201);
      assert.equal((await previousFetch(mediaUrl, { method: "DELETE", headers: { Authorization: `Bearer ${bob}` } })).status, 404);
      assert.equal((await previousFetch(mediaUrl, { method: "DELETE", headers: { Authorization: `Bearer ${alice}` } })).status, 200);
      assert.equal(require("../dist/studio-media").savedMedia("alice", runId).images.length, 0);
    } finally { await new Promise((resolve) => server.close(resolve)); }
  } finally {
    global.fetch = previousFetch;
    rmSync(directory, { recursive: true, force: true });
    rmSync(routeStore, { recursive: true, force: true });
  }
});

const { listToolArchives, saveToolArchive, deleteToolArchive } = require("../dist/tool-archive");
test("tool archives enforce schema, account isolation, bounded output and deletion", () => {
  const root = mkdtempSync(join(tmpdir(), "flow-tools-"));
  try {
    const input = { pluginId: "content-calendar", version: "1.0.0", title: "Content Calendar Export", artifacts: [{ name: "content-calendar.csv", type: "text/csv;charset=utf-8", content: "Date,Channel\\n2026-11-01,Instagram" }] };
    assert.equal(saveToolArchive(root, "alice", { ...input, pluginId: "untrusted" }), null);
    assert.equal(saveToolArchive(root, "alice", { ...input, artifacts: [{ ...input.artifacts[0], content: "X".repeat(16000) }] }), null);
    const item = saveToolArchive(root, "alice", input);
    assert.ok(item?.id);
    assert.equal(listToolArchives(root, "alice").length, 1);
    assert.deepEqual(listToolArchives(root, "bob"), []);
    assert.equal(deleteToolArchive(root, "bob", item.id), false);
    assert.equal(listToolArchives(root, "alice").length, 1);
    assert.equal(deleteToolArchive(root, "alice", item.id), true);
    assert.deepEqual(listToolArchives(root, "alice"), []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test("server production only accepts a decodable 720p vertical MP4 with expected media", async () => {
  const { renderStudioVideo, verifyStudioVideo } = require("../dist/studio-actions");
  const dir = mkdtempSync(join(tmpdir(), "flow-video-check-"));
  const id = randomUUID();
  const record = join(dir, id + ".json");
  const video = join(dir, id + ".mp4");
  const brief = {
    prompt: "Show a coffee mug", kind: "video", platform: "TikTok / Reels",
    tone: "Warm & personal", duration: 15, look: "ember",
    narrationMode: "script", visualMode: "local", footageMode: "local",
  };
  const creative = {
    title: "Coffee mug", hook: "Coffee mug", alternateHooks: ["A mug", "Coffee time"],
    caption: "A coffee mug.", hashtags: [],
    scenes: [1, 2, 3].map((i) => ({
      label: "Scene " + i, text: "Coffee mug " + i, narration: "", direction: "Show mug.",
    })),
    workflow: [1, 2, 3].map((i) => ({ title: "Step " + i, detail: "Review.", requiresApproval: false })),
  };
  try {
    writeFileSync(record, JSON.stringify({ executionId: id, brief, creative }));
    const stages = [];
    await renderStudioVideo(record, video, { executionId: id, brief, creative }, (stage) => stages.push(stage));
    assert.deepEqual(stages, ["encoding", "verifying"]);
    await verifyStudioVideo(video, 15, false);
    await assert.rejects(verifyStudioVideo(video, 15, true), /approved format/);
    await assert.rejects(verifyStudioVideo(video, 30, false), /approved format/);
    const corrupt = join(dir, "corrupt.mp4");
    writeFileSync(corrupt, Buffer.alloc(4096));
    await assert.rejects(verifyStudioVideo(corrupt, 15, false), /video probe failed/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
