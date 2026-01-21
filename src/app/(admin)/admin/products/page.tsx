import { getCategories } from "@/actions/categories";
import { getProducts } from "@/actions/products";
import ProductSection from "@/components/admin/ProductSection";
import { Plus } from "lucide-react";
import Link from "next/link";

const ProductsPage = async () => {
  const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);

  if (!prodRes.success || !catRes.success) {
    return <div className="mt-4 text-red-600">Failed to load products or categories</div>;
  }

  const products = prodRes.data?.products ?? [];
  const categories = catRes.data?.categories ?? [];

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </Link>
      </div>

      {products.length ? (
        <ProductSection
          products={products ?? []}
          categories={categories ?? []}
        />
      ) : (
        <div className="mt-4 text-gray-600">No products found</div>
      )}
    </div>
  );
};

export default ProductsPage;
