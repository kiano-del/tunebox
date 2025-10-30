import crypto from "crypto";

/**
 * Baut last.fm api_sig (MD5) aus Parametern + SECRET.
 * Wichtig: Alle Parameter (ohne 'format') alphabetisch sortieren, key+value konkatenieren, am Ende secret, dann MD5.
 */
export function buildApiSig(params: Record<string, string>, secret: string) {
  const entries = Object.entries(params)
    .filter(([k]) => k !== "format")
    .sort(([a],[b]) => a.localeCompare(b));
  const base = entries.map(([k,v]) => `${k}${v}`).join("") + secret;
  return crypto.createHash("md5").update(base).digest("hex");
}
