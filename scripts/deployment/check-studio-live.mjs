const origin = process.argv[2];
if (!origin || !/^https:\/\//.test(origin)) {
  console.error("Usage: node scripts/deployment/check-studio-live.mjs https://your-flow-site");
  process.exit(2);
}

try {
  const response = await fetch(new URL("/api/studio/status", origin), {
    signal: AbortSignal.timeout(15_000),
    headers: { Accept: "application/json" },
  });
  if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`Studio API returned ${response.status} ${response.headers.get("content-type") || "without a content type"}`);
  }
  const status = await response.json();
  if (status?.configured !== true || status?.capabilities?.creative !== "ai") {
    throw new Error("Studio API responds, but AI creation is not configured");
  }
  console.log("Studio API is reachable and reports AI creation configured.");
  console.log("A signed-in provider generation must still be verified separately.");
} catch (error) {
  console.error(`Flow deployment check failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
