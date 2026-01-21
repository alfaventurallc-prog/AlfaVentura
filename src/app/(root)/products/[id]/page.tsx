import { getProductById } from "@/actions/products";
import EnquireProductForm from "@/components/EnquireProductForm";
import ProductMediaSlider from "@/components/ProductMediaSlider";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

type ProductDetail = {
  category: {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    description: string | null;
    imageUrl: string | null;
  };
  id: string;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  title: string;
  description: string | null;
  categoryId: string;
  isPremium: boolean;
  images: string[];
  videos: string[];
};

const ProductDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  let prodRes;
  if (id) prodRes = await getProductById(id);

  if (!prodRes?.success || !prodRes.data) {
    return <div>Product not found</div>;
  }

  const product: ProductDetail = prodRes.data;

  const media = [
    ...(product.images?.map((url) => ({ url, type: "image" })) || []),
    ...(product.videos?.map((url) => ({ url, type: "video" })) || []),
  ];

  return (
    <div>
      <Image
        src="/product-hero-bg.jpg"
        alt="Hero Product Bg"
        width={500}
        height={500}
        className="object-cover w-full h-12 md:h-40"
      />
      <div className="p-5 pt-10 md:p-20 md:pt-10">
        <h1 className="text-4xl font-bold text-center">{product?.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
          <div>
            <ProductMediaSlider media={media} />
          </div>

          <div className="my-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              Product Details
              {product.isPremium && (
                <div className="bg-[#FFD700] text-white text-xs font-semibold px-2 py-1 rounded z-10 flex items-center justify-center gap-1">
                  Premium
                  <FaStar />
                </div>
              )}
            </h2>
            <p className="text-gray-700 text-justify whitespace-pre-line">{product?.description}</p>
            <br />
            {product?.isPremium && (
              <p className="text-fuchsia-800 text-justify p-2 rounded border border-fuchsia-300 bg-fuchsia-200">
                {product?.title} from our Premium Series is crafted with superior materials and refined design. It offers a
                luxurious appearance with unmatched durability, making it the perfect choice for high-end interiors. Our Premium
                Series combines exclusive design, exceptional craftsmanship, and enduring performance, ensuring {product?.title}{" "}
                stands out as a statement of both style and substance.
              </p>
            )}
            <p className="text-gray-500 text-sm mt-4">
              Want to know more about this product? Click the button below to get in touch with us!
            </p>
            <EnquireProductForm product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
