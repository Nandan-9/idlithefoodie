import type { MetadataRoute } from "next";
import { API_BASE } from "@/lib/config";
import type { Hotel } from "@/types/feed";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.idli.food";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["/", "/hotels", "/privacy", "/delete-account"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  try {
    const res = await fetch(`${API_BASE}/hotel/list/?platform=web`);
    if (!res.ok) return pages;
    const body = await res.json();
    const list: Hotel[] = body?.data ?? body;
    if (!Array.isArray(list)) return pages;
    return [...pages, ...list.map((h) => ({ url: `${SITE_URL}/explore/${h.id}` }))];
  } catch {
    return pages;
  }
}
