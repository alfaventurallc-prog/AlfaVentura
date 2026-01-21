import { getAllCategoriesFlat } from "@/actions/categories";
import { CategoriesSection } from "@/components/admin/CategoriesSection";
import { Plus } from "lucide-react";
import Link from "next/link";

interface CategoriesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

const CategoriesPage = async ({ searchParams }: CategoriesPageProps) => {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const limit = Number(resolvedSearchParams.limit) || 10;
  const search = resolvedSearchParams.search || "";

  const res = await getAllCategoriesFlat({
    page,
    limit,
    search,
  });

  if (!res.success) {
    return <div className="mt-4 text-red-600">Failed to load categories</div>;
  }

  const { categories, pagination } = res.data || { categories: [], pagination: null };

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage your product categories and subcategories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Category</span>
        </Link>
      </div>
      {categories.length === 0 ? (
        <div className="mt-4 text-gray-600">No categories found</div>
      ) : (
        <CategoriesSection
          categories={categories}
          pagination={pagination}
          currentSearch={search}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
