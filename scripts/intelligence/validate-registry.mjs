import fs from "node:fs";

const path = new URL("../../flow-intelligence/SOURCES.json", import.meta.url);
const registry = JSON.parse(fs.readFileSync(path, "utf8"));

const allowedAuthority = new Set(["primary", "secondary", "community"]);
const allowedStatus = new Set(["active-reference", "candidate", "benchmark", "experiment", "rejected"]);

if (registry.schemaVersion !== 1) throw new Error("Unsupported source registry schemaVersion");
if (!/^\d{4}-\d{2}-\d{2}$/.test(registry.verifiedOn || "")) throw new Error("verifiedOn must be YYYY-MM-DD");
if (!Array.isArray(registry.sources) || registry.sources.length === 0) throw new Error("sources must be non-empty");

const ids = new Set();
for (const [i, source] of registry.sources.entries()) {
  const at = `sources[${i}]`;
  for (const key of ["id","name","url","type","authority","status"]) {
    if (typeof source[key] !== "string" || !source[key].trim()) throw new Error(`${at} missing ${key}`);
  }
  if (ids.has(source.id)) throw new Error(`duplicate source id: ${source.id}`);
  ids.add(source.id);
  const url = new URL(source.url);
  if (url.protocol !== "https:") throw new Error(`${source.id} must use https`);
  if (!allowedAuthority.has(source.authority)) throw new Error(`${source.id} has invalid authority`);
  if (!allowedStatus.has(source.status)) throw new Error(`${source.id} has invalid status`);
  if (source.capabilities && (!Array.isArray(source.capabilities) || source.capabilities.some(x => typeof x !== "string"))) {
    throw new Error(`${source.id} capabilities must be string[]`);
  }
}

console.log(`Flow intelligence registry valid: ${registry.sources.length} sources, verified ${registry.verifiedOn}`);
