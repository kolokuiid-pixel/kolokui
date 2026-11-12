// Pemberitahuan email lewat Resend. Opsional: kalau variabel belum diisi, tidak melakukan apa-apa.
// Email sengaja TIDAK memuat isi pesan, hanya tautan ke situs.

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}

export async function sendNotification(
  to: string | undefined,
  subject: string,
  text: string,
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL;
  if (!key || !from || !to) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!res.ok) {
      console.error("Pemberitahuan email gagal:", res.status, await res.text());
    }
  } catch (e) {
    console.error("Pemberitahuan email gagal:", e);
  }
}
