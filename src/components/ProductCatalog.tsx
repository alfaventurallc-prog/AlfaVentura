"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import ProductCard from "./ProductCard";
import { COLOUR_TRAITS, STYLE_TRAITS, productTraits, type Trait } from "@/lib/productTraits";

interface CatalogProduct {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  isPremium?: boolean;
  createdAt: Date | string;
}

const PAGE_SIZE = 24;

type Sort = "newest" | "az" | "za";

/** Searchable, filterable product grid for category pages. Colour and style
 * tags come from productTraits; a chip only appears if it matches at least
 * one product in this category. */
const ProductCatalog = ({ products }: { products: CatalogProduct[] }) => {
  const [query, setQuery] = useState("");
  const [colours, setColours] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const tagged = useMemo(() => products.map((p) => ({ p, t: productTraits(p.title, p.description) })), [products]);

  const countFor = (kind: "colours" | "styles", id: string) => tagged.filter(({ t }) => t[kind].includes(id)).length;
  const availableColours = COLOUR_TRAITS.filter((c) => countFor("colours", c.id) > 0);
  const availableStyles = STYLE_TRAITS.filter((s) => countFor("styles", s.id) > 0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = tagged
      .filter(({ p, t }) => {
        if (q && !`${p.title} ${p.description ?? ""}`.toLowerCase().includes(q)) return false;
        if (colours.length && !colours.some((c) => t.colours.includes(c))) return false;
        if (styles.length && !styles.some((s) => t.styles.includes(s))) return false;
        return true;
      })
      .map(({ p }) => p);
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "za") list.sort((a, b) => b.title.localeCompare(a.title));
    return list;
  }, [tagged, query, colours, styles, sort]);

  const toggle = (list: string[], set: (v: string[]) => void, id: string) => {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    setVisible(PAGE_SIZE);
  };
  const hasFilters = !!query || colours.length > 0 || styles.length > 0;
  const clearAll = () => {
    setQuery("");
    setColours([]);
    setStyles([]);
    setVisible(PAGE_SIZE);
  };

  const chipRow = (label: string, traits: Trait[], selected: string[], set: (v: string[]) => void, kind: "colours" | "styles") =>
    traits.length > 1 && (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[#A8987F] w-14 shrink-0">{label}</span>
        {traits.map((t) => {
          const on = selected.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(selected, set, t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-200 ${
                on
                  ? "bg-[#1C1917] text-white border-[#1C1917]"
                  : "bg-white text-[#44403C] border-[#E8DDD0] hover:border-[#9B7040] hover:text-[#9B7040]"
              }`}
            >
              {t.label} <span className={on ? "text-white/60" : "text-[#A8A29E]"}>{countFor(kind, t.id)}</span>
            </button>
          );
        })}
      </div>
    );

  return (
    <div>
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search by name or code..."
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#E8DDD0] bg-white text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9B7040] focus:ring-2 focus:ring-[#9B7040]/15"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sort products"
            className="h-11 px-3 rounded-xl border border-[#E8DDD0] bg-white text-sm text-[#1C1917] focus:outline-none focus:border-[#9B7040]"
          >
            <option value="newest">Newest first</option>
            <option value="az">Name A–Z</option>
            <option value="za">Name Z–A</option>
          </select>
        </div>
        {chipRow("Colour", availableColours, colours, setColours, "colours")}
        {chipRow("Style", availableStyles, styles, setStyles, "styles")}
        <div className="flex items-center justify-between text-sm text-[#6B5E52]">
          <span>
            Showing <strong className="text-[#1C1917]">{Math.min(visible, results.length)}</strong> of{" "}
            <strong className="text-[#1C1917]">{results.length}</strong> {results.length === 1 ? "design" : "designs"}
          </span>
          {hasFilters && (
            <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 font-semibold text-[#9B7040] hover:text-[#7A5520]">
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="text-center text-[#6B5E52] py-12">No designs match these filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.slice(0, visible).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {visible < results.length && (
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-6 h-11 rounded-xl border border-[#E8DDD0] bg-white text-sm font-semibold text-[#1C1917] hover:border-[#9B7040] hover:text-[#9B7040] transition-colors"
          >
            Show more ({results.length - visible} left)
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
