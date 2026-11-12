import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifySession, type Role } from "./session";

export async function getRole(): Promise<Role | null> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return verifySession(value);
}

/** Panggil di setiap halaman dan aksi admin, sebagai lapisan kedua setelah middleware. */
export async function requireAdmin(): Promise<Role> {
  const role = await getRole();
  if (!role) redirect("/admin/login");
  return role;
}

/** Khusus Romo: pesan pribadi pengunjung. Peran admin biasa dialihkan. */
export async function requireRomo(): Promise<void> {
  const role = await requireAdmin();
  if (role !== "romo") redirect("/admin");
}
