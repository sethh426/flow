const { test, mock } = require("node:test");
const assert = require("node:assert/strict");
const {
  briefSchema,
  creativeSchema,
  buildCreativePrompt,
  studioHandler,
} = require("../dist/studio");
const { apiHandler } = require("../dist/api-handler");
const auth = require("../dist/auth");
const { Firestore } = require("@google-cloud/firestore");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const OpenAI = require("openai").default;
const {
  productionJobCreateSchema,
  productionJobProgressSchema,
  productionJobCompleteSchema,
  handleProductionJobRequest,
} = require("../dist/production-jobs");

const brief = {
  prompt: "A coffee mug launch",
  kind: "video",
  platform: "TikTok / Reels",
  tone: "Calm & considered",
  duration: 15,
  look: "ember",
};
function response() {
  return {
    code: 200,
    body: null,
    set() {
      return this;
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}
test("brief rejects unbounded input, arbitrary identities and unsupported settings", () => {
  assert.equal(briefSchema.safeParse(brief).success, true);
  for (const patch of [
    { prompt: "x".repeat(4001) },
    { userId: "someone-else" },
    { duration: 1000 },
    { platform: "arbitrary" },
  ])
    assert.equal(briefSchema.safeParse({ ...brief, ...patch }).success, false);
  assert.match(buildCreativePrompt(brief), /Do not promise virality/);
  assert.match(buildCreativePrompt(brief), /requiresApproval=true/);
});
test("creative contract rejects empty or malformed provider results", () => {
  assert.equal(creativeSchema.safeParse({}).success, false);
  assert.equal(
    creativeSchema.safeParse({ title: "Claim", scenes: [] }).success,
    false,
  );
});
test("studio rejects anonymous creation before any provider call", async () => {
  const res = response();
  await studioHandler(
    {
      method: "POST",
      path: "/api/studio/create",
      body: brief,
      get() {
        return undefined;
      },
    },
    res,
  );
  assert.equal(res.code, 401);
});
test("studio rejects unsupported HTTP methods", async () => {
  const res = response();
  await studioHandler({ method: "GET" }, res);
  assert.equal(res.code, 405);
});
test("studio status reports configuration without authenticating or invoking a provider", async () => {
  const model = process.env.FLOW_STUDIO_MODEL;
  delete process.env.FLOW_STUDIO_MODEL;
  try {
    const res = response();
    await studioHandler({ method: "GET", path: "/api/studio/status" }, res);
    assert.equal(res.code, 200);
    assert.equal(res.body.configured, false);
    assert.equal(res.body.capabilities.publishing, false);
    assert.equal(res.body.capabilities.video, "local");
    assert.equal(JSON.stringify(res.body).includes("apiKey"), false);
  } finally {
    if (model !== undefined) process.env.FLOW_STUDIO_MODEL = model;
  }
});
test("selected API rejects anonymous product access", async () => {
  const res = response();
  await apiHandler(
    {
      method: "GET",
      path: "/api/products",
      query: {},
      get() {
        return undefined;
      },
    },
    res,
  );
  assert.equal(res.code, 401);
});
test("a verified user cannot read another user’s product by ID", async () => {
  const authStub = mock.method(auth, "verifiedUser", async () => "owner-a");
  const databaseStub = mock.method(Firestore.prototype, "collection", () => ({
    doc() {
      return { get: async () => ({ exists: true, get: () => "owner-b" }) };
    },
  }));
  try {
    const res = response();
    await apiHandler(
      {
        method: "GET",
        path: "/api/products/private-product",
        query: { userId: "owner-b" },
        body: {},
        get() {},
      },
      res,
    );
    assert.equal(res.code, 404);
  } finally {
    authStub.mock.restore();
    databaseStub.mock.restore();
  }
});
test("the selected API never reports a workflow as running without an executor", async () => {
  const authStub = mock.method(auth, "verifiedUser", async () => "owner-a");
  const databaseStub = mock.method(Firestore.prototype, "collection", () => ({
    doc() {
      return { get: async () => ({ exists: true, get: () => "owner-a" }) };
    },
  }));
  try {
    const res = response();
    await apiHandler(
      {
        method: "POST",
        path: "/api/workflows/execute",
        query: {},
        body: { workflowId: "workflow-1" },
        get() {},
      },
      res,
    );
    assert.equal(res.code, 501);
    assert.match(res.body.error, /remains a draft/);
  } finally {
    authStub.mock.restore();
    databaseStub.mock.restore();
  }
});

test("authenticated AI creation validates the provider response and releases its quota lease", async () => {
  // Provider and database doubles verify integration without spending money or calling a live service.
  const savedModel = process.env.FLOW_STUDIO_MODEL;
  const savedKey = process.env.FLOW_STUDIO_OPENAI_KEY;
  process.env.FLOW_STUDIO_MODEL = "test-model";
  process.env.FLOW_STUDIO_OPENAI_KEY = "unit-test-placeholder";
  const writes = [];
  let providerCalls = 0;
  const stubs = [];
  const creative = {
    title: "Coffee mug launch",
    hook: "A closer look at handmade details.",
    alternateHooks: ["Made for quiet mornings.", "One detail worth noticing."],
    caption: "Meet the new coffee mug. What detail would you choose?",
    hashtags: ["#Handmade"],
    scenes: Array.from({ length: 5 }, (_, index) => ({ label: `Scene ${index + 1}`, text: "Original scene text", narration: "A short narration.", direction: "Show the product." })),
    workflow: Array.from({ length: 6 }, (_, index) => ({ title: `Step ${index + 1}`, detail: "Review the creative.", requiresApproval: true })),
  };
  try {
    stubs.push(mock.method(getAuth(), "verifyIdToken", async (token, checkRevoked) => {
      assert.equal(token, "test-session");
      assert.equal(checkRevoked, true);
      return { uid: "verified-owner" };
    }));
    stubs.push(mock.method(getFirestore(), "collection", (name) => {
      assert.equal(name, "studio_usage");
      return { doc(id) {
        assert.match(id, /^verified-owner_/);
        return { set: async (value) => { writes.push(value); } };
      } };
    }));
    stubs.push(mock.method(getFirestore(), "runTransaction", async (run) => run({
      get: async () => ({ get: () => 0 }),
      set: (_reference, value) => writes.push(value),
    })));
    stubs.push(mock.method(OpenAI.prototype, "post", async (_path, options) => {
      providerCalls++;
      assert.equal(options.body.model, "test-model");
      return { choices: [{ message: { content: JSON.stringify(creative) } }] };
    }));
    const res = response();
    await studioHandler({ method: "POST", path: "/api/studio/create", body: brief, get: () => "Bearer test-session" }, res);
    assert.equal(res.code, 200);
    assert.equal(res.body.source, "ai");
    assert.equal(res.body.creative.scenes[0].text, creative.hook);
    assert.equal(providerCalls, 1);
    assert.equal(writes[0].count, 1);
    assert.equal(writes.at(-1).leaseUntil, 0);
  } finally {
    for (const stub of stubs.reverse()) stub.mock.restore();
    if (savedModel === undefined) delete process.env.FLOW_STUDIO_MODEL;
    else process.env.FLOW_STUDIO_MODEL = savedModel;
    if (savedKey === undefined) delete process.env.FLOW_STUDIO_OPENAI_KEY;
    else process.env.FLOW_STUDIO_OPENAI_KEY = savedKey;
  }
});


test("production job contracts reject client-owned identity and malformed progress", () => {
  const jobId = "11111111-1111-4111-8111-111111111111";
  assert.equal(productionJobCreateSchema.safeParse({ jobId, projectId: "project-1" }).success, true);
  assert.equal(productionJobCreateSchema.safeParse({ jobId, projectId: "project-1", userId: "other" }).success, false);
  assert.equal(productionJobProgressSchema.safeParse({ stage: "rendering", progress: 50 }).success, true);
  assert.equal(productionJobProgressSchema.safeParse({ stage: "published", progress: 101 }).success, false);
  assert.equal(productionJobCompleteSchema.safeParse({
    artifact: { kind: "local-bundle", fileName: "flow.zip", mediaType: "application/zip", sizeBytes: 1234 },
  }).success, true);
});

test("production jobs are idempotent, persisted and terminal states reject regression", async () => {
  const jobId = "11111111-1111-4111-8111-111111111111";
  const store = new Map();
  const stubs = [];
  try {
    stubs.push(mock.method(getFirestore(), "collection", (name) => {
      assert.equal(name, "studio_users");
      return {
        doc(userId) {
          assert.equal(userId, "verified-owner");
          return {
            collection(child) {
              assert.equal(child, "production_jobs");
              return {
                doc(id) {
                  return {
                    id,
                    async get() {
                      return {
                        exists: store.has(id),
                        data: () => store.get(id),
                      };
                    },
                  };
                },
              };
            },
          };
        },
      };
    }));
    stubs.push(mock.method(getFirestore(), "runTransaction", async (run) => run({
      async get(ref) {
        return {
          exists: store.has(ref.id),
          data: () => store.get(ref.id),
        };
      },
      set(ref, value, options) {
        const current = store.get(ref.id) || {};
        store.set(ref.id, options?.merge ? { ...current, ...value } : value);
      },
    })));

    let res = response();
    await handleProductionJobRequest(
      { method: "POST", path: "/api/studio/jobs", body: { jobId, projectId: "project-1" } },
      res,
      "verified-owner",
    );
    assert.equal(res.code, 201);
    assert.equal(res.body.job.status, "running");
    assert.equal(res.body.job.stage, "validated");

    res = response();
    await handleProductionJobRequest(
      { method: "POST", path: `/api/studio/jobs/${jobId}/progress`, body: { stage: "rendering", progress: 40 } },
      res,
      "verified-owner",
    );
    assert.equal(res.code, 200);
    assert.equal(res.body.job.progress, 40);

    res = response();
    await handleProductionJobRequest(
      {
        method: "POST",
        path: `/api/studio/jobs/${jobId}/complete`,
        body: { artifact: { kind: "local-bundle", fileName: "flow.zip", mediaType: "application/zip", sizeBytes: 1234 } },
      },
      res,
      "verified-owner",
    );
    assert.equal(res.code, 200);
    assert.equal(res.body.job.status, "completed");
    assert.equal(res.body.job.progress, 100);

    res = response();
    await handleProductionJobRequest(
      { method: "POST", path: `/api/studio/jobs/${jobId}/progress`, body: { stage: "packaging", progress: 90 } },
      res,
      "verified-owner",
    );
    assert.equal(res.code, 409);

    res = response();
    await handleProductionJobRequest(
      { method: "GET", path: `/api/studio/jobs/${jobId}`, body: {} },
      res,
      "verified-owner",
    );
    assert.equal(res.code, 200);
    assert.equal(res.body.job.artifact.fileName, "flow.zip");
  } finally {
    for (const stub of stubs.reverse()) stub.mock.restore();
  }
});
