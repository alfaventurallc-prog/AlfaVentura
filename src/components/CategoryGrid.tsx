"use client";

import CategoryCard from "./CategoryCard";

interface CategoryGridProps {
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

const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
        />
      ))}
    </div>
  );
};

export default CategoryGrid;
