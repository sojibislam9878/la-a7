import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/farmer", "/owner", "/admin", "/payment", "/verify-otp"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
