import { requireAdmin } from "@/lib/auth";
import PostForm from "../PostForm";

export default async function NewPost() {
  await requireAdmin();
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Jakarta",
  }); // format YYYY-MM-DD

  return (
    <>
      <div className="admin-head">
        <h1 className="page-title">Tulisan baru</h1>
      </div>
      <PostForm defaultDate={today} />
    </>
  );
}
