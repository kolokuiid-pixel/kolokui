import { requireAdmin } from "@/lib/auth";
import { countUnread } from "@/lib/pesan";
import { getDb } from "@/lib/supabase";
import AdminNav from "./AdminNav";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await requireAdmin();
  let unread = 0;
  if (role === "romo" && getDb()) {
    try {
      unread = await countUnread();
    } catch {
      /* tabel belum dibuat: abaikan */
    }
  }
  return (
    <div className="wrap">
      <AdminNav role={role} unread={unread} />
      {children}
    </div>
  );
}
