import DownloadBrochureSection from "@/components/DownloadBrochureSection";
import HomeWhoWeAreSection from "@/components/HomeWhoWeAreSection";
import InstallationFlowSection from "@/components/InstallationFlowSection";
import FeaturesSection from "../../components/FeaturesSection";
import Hero from "../../components/Hero";
import Try3DPromoSection from "@/components/Try3DPromoSection";
import { getCategories } from "@/actions/categories";

export default async function Home() {
  const categoriesRes = await getCategories({ includeSubcategories: true });
  const categories =
    categoriesRes.success && categoriesRes.data
      ? categoriesRes.data.categories.flatMap((cat) =>
          cat.subcategories && cat.subcategories.length > 0
            ? cat.subcategories.map((sub) => ({
                ...sub,
                name: `${cat.name} > ${sub.name}`,
              }))
            : [cat]
        )
      : [];

  return (
    <>
      <Hero />
      <HomeWhoWeAreSection />
      <InstallationFlowSection />
      {/* @ts-ignore */}
      <FeaturesSection categories={categories} />
      <Try3DPromoSection />
      <DownloadBrochureSection />
    </>
  );
}
