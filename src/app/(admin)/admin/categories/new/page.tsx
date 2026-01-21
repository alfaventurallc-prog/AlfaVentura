import CategoryForm from "@/components/admin/CategoryForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const NewCategoriesPage = () => {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList className="text-2xl font-bold">
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/categories">Categories</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold">Create Category</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CategoryForm type="create" />
    </div>
  );
};

export default NewCategoriesPage;
