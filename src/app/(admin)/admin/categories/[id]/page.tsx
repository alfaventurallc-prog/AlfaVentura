import { getCategoryById } from "@/actions/categories";
import CategoryForm from "@/components/admin/CategoryForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const UpdateCategoryPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  let catRes;
  if (id) catRes = await getCategoryById(id);

  if (!catRes?.success) {
    return <div className="mt-4 text-red-600">Failed to load category</div>;
  }

  const category = catRes.data;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList className="text-2xl font-bold">
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/categories">Categories</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold">Update Category</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CategoryForm
        type="edit"
        categoryData={category}
      />
    </div>
  );
};

export default UpdateCategoryPage;
