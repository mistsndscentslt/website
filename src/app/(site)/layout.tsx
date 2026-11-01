import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import { CartDrawer, MobileBar, ProductModal, RevealObserver, Toast } from "@/components/Overlays";
import { Footer } from "@/components/Sections";
import { ShopProvider } from "@/components/ShopProvider";
import { PageViewTracker } from "@/components/Tracking";
import { storeJsonLd } from "@/lib/seo";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
      <JsonLd data={storeJsonLd()} />
      <div className="grain" aria-hidden="true" />
      <Header />
      <main id="top">{children}</main>
      <Footer />
      <ProductModal />
      <CartDrawer />
      <MobileBar />
      <Toast />
      <RevealObserver />
      <PageViewTracker />
    </ShopProvider>
  );
}
