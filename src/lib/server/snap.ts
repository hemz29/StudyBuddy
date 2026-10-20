import "server-only";
import { serviceStore } from "./context";

// Resolves a phone link: still valid, and for which practice and child?
export async function resolveToken(token: string) {
  const store = serviceStore();
  const t = await store.getToken(token);
  if (!t || new Date(t.expiresAt) < new Date()) return null;
  const session = await store.getSession(t.parentId, t.sessionId);
  const child = await store.getChild(t.parentId, t.childId);
  if (!session || !child) return null;
  return { store, session, child };
}
