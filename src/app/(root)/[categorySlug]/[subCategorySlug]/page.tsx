import { getCategoryBySlug } from "@/actions/categories";
import { ChevronRight, Home, Package } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

interface CategoryWithSubcategories {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    _count: {
      products: number;
    };
  }>;
  _count: {
    products: number;
    subcategories: number;
  };
  allProducts: ProductWithCategory[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProductWithCategory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  images: string[];
  videos: string[];
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    parent?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
}

const ProductsPage = async ({ params }: { params: Promise<{ categorySlug: string; subCategorySlug: string }> }) => {
  const { subCategorySlug } = await params;

  const categoryResponse = await getCategoryBySlug(subCategorySlug);

  if (!categoryResponse?.success) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1C1917]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Category Not Found</h1>
          <p className="text-[#6B5E52] mt-2">No category found for: {subCategorySlug}</p>
          <Link href="/" className="inline-flex items-center mt-4 text-[#9B7040] hover:text-[#7A5520] gap-1">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const category = categoryResponse.data;

  if (!category) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1C1917]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Category Not Found</h1>
          <p className="text-[#6B5E52] mt-2">No category found for: {subCategorySlug}</p>
          <Link href="/" className="inline-flex items-center mt-4 text-[#9B7040] hover:text-[#7A5520] gap-1">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const allProducts = category.allProducts || [];

  return (
    <div className="bg-[#FDFAF7]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-12 lg:px-20 xl:px-32 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-[#6B5E52] mb-6">
          <Link href="/" className="hover:text-[#9B7040] flex items-center transition-colors">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          {category.parent && (
            <>
              <Link href={`/${category.parent.slug}`} className="hover:text-[#9B7040] transition-colors">
                {category.parent.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-[#1C1917] font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm p-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1
                className="text-3xl font-bold text-[#1C1917]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {category.name}
              </h1>
              {category.parentId && (
                <span className="text-xs bg-[#F5EFE6] text-[#9B7040] px-3 py-1 rounded-full font-medium border border-[#E8DDD0]">
                  {category.parent?.name}
                </span>
              )}
            </div>
            {category.description && (
              <p className="text-[#6B5E52] mb-4 whitespace-pre-line">{category.description}</p>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {allProducts.length > 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-semibold text-[#1C1917]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Products in{" "}
                <span className="text-[#9B7040]">
                  {category.parent?.name} {category.name}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-[#C9A96E] mb-4" />
            <h3
              className="text-lg font-medium text-[#1C1917] mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              No Products Yet
            </h3>
            <p className="text-[#6B5E52]">There are no products in this category at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
