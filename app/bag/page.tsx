import Footer from "@/components/Footer";
import BagView from "@/components/BagView";

export const metadata = { title: "Your Bag" };

export default function BagPage() {
  return (
    <main id="page" data-page="bag">
      <BagView />
      <Footer />
    </main>
  );
}
