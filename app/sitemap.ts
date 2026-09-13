import { MetadataRoute } from "next";
import { getProducts } from "@/lib/products-db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ctrl-store.vercel.app";

  // Fetch all products from MongoDB
  const { products } = await getProducts({ limit: 100 });

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/product/${p.handle}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bag`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...productUrls,
  ];
}
