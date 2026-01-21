"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Package, Layers } from "lucide-react";

interface CategoryCardProps {
  category: {
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
  };
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const isMainCategory = !category.parentId;
  const hasSubcategories = category.subcategories.length > 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        {/* Category Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={category.imageUrl || "/placeholder-category.jpg"}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Category Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={isMainCategory ? "default" : "secondary"}>{isMainCategory ? "Main Category" : "Subcategory"}</Badge>
          </div>

          {/* Quick Stats */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white flex items-center">
              <Package className="h-3 w-3 mr-1" />
              {category._count.products}
            </div>
            {isMainCategory && hasSubcategories && (
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white flex items-center">
                <Layers className="h-3 w-3 mr-1" />
                {category._count.subcategories}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <Link
            href={`/${category.slug}`}
            className="group"
          >
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2 flex items-center">
              {category.name}
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </h3>
          </Link>

          {category.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2 whitespace-pre-line">{category.description}</p>
          )}

          {/* Subcategories Preview */}
          {isMainCategory && hasSubcategories && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subcategories</div>
              <div className="flex flex-wrap gap-1">
                {category.subcategories.slice(0, 3).map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/${sub.slug}`}
                    className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-2 py-1 rounded transition-colors"
                  >
                    {sub.name}
                  </Link>
                ))}
                {category.subcategories.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-1">+{category.subcategories.length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default CategoryCard;
