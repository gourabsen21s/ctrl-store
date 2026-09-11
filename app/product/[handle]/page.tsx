import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import { PRODUCTS, getProduct } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: PageProps<"/product/[handle]">) {
  const { handle } = await params;
  const product = getProduct(handle);
  return { title: product ? `${product.title} — ${product.color}` : "Not found" };
}

export default async function ProductPage({ params }: PageProps<"/product/[handle]">) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) notFound();

  return (
    <main id="page" data-page="product">
      <ProductDetail product={product} />
      <Footer />
    </main>
  );
}
