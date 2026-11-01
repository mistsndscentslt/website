import { AccordsSection } from "@/components/Accords";
import Collection from "@/components/Collection";
import Families from "@/components/Families";
import Hero from "@/components/Hero";
import JsonLd from "@/components/JsonLd";
import Occasions from "@/components/Occasions";
import Quiz from "@/components/Quiz";
import { FAQ, Faq, Guide, Perks } from "@/components/Sections";
import { PRODUCTS } from "@/data/products";
import { faqJsonLd, itemListJsonLd } from "@/lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={[itemListJsonLd("Collection Mists & Scents", PRODUCTS.map((p) => p.id)), faqJsonLd(FAQ)]} />
      <Hero />
      <Guide />
      <Collection />
      <Perks />
      <Occasions />
      <Quiz />
      <AccordsSection />
      <Families />
      <Faq />
    </>
  );
}
