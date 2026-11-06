import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const envPath = join(process.cwd(), ".env.production.local");
const local = existsSync(envPath)
  ? readFileSync(envPath, "utf8").split(/\r?\n/).find((line) => line.startsWith("NEXT_PUBLIC_FLOW_STUDIO_API_ORIGIN="))?.split("=").slice(1).join("=")
  : undefined;
const raw = process.env.NEXT_PUBLIC_FLOW_STUDIO_API_ORIGIN ?? local;
if (!raw) {
  console.log("Studio origin check skipped: no external origin configured.");
  process.exit(0);
}
const origin = raw.trim().replace(/^["']|["']$/g, "");
if (!/^https:\/\/[^/]+$/.test(origin))
  throw new Error("Studio API origin must be an unquoted HTTPS origin without a path.");

const chunks = join(process.cwd(), "out", "_next", "static", "chunks");
function containsOrigin(dir) {
  return readdirSync(dir, { withFileTypes: true }).some((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? containsOrigin(path)
      : entry.name.endsWith(".js") && readFileSync(path, "utf8").includes(origin);
  });
}
if (!containsOrigin(chunks))
  throw new Error("Exported client is missing the configured Studio API origin.");
console.log("Exported client contains the configured Studio API origin.");
