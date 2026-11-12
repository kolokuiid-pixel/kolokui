import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { adminGetPost } from "@/lib/posts";
import PostForm from "../PostForm";

export default async function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await adminGetPost(id);
  if (!post) notFound();

  return (
    <>
      <div className="admin-head">
        <h1 className="page-title">Edit tulisan</h1>
      </div>
      <PostForm initial={post} defaultDate={post.date} />
    </>
  );
}
