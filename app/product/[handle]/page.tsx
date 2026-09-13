import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import { PRODUCTS } from "@/lib/products";
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
  return {
    title: product ? `${product.title} — ${product.color} | CTRL + STYLE` : "Product Not Found",
    description: product?.description || "Curated apparel and goods",
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
