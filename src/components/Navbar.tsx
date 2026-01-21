"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, ChevronRight, XIcon } from "lucide-react";
import { NAV_LINKS } from "../constants";
import { usePathname } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { FaAngleDown } from "react-icons/fa";
import { getCategories } from "@/actions/categories";
import LoadingSpinner from "./LoadingSpinner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CategoryWithSubcategories {
  id: string;
  name: string;
  slug: string;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
    _count?: {
      products: number;
    };
  }>;
  _count: {
    products: number;
    subcategories: number;
  };
}

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

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

  return (
    <nav className="z-30 py-1 px-2 pr-4 md:px-20 flex items-center justify-between bg-white animate-slidedown shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
      <div>
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <Image
            src="/new_logo2.png"
            alt="Company logo"
            width={80}
            height={140}
            className="object-contain"
          />
          <span className="text-[#ae8055] text-4xl tracking-tight font-semibold">Alfa Ventura</span>
        </Link>
      </div>

      <div className="hidden lg:flex gap-12 absolute left-1/2 -translate-x-1/2">
        {NAV_LINKS.map((link) => (
          <div key={link.key}>
            <Link
              href={link.href}
              className={`regular-16 text-gray-900 !font-bold transition-all hover:text-blue-900 ${
                pathname === link.href && "underline"
              }`}
            >
              {link.label}
            </Link>
          </div>
        ))}
        <div>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-3 font-bold">
                Products
                <FaAngleDown />
              </TooltipTrigger>
              <TooltipContent
                align="center"
                sideOffset={15}
                className="flex flex-col p-5 bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] max-w-sm"
              >
                {loading ? (
                  <div className="p-4 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : categories.length > 0 ? (
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="group"
                      >
                        {!category.subcategories.length ? (
                          <Link
                            href={`/${category.slug}`}
                            className={`block p-2 text-black font-semibold transition-all text-sm hover:text-blue-900 hover:bg-blue-50 rounded ${
                              pathname === `/${category.slug}` ? "text-blue-900 bg-blue-50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{category.name}</span>
                            </div>
                          </Link>
                        ) : (
                          <Link
                            href={`/${category.slug}`}
                            className={`block p-2 text-black font-semibold transition-all text-sm hover:bg-blue-50 hover:text-blue-700 rounded ${
                              pathname === `/${category.slug}` ? "text-blue-700 bg-blue-50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{category.name}</span>
                            </div>
                          </Link>
                        )}

                        {/* Subcategories */}
                        {category.subcategories.length > 0 && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                            {category.subcategories.map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                href={`/${category.slug}/${subcategory.slug}`}
                                className={`block p-1.5 text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded transition-all ${
                                  pathname === `/${subcategory.slug}` ? "text-blue-700 bg-blue-50" : ""
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span>{subcategory.name}</span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm p-2">No categories available</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Drawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        direction="left"
      >
        <DrawerTrigger className="md:hidden">
          <Menu className="w-6 h-6 text-gray-900" />
        </DrawerTrigger>
        <DrawerContent className="h-full w-[20rem]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center justify-between">
              <Link href="/">
                <Image
                  src="/new_logo.png"
                  alt="Company logo"
                  width={230}
                  height={150}
                  className="object-contain"
                />
              </Link>
              <XIcon
                className="w-6 h-6 text-gray-900 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              />
            </DrawerTitle>
          </DrawerHeader>
          <hr />
          <div className="flex flex-col gap-3 mt-4 px-4">
            {NAV_LINKS.map((link) => (
              <div key={link.key}>
                <Link
                  href={link.href}
                  className={`regular-16 text-gray-900 !font-bold transition-all hover:text-blue-900 ${
                    pathname === link.href && "underline"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </div>
            ))}
            <Accordion type="multiple">
              <AccordionItem value="item-1">
                <AccordionTrigger className="regular-16 text-gray-900 !font-bold transition-all hover:text-blue-900">
                  Products
                </AccordionTrigger>
                <AccordionContent className="border-l ml-5">
                  {loading ? (
                    <div className="p-4 flex items-center justify-center">
                      <LoadingSpinner />
                    </div>
                  ) : categories.length > 0 ? (
                    <div className="space-y-3 mt-2">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="group pl-4"
                        >
                          {!category.subcategories.length ? (
                            <Link
                              href={`/${category.slug}`}
                              className={`regular-16 text-gray-900 !font-bold transition-all ${
                                category.id === activeCategory ? "bg-blue-50" : ""
                              }`}
                              onClick={() => {
                                setActiveCategory(category.id);
                                setMobileMenuOpen(false);
                              }}
                            >
                              {category.name}
                            </Link>
                          ) : (
                            <Accordion
                              type="single"
                              collapsible
                            >
                              <AccordionItem value={`item-${category.id}`}>
                                <AccordionTrigger className="text-black font-semibold transition-all text-sm rounded ">
                                  {category.name}
                                </AccordionTrigger>
                                <AccordionContent>
                                  {category.subcategories.map((subcategory) => (
                                    <Link
                                      key={subcategory.id}
                                      href={`/${category.slug}/${subcategory.slug}`}
                                      className={`block p-2 text-black font-semibold transition-all text-sm rounded ${
                                        subcategory.id === activeSubcategory ? "bg-blue-50" : ""
                                      }`}
                                      onClick={() => {
                                        setActiveSubcategory(subcategory.id);
                                        setMobileMenuOpen(false);
                                      }}
                                    >
                                      {subcategory.name}
                                    </Link>
                                  ))}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">No categories found.</div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  );
};

export default Navbar;
