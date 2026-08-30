import { getProductById } from "@/actions/products";
import EnquireProductForm from "@/components/EnquireProductForm";
import ProductMediaSlider from "@/components/ProductMediaSlider";
import Link from "next/link";

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
  // Same category match the Visualizer's own product source uses --
  // only quartz slab/design products are visualizable today.
  const isVisualizable = /slab|design/i.test(product.category?.name ?? "");

  const media = [
    ...(product.images?.map((url) => ({ url, type: "image" })) || []),
    ...(product.videos?.map((url) => ({ url, type: "video" })) || []),
  ];

  return (
    <div className="bg-[#FDFAF7] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-5 md:px-12 lg:px-20 xl:px-32 py-12">
        <h1
          className="text-3xl md:text-4xl font-bold text-[#1C1917] mb-8 text-center"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {product?.title}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <ProductMediaSlider media={media} />
          </div>

          <div className="my-auto">
            <h2
              className="text-2xl font-bold mb-4 flex items-center gap-2 text-[#1C1917]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Product Details
              {product.isPremium && (
                <span className="bg-[#C9A96E] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Premium
                </span>
              )}
            </h2>
            <p className="text-[#6B5E52] whitespace-pre-line leading-relaxed">{product?.description}</p>
            <br />
            {product?.isPremium && (
              <p className="text-[#7A5520] p-4 rounded-xl border border-[#C9A96E]/40 bg-[#9B7040]/8 text-sm leading-relaxed">
                {product?.title} from our Premium Series is crafted with superior materials and refined design. It offers a
                luxurious appearance with unmatched durability, making it the perfect choice for high-end interiors. Our Premium
                Series combines exclusive design, exceptional craftsmanship, and enduring performance, ensuring {product?.title}{" "}
                stands out as a statement of both style and substance.
              </p>
            )}
            {isVisualizable && (
              <div className="flex flex-wrap gap-3 mb-5">
                <Link
                  href={`/visualizer-v2?product=${product.id}`}
                  className="inline-block px-5 py-2.5 rounded-lg border border-[#9B7040] text-[#9B7040] text-sm font-semibold hover:bg-[#9B7040] hover:text-white transition-colors"
                >
                  Visualize in Your Space
                </Link>
                <Link
                  href={`/visualizer-v2?product=${product.id}&mode=image`}
                  className="inline-block px-5 py-2.5 rounded-lg border border-[#9B7040] text-[#9B7040] text-sm font-semibold hover:bg-[#9B7040] hover:text-white transition-colors"
                >
                  View in Your Own Photo
                </Link>
              </div>
            )}
            <p className="text-[#6B5E52] text-sm mt-5">
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
