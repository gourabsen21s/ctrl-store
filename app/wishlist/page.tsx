import Footer from "@/components/Footer";
import WishlistView from "@/components/WishlistView";

export const metadata = {
  title: "Your Wishlist — CTRL + STYLE",
  description: "View and manage your saved items from CTRL + STYLE.",
};

export default function WishlistPage() {
  return (
    <main id="page" data-page="wishlist">
      <WishlistView />
      <Footer />
    </main>
  );
}
