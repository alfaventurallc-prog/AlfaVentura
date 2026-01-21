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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Products</h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  const categories = categoriesResponse.data?.categories || [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Premium Products</h1>
            <p className="text-xl text-gray-300 mb-6">
              Discover our comprehensive range of high-quality materials for your projects
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span>{categories.length} Categories</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                <span>Global Shipping</span>
              </div>
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
