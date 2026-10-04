import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export async function verifiedUser(req: {
  get(name: string): string | undefined;
}): Promise<string | null> {
  const token = /^Bearer (.+)$/.exec(req.get("Authorization") || "")?.[1];
  if (!token) return null;
  try {
    if (!getApps().length) initializeApp();
    return (await getAuth().verifyIdToken(token, true)).uid;
  } catch {
    return null;
  }
}
