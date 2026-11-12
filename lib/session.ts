// Sesi admin: cookie "<peran>.<kedaluwarsa>.<tanda tangan HMAC>". Memakai Web Crypto supaya jalan
// di middleware (Edge) maupun di server Node.
//
// Dua peran:
//   admin = mengurus tulisan, Pustaka, profil, komentar (ADMIN_PASSWORD)
//   romo  = semua itu + membaca dan membalas pesan pribadi (ROMO_PASSWORD)

export type Role = "admin" | "romo";

export const COOKIE_NAME = "kolokui_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

const enc = new TextEncoder();

function getSecret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 16 ? s : null;
}

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSession(role: Role): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET belum diatur (min. 16 karakter).");
  const payload = `${role}.${Date.now() + SESSION_MAX_AGE * 1000}`;
  return `${payload}.${await hmac(payload, secret)}`;
}

/** Mengembalikan peran kalau cookie sah dan belum kedaluwarsa, selain itu null. */
export async function verifySession(value: string | undefined): Promise<Role | null> {
  if (!value) return null;
  const secret = getSecret();
  if (!secret) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [role, exp, sig] = parts;
  if (role !== "admin" && role !== "romo") return null;
  const expires = Number(exp);
  if (!Number.isFinite(expires) || expires < Date.now()) return null;
  try {
    return safeEqual(sig, await hmac(`${role}.${exp}`, secret)) ? role : null;
  } catch {
    return null;
  }
}

/** Membandingkan password lewat HMAC supaya panjang dan waktu bandingnya tidak membocorkan apa-apa. */
export async function checkPassword(
  input: string,
): Promise<{ role: Role } | "wrong" | "unconfigured"> {
  const secret = getSecret();
  const admin = process.env.ADMIN_PASSWORD;
  const romo = process.env.ROMO_PASSWORD;
  if (!secret || (!admin && !romo)) return "unconfigured";

  const given = await hmac(`pw:${input}`, secret);
  const romoOk = romo ? safeEqual(given, await hmac(`pw:${romo}`, secret)) : false;
  const adminOk = admin ? safeEqual(given, await hmac(`pw:${admin}`, secret)) : false;
  if (romoOk) return { role: "romo" };
  if (adminOk) return { role: "admin" };
  return "wrong";
}
