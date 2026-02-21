import { getCategories } from "@/actions/categories";
import { Suspense } from "react";
import { Metadata } from "next";
import LoadingSpinner from "@/components/LoadingSpinner";
import AllProductsContent from "@/components/AllProductsContent";

export const metadata: Metadata = {
  title: "All Products | Alfa Ventura",
  description: "Explore our complete range of premium quartz, granite, and marble products.",
};

const AllProductsPage = async () => {
  const categoriesResponse = await getCategories({ includeSubcategories: true });

  if (!categoriesResponse.success) {
    return (
      <div className="min-h-screen bg-[#FDFAF7] flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-2xl font-bold text-[#1C1917] mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Unable to Load Products
          </h1>
          <p className="text-[#6B5E52]">Please try again later.</p>
        </div>
      </div>
    );
  }

  const categories = categoriesResponse.data?.categories || [];

  return (
    <div className="min-h-screen bg-[#FDFAF7]">
      {/* Hero Section */}
      <section className="relative bg-[#1C1917] text-white py-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/ban2.webp')" }}
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-5 md:px-12 lg:px-20 xl:px-32">
          <span className="block text-[#C9A96E] text-xs font-semibold tracking-widest uppercase mb-3">
            Product Catalog
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Our Premium Products
          </h1>
          <p className="text-lg text-white/70 mb-8 max-w-xl">
            Discover our comprehensive range of high-quality engineered quartz for your projects.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#C9A96E] rounded-full" />
              <span>{categories.length} Categories</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#C9A96E] rounded-full" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#C9A96E] rounded-full" />
              <span>Global Shipping</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Content */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        }
      >
        {/* @ts-ignore */}
        <AllProductsContent categories={categories} />
      </Suspense>
    </div>
  );
};

export default AllProductsPage;
