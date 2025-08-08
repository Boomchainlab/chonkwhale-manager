/**
 * Neon SQL client, optional. Uses DATABASE_URL if present.
 * Guidance: use @neondatabase/serverless and neon(DATABASE_URL) to create a reusable SQL client [^vercel_knowledge_base].
 */
import { neon } from "@neondatabase/serverless";

export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export async function pingDb(): Promise<{ ok: boolean; error?: string }> {
  if (!sql) return { ok: false, error: "not-configured" };
  try {
    await sql`SELECT 1 as ok`;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
