import { getCategoryBySlug } from "@/actions/categories";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Home, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

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
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Category Not Found</h1>
        <p className="text-gray-600 mt-2">No category found for: {subCategorySlug}</p>
        <Link
          href="/"
          className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  const category = categoryResponse.data;

  if (!category) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Category Not Found</h1>
        <p className="text-gray-600 mt-2">No category found for: {subCategorySlug}</p>
        <Link
          href="/"
          className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  const allProducts = category.allProducts || [];

  return (
    <div className="bg-gray-100">
      {/* Header Image */}
      {/* {category.imageUrl && (
        <Image
          src="/product-hero-bg.jpg"
          alt="Hero Product Bg"
          width={500}
          height={500}
          className="object-cover w-full h-12 md:h-40"
        />
      )} */}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link
            href="/"
            className="hover:text-blue-600 flex items-center"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />

          {category.parent && (
            <>
              <Link
                href={`/${category.parent.slug}`}
                className="hover:text-blue-600"
              >
                {category.parent.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}

          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 animate-slidedown">
          {/* <div className="flex items-start justify-between"> */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              {category.parentId && <Badge variant="secondary">{category.parent?.name}</Badge>}
            </div>

            {category.description && (
              <p className="text-gray-600 text-justify mb-4 whitespace-pre-line">{category.description}</p>
            )}
            {/* </div> */}
          </div>
        </div>

        {/* Products Grid */}
        {allProducts.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-slideup">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                All Products in <br className="block md:hidden" />
                <span className="bg-alfa-primary text-white px-1">
                  {category.parent?.name} {category.name}
                </span>
              </h2>
            </div>
            {/* <FocusCards cards={allProducts} /> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProducts.map((product) => (
                <div
                  key={product.id}
                  className="group transition-all hover:-translate-y-2"
                >
                  <Link href={`/products/${product.id}`}>
                    <div
                      className={`bg-white relative rounded-lg shadow-sm border overflow-hidden border-gray-200 hover:shadow-lg transition-shadow ${
                        product.isPremium ? "ring-4 ring-[#FFD700]" : ""
                      }`}
                    >
                      {product.isPremium && (
                        <div className="absolute top-2 right-2 bg-[#FFD700] text-black text-xs font-semibold px-2 py-1 rounded z-10 flex items-center justify-center gap-1">
                          Premium
                          <FaStar />
                        </div>
                      )}
                      {product.images && product.images.length > 0 && (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          width={300}
                          height={300}
                          className="w-full h-72 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{product.title}</h3>
                        {product.description && (
                          <p className="text-sm text-justify text-gray-600 line-clamp-2 whitespace-pre-line">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center animate-slideup">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Yet</h3>
            <p className="text-gray-600">There are no products in this category at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
