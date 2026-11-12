import { requireDb } from "./supabase";

export type Conversation = {
  userId: string;
  name: string;
  blocked: boolean;
  lastAt: string;
  unread: boolean;
};

/** Pesan dari pengunjung yang belum dibaca Romo. */
export function isUnread(
  lastUserMessageAt: string | null,
  romoReadAt: string | null,
): boolean {
  if (!lastUserMessageAt) return false;
  if (!romoReadAt) return true;
  return new Date(lastUserMessageAt).getTime() > new Date(romoReadAt).getTime();
}

type ConvRow = {
  user_id: string;
  last_message_at: string;
  last_user_message_at: string | null;
  romo_read_at: string | null;
};

export async function adminGetConversations(): Promise<Conversation[]> {
  const db = requireDb();
  const { data, error } = await db
    .from("conversations")
    .select("user_id, last_message_at, last_user_message_at, romo_read_at")
    .order("last_message_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as ConvRow[];

  const people = new Map<string, { name: string; blocked: boolean }>();
  if (rows.length > 0) {
    const { data: ps } = await db
      .from("visitor_profiles")
      .select("user_id, display_name, blocked")
      .in("user_id", rows.map((r) => r.user_id));
    for (const p of (ps ?? []) as {
      user_id: string;
      display_name: string;
      blocked: boolean;
    }[]) {
      people.set(p.user_id, { name: p.display_name, blocked: p.blocked });
    }
  }

  return rows.map((r) => ({
    userId: r.user_id,
    name: people.get(r.user_id)?.name ?? "Pengunjung",
    blocked: people.get(r.user_id)?.blocked ?? false,
    lastAt: r.last_message_at,
    unread: isUnread(r.last_user_message_at, r.romo_read_at),
  }));
}

export async function countUnread(): Promise<number> {
  const { data, error } = await requireDb()
    .from("conversations")
    .select("last_user_message_at, romo_read_at")
    .not("last_user_message_at", "is", null)
    .limit(1000);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Pick<ConvRow, "last_user_message_at" | "romo_read_at">[]).filter(
    (r) => isUnread(r.last_user_message_at, r.romo_read_at),
  ).length;
}
