import { getProductById } from "@/actions/products";
import ProductForm from "@/components/admin/ProductForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const UpdateProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  if (!id) return <div>Loading...</div>;

  let prodRes;
  if (id) prodRes = await getProductById(id);

  if (!prodRes?.success) {
    return <div className="mt-4 text-red-600">Failed to load product</div>;
  }

  const product = prodRes.data;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList className="text-2xl font-bold">
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold">Update Product</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProductForm
        type="edit"
        productData={product}
      />
    </div>
  );
};

export default UpdateProductPage;
