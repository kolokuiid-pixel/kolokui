import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { RUBRIK_SLUGS, type RubrikSlug } from "./rubrik";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Post = {
  rubrik: RubrikSlug;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

function readRubrik(rubrik: RubrikSlug): Post[] {
  const dir = path.join(CONTENT_DIR, rubrik);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data } = matter(raw);
      return {
        rubrik,
        slug: file.replace(/\.md$/, ""),
        title: String(data.title ?? file),
        date: String(data.date ?? ""),
        excerpt: String(data.ringkasan ?? ""),
      };
    });
}

export function getPosts(rubrik?: RubrikSlug): Post[] {
  const rubriks = rubrik ? [rubrik] : RUBRIK_SLUGS;
  return rubriks
    .flatMap(readRubrik)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(rubrik: RubrikSlug, slug: string) {
  const file = path.join(CONTENT_DIR, rubrik, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const processed = await remark().use(html).process(content);
  return {
    rubrik,
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    excerpt: String(data.ringkasan ?? ""),
    html: processed.toString(),
  };
}

export type PustakaItem = {
  judul: string;
  jenis: string;
  tahun: string;
  file: string | null;
};

export function getPustaka(): PustakaItem[] {
  const file = path.join(CONTENT_DIR, "pustaka.json");
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8")) as PustakaItem[];
}
