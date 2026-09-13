import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import { PRODUCTS, money } from "@/lib/products";
import { getProductByHandle } from "@/lib/products-db";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ handle: p.handle }));
}

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return {
      title: "Product Not Found | CTRL + STYLE",
    };
  }

  const priceFormatted = money(product.price);
  const imageUrl = product.frontImage || product.backImage || "";
  const title = `${product.title} (${priceFormatted}) — ${product.color}`;
  const description = `${product.description} Available in ${product.color} for ${priceFormatted}.`;

  return {
    title: `${product.title} — ${product.color} | CTRL + STYLE`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "CTRL + STYLE",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 1200,
              alt: `${product.title} in ${product.color}`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  return (
    <main id="page" data-page="product">
      <ProductDetail product={product} />
      <Footer />
    </main>
  );
}
