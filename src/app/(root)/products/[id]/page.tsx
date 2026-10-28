import Link from "next/link";
import { ChevronRight, Home, Box, MessageCircle } from "lucide-react";
import { getProductById, getRelatedProducts } from "@/actions/products";
import EnquireProductForm from "@/components/EnquireProductForm";
import ProductGallery, { type GalleryMedia } from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import { COLOUR_TRAITS, STYLE_TRAITS, productCode, productTraits } from "@/lib/productTraits";

const SITE_URL = "https://www.alfa-ventura.com";
const WHATSAPP_NUMBER = "14807915581";

type ProductDetail = {
  category: {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
    parent: { name: string; slug: string } | null;
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

/** Which visualizer surface a product can be previewed on, by category. */
const visualizerParam = (categoryName: string) => {
  if (/slab/i.test(categoryName)) return "countertop";
  if (/cabinet/i.test(categoryName)) return "cabinet";
  if (/floor/i.test(categoryName)) return "floor";
  return null;
};

const traitLabel = (id: string) => [...COLOUR_TRAITS, ...STYLE_TRAITS].find((t) => t.id === id)?.label ?? id;

const ProductDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  let prodRes;
  if (id) prodRes = await getProductById(id);

  if (!prodRes?.success || !prodRes.data) {
    return <div>Product not found</div>;
  }

  const product: ProductDetail = prodRes.data;
  const relatedRes = await getRelatedProducts(product.id, product.categoryId);
  const related = relatedRes.data ?? [];

  const media: GalleryMedia[] = [
    ...(product.images?.map((url) => ({ url, type: "image" as const })) || []),
    ...(product.videos?.map((url) => ({ url, type: "video" as const })) || []),
  ];

  const { category } = product;
  const categoryHref = category.parent ? `/${category.parent.slug}/${category.slug}` : `/${category.slug}`;
  const code = productCode(product.description);
  const traits = productTraits(product.title, product.description);
  const tags = [...traits.colours, ...traits.styles].map(traitLabel);
  const surface = visualizerParam(category.name);
  const whatsappText = encodeURIComponent(
    `Hi Alfa Ventura, I'm interested in ${product.title}${code ? ` (${code})` : ""}. ${SITE_URL}/products/${product.id}`
  );

  return (
    <div className="bg-[#FDFAF7] min-h-screen pb-24 md:pb-0">
      <div className="max-w-[1400px] mx-auto px-5 md:px-12 lg:px-20 xl:px-28 py-8 md:py-12">
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#6B5E52] mb-6 md:mb-8">
          <Link href="/" className="hover:text-[#9B7040] flex items-center transition-colors">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          {category.parent && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/${category.parent.slug}`} className="hover:text-[#9B7040] transition-colors">
                {category.parent.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <Link href={categoryHref} className="hover:text-[#9B7040] transition-colors">
            {category.name}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1C1917] font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 lg:gap-14">
          <ProductGallery media={media} title={product.title} />

          <div className="md:pt-2">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#9B7040]">{category.name}</span>
              {code && (
                <span className="text-xs font-semibold text-[#6B5E52] bg-[#F5EFE6] border border-[#E8DDD0] rounded-full px-2.5 py-0.5">
                  {code}
                </span>
              )}
              {product.isPremium && (
                <span className="bg-[#C9A96E] text-white text-xs font-semibold px-3 py-0.5 rounded-full">Premium</span>
              )}
            </div>

            <h1
              className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-[#1C1917] leading-tight tracking-tight mb-5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {product.title}
            </h1>

            <p className="text-[#6B5E52] whitespace-pre-line leading-relaxed">{product.description}</p>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {tags.map((t) => (
                  <span key={t} className="text-xs font-medium text-[#44403C] bg-white border border-[#E8DDD0] rounded-full px-3 py-1">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {product.isPremium && (
              <p className="mt-5 text-[#7A5520] p-4 rounded-xl border border-[#C9A96E]/40 bg-[#9B7040]/8 text-sm leading-relaxed">
                {product.title} from our Premium Series is crafted with superior materials and refined design, combining
                exclusive design, exceptional craftsmanship and enduring performance.
              </p>
            )}

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <EnquireProductForm
                product={product}
                variant="sample"
                showBack={false}
                triggerClassName="w-full h-12 rounded-xl bg-[#9B7040] hover:bg-[#7A5520] text-white font-bold"
              />
              <EnquireProductForm
                product={product}
                showBack={false}
                triggerClassName="w-full h-12 rounded-xl bg-[#1C1917] hover:bg-[#44403C] text-white font-bold"
              />
              {surface && (
                <Link
                  href={`/visualizer?${surface}=${product.id}`}
                  className="h-12 rounded-xl border border-[#E8DDD0] bg-white text-[#1C1917] font-semibold flex items-center justify-center gap-2 hover:border-[#9B7040] hover:text-[#9B7040] transition-colors"
                >
                  <Box className="w-4 h-4" />
                  See it in 3D Visualizer
                </Link>
              )}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 rounded-xl border border-[#E8DDD0] bg-white text-[#1C1917] font-semibold flex items-center justify-center gap-2 hover:border-[#25D366] hover:text-[#128C4A] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 md:mt-20">
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2
                className="text-2xl md:text-3xl font-bold text-[#1C1917] tracking-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                You may also like
              </h2>
              <Link href={categoryHref} className="text-sm font-semibold text-[#9B7040] hover:text-[#7A5520] shrink-0">
                View all {category.name} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile action bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#E8DDD0] bg-white/95 backdrop-blur px-4 py-3 grid grid-cols-2 gap-3">
        <EnquireProductForm
          product={product}
          variant="sample"
          showBack={false}
          triggerClassName="w-full h-11 rounded-xl bg-[#9B7040] hover:bg-[#7A5520] text-white font-bold"
        />
        <EnquireProductForm
          product={product}
          showBack={false}
          triggerClassName="w-full h-11 rounded-xl bg-[#1C1917] hover:bg-[#44403C] text-white font-bold"
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;
