import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://idli.food";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/hotels", "/privacy", "/delete-account"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
}
