import { getCategoryBySlug } from "@/actions/categories";
import { ChevronRight, Home, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

const ProductsPage = async ({ params }: { params: Promise<{ categorySlug: string }> }) => {
  const { categorySlug } = await params;

  const categoryResponse = await getCategoryBySlug(categorySlug);

  if (!categoryResponse?.success) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1C1917]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Category Not Found</h1>
          <p className="text-[#6B5E52] mt-2">No category found for: {categorySlug}</p>
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
          <p className="text-[#6B5E52] mt-2">No category found for: {categorySlug}</p>
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
          <Link
            href="/"
            className="hover:text-[#9B7040] flex items-center transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />

          {category.parent && (
            <>
              <Link
                href={`/${category.parent.slug}`}
                className="hover:text-[#9B7040] transition-colors"
              >
                {category.parent.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}

          <span className="text-[#1C1917] font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1
                  className="text-3xl font-bold text-[#1C1917]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {category.parentId ? category.parent?.name + " > " + category.name : category.name}
                </h1>
              </div>

              {category.description && (
                <p className="text-[#6B5E52] mb-4 whitespace-pre-line">{category.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Subcategories (if any) */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm p-6 mb-8">
            <h2
              className="text-xl font-semibold text-[#1C1917] mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Categories under <span className="text-[#9B7040]">{category.name}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.subcategories.map((subcategory) => (
                <Link
                  href={`/${category.slug}/${subcategory.slug}`}
                  key={subcategory.id}
                  className="group hover:-translate-y-1 transition-all"
                >
                  <div className="bg-white rounded-xl border border-[#E8DDD0] overflow-hidden hover:shadow-[0_8px_28px_rgba(155,112,64,0.15)] transition-shadow">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={subcategory.imageUrl!}
                        alt={subcategory.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                        priority
                      />
                    </div>
                    <div className="p-4">
                      <h3
                        className="text-base font-semibold text-[#1C1917] mb-1 group-hover:text-[#9B7040] transition-colors"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {subcategory.name}
                      </h3>
                      {subcategory.description && (
                        <p className="text-sm text-[#6B5E52] line-clamp-2 whitespace-pre-line">{subcategory.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!category.subcategories.length &&
          (allProducts.length > 0 ? (
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
                  <div
                    key={product.id}
                    className="group transition-all hover:-translate-y-1"
                  >
                    <Link href={`/products/${product.id}`}>
                      <div
                        className={`bg-white relative rounded-xl border overflow-hidden border-[#E8DDD0] hover:shadow-[0_8px_28px_rgba(155,112,64,0.15)] transition-shadow ${
                          product.isPremium ? "ring-2 ring-[#C9A96E]" : ""
                        }`}
                      >
                        {product.isPremium && (
                          <div className="absolute top-2 right-2 bg-[#C9A96E] text-white text-xs font-semibold px-2 py-1 rounded-full z-10 flex items-center gap-1">
                            Premium
                          </div>
                        )}
                        {product.images && product.images.length > 0 && (
                          <div className="relative w-full h-64 overflow-hidden">
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3
                            className="text-base font-semibold text-[#1C1917] mb-1"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          >
                            {product.title}
                          </h3>
                          {product.description && (
                            <p className="text-sm text-[#6B5E52] line-clamp-2 whitespace-pre-line">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
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
          ))}
      </div>
    </div>
  );
};

export default ProductsPage;
