"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Package, Layers, ExternalLink } from "lucide-react";

interface CategoryListProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
    subcategories: Array<{
      name: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      slug: string;
      description: string | null;
      imageUrl: string | null;
      parentId: string | null;
      _count: {
        products: number;
      };
    }>;
    _count: {
      products: number;
      subcategories: number;
    };
    createdAt: Date;
    updatedAt: Date;
  }>;
}

const CategoryList = ({ categories }: CategoryListProps) => {
  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const isMainCategory = !category.parentId;
        const hasSubcategories = category.subcategories.length > 0;

        return (
          <Card
            key={category.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                {/* Category Image */}
                <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={category.imageUrl || "/placeholder-category.jpg"}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/${category.slug}`}
                        className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {category.name}
                      </Link>
                      <Badge
                        variant={isMainCategory ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {isMainCategory ? "Main" : "Sub"}
                      </Badge>
                    </div>

                    <Link
                      href={`/${category.slug}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>

                  {category.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 whitespace-pre-line">{category.description}</p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      {category._count.products} products
                    </div>
                    {isMainCategory && hasSubcategories && (
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 mr-1" />
                        {category._count.subcategories} subcategories
                      </div>
                    )}
                  </div>

                  {/* Subcategories */}
                  {isMainCategory && hasSubcategories && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subcategories</div>
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/${sub.slug}`}
                            className="inline-flex items-center text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-2 py-1 rounded transition-colors"
                          >
                            {sub.name}
                            <span className="ml-1 text-gray-500">({sub._count.products})</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryList;
