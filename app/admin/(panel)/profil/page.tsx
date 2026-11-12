import { requireAdmin } from "@/lib/auth";
import { getSiteProfile } from "@/lib/profile";
import { getDb } from "@/lib/supabase";
import ProfilForm from "./ProfilForm";

export const dynamic = "force-dynamic";

export default async function AdminProfil() {
  await requireAdmin();
  const configured = getDb() !== null;
  const p = await getSiteProfile();
  return (
    <>
      <div className="admin-head">
        <h1 className="page-title">Profil Romo</h1>
      </div>
      {!configured ? (
        <p className="flash flash-error" role="alert">Supabase belum tersambung.</p>
      ) : (
        <section className="panel-box">
          <ProfilForm
            initial={{ nama: p.nama, peran: p.peran, bio: p.bio, kisah: p.kisah, fotoPath: p.fotoPath }}
          />
        </section>
      )}
    </>
  );
}
