const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { mkdtempSync, readFileSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { execFileSync } = require("node:child_process");
const { SignJWT, importPKCS8 } = require("jose");
const { handle, verifyFirebaseToken } = require("../dist/ovh-studio");

test("OVH service reports only configured capabilities and rejects untrusted requests", async () => {
  const server = createServer((req, res) => { void handle(req, res); });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const status = await fetch(`${base}/api/studio/status`, { headers: { Origin: "https://affiliateflow-abzfy.web.app" } });
    assert.equal(status.status, 200);
    assert.equal(status.headers.get("access-control-allow-origin"), "https://affiliateflow-abzfy.web.app");
    assert.deepEqual((await status.json()).capabilities, {
      creative: false, video: "local", workflow: "local", narration: false,
      visuals: false, footage: false, publishing: false,
    });
    const preflight = await fetch(`${base}/api/studio/create`, {
      method: "OPTIONS", headers: { Origin: "https://affiliateflow-abzfy.web.app", "Access-Control-Request-Method": "POST" },
    });
    assert.equal(preflight.status, 204);
    assert.equal((await fetch(`${base}/api/studio/status`, { headers: { Origin: "https://attacker.example" } })).status, 403);
    assert.equal((await fetch(`${base}/api/studio/create`, { method: "POST" })).status, 401);
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
    const sign = (claims = {}, audience = "affiliateflow-abzfy", issuer = "https://securetoken.google.com/affiliateflow-abzfy") => new SignJWT({ auth_time: Math.floor(Date.now() / 1000), ...claims })
      .setProtectedHeader({ alg: "RS256", kid: "test" })
      .setSubject("firebase-user")
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
  } finally {
    global.fetch = previousFetch;
    rmSync(directory, { recursive: true, force: true });
  }
});
