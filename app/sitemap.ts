import type { MetadataRoute } from "next"

import { getPublicWarehouses } from "@/lib/api/public-data"
import { SITE_URL } from "@/lib/site"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/warehouses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/register`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
  ]

  try {
    const warehouses = await getPublicWarehouses({ limit: 100 })
    return [
      ...pages,
      ...warehouses.items.map((warehouse) => ({
        url: `${SITE_URL}/warehouses/${warehouse.id}`,
        lastModified: new Date(warehouse.createdAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ]
  } catch {
    return pages
  }
}
