import ProductForm from "@/components/admin/ProductForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const NewProductPage = () => {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList className="text-2xl font-bold">
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold">Create Product</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProductForm type="create" />
    </div>
  );
};

export default NewProductPage;
