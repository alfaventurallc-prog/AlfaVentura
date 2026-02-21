"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { NAV_LINKS } from "../constants";
import { usePathname } from "next/navigation";
import { getCategories } from "@/actions/categories";
import LoadingSpinner from "./LoadingSpinner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  _count?: { products: number };
}

interface CategoryWithSubcategories {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
  _count: { products: number; subcategories: number };
}

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [productsOpen, setProductsOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCategories({ includeSubcategories: true });
        if (res.success && res.data) setCategories(res.data.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-products-trigger]")) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav
        className={`w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_#E8DDD0,0_4px_20px_rgba(0,0,0,0.06)]"
            : "bg-white/90 backdrop-blur-sm border-b border-[#E8DDD0]"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 xl:px-16 flex items-center justify-between h-[68px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/new_logo2.png"
              alt="Alfa Ventura"
              width={52}
              height={52}
              className="object-contain"
            />
            <span
              className="text-[#9B7040] text-xl font-bold tracking-tight leading-none"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Alfa Ventura
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                    isActive(link.href)
                      ? "text-[#9B7040] bg-[#9B7040]/8"
                      : "text-[#44403C] hover:text-[#9B7040] hover:bg-[#9B7040]/6"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#9B7040]" />
                  )}
                </Link>
              </li>
            ))}

            {/* Products dropdown */}
            <li className="relative" data-products-trigger>
              <button
                onClick={() => setProductsOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                  productsOpen
                    ? "text-[#9B7040] bg-[#9B7040]/8"
                    : "text-[#44403C] hover:text-[#9B7040] hover:bg-[#9B7040]/6"
                }`}
                data-products-trigger
              >
                Products
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${productsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {productsOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E8DDD0] py-2 z-50 animate-fade-in"
                  data-products-trigger
                >
                  {loading ? (
                    <div className="p-4 flex justify-center">
                      <LoadingSpinner />
                    </div>
                  ) : categories.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category.id}>
                          <Link
                            href={`/${category.slug}`}
                            onClick={() => setProductsOpen(false)}
                            className={`flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[#F5EFE6] hover:text-[#9B7040] ${
                              pathname === `/${category.slug}` ? "text-[#9B7040] bg-[#F5EFE6]" : "text-[#292524]"
                            }`}
                          >
                            {category.name}
                          </Link>
                          {category.subcategories.length > 0 && (
                            <div className="ml-4 border-l border-[#E8DDD0] pl-3 mb-1">
                              {category.subcategories.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/${category.slug}/${sub.slug}`}
                                  onClick={() => setProductsOpen(false)}
                                  className={`block px-3 py-2 text-xs font-medium rounded-md transition-colors hover:bg-[#F5EFE6] hover:text-[#9B7040] ${
                                    pathname === `/${category.slug}/${sub.slug}` ? "text-[#9B7040]" : "text-[#78716C]"
                                  }`}
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-3 text-sm text-[#A8A29E]">No categories available</p>
                  )}
                </div>
              )}
            </li>
          </ul>

          {/* CTA + Mobile hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden lg:inline-flex btn-primary text-sm px-5 py-2.5"
            >
              Get a Quote
            </Link>

            <button
              className="lg:hidden p-2 rounded-lg text-[#44403C] hover:bg-[#F5EFE6] transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-[300px] max-w-[90vw] h-full bg-white shadow-2xl flex flex-col animate-slideleft overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD0]">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Image src="/new_logo.png" alt="Alfa Ventura" width={140} height={50} className="object-contain" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F5EFE6] transition-colors"
              >
                <X className="w-5 h-5 text-[#44403C]" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex flex-col px-4 pt-4 pb-6 gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(link.href)
                      ? "bg-[#F5EFE6] text-[#9B7040]"
                      : "text-[#44403C] hover:bg-[#F5EFE6] hover:text-[#9B7040]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <Accordion type="multiple" className="w-full">
                <AccordionItem value="products" className="border-none">
                  <AccordionTrigger className="px-4 py-3 rounded-xl text-sm font-semibold text-[#44403C] hover:bg-[#F5EFE6] hover:text-[#9B7040] hover:no-underline transition-colors [&[data-state=open]]:text-[#9B7040] [&[data-state=open]]:bg-[#F5EFE6]">
                    Products
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    {loading ? (
                      <div className="p-4 flex justify-center"><LoadingSpinner /></div>
                    ) : categories.length > 0 ? (
                      <div className="border-l-2 border-[#E8DDD0] ml-4 pl-3 space-y-1 mt-1">
                        {categories.map((category) => (
                          <div key={category.id}>
                            {category.subcategories.length === 0 ? (
                              <Link
                                href={`/${category.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 text-sm font-semibold text-[#44403C] hover:text-[#9B7040] rounded-lg transition-colors"
                              >
                                {category.name}
                              </Link>
                            ) : (
                              <Accordion type="single" collapsible>
                                <AccordionItem value={`cat-${category.id}`} className="border-none">
                                  <AccordionTrigger className="px-3 py-2 text-sm font-semibold text-[#44403C] hover:text-[#9B7040] hover:no-underline rounded-lg">
                                    {category.name}
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="border-l-2 border-[#E8DDD0] ml-3 pl-3 space-y-1">
                                      {category.subcategories.map((sub) => (
                                        <Link
                                          key={sub.id}
                                          href={`/${category.slug}/${sub.slug}`}
                                          onClick={() => setMobileMenuOpen(false)}
                                          className="block px-2 py-1.5 text-xs font-medium text-[#78716C] hover:text-[#9B7040] rounded transition-colors"
                                        >
                                          {sub.name}
                                        </Link>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="px-4 py-2 text-sm text-[#A8A29E]">No categories found.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="pt-4 mt-2 border-t border-[#E8DDD0]">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full justify-center text-sm py-3"
                >
                  Get a Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
