"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Grid3X3, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CategoryCard from "./CategoryCard";
import CategoryGrid from "./CategoryGrid";
import CategoryList from "./CategoryList";

interface Category {
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
}

interface AllProductsContentProps {
  categories: Category[];
}

const AllProductsContent = ({ categories }: AllProductsContentProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<"all" | "main" | "sub">("all");
  const [sortBy, setSortBy] = useState<"name" | "products" | "subcategories">("name");

  const filteredCategories = categories
    .filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === "all" ||
        (filterType === "main" && !category.parentId) ||
        (filterType === "sub" && category.parentId);

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "products":
          return b._count.products - a._count.products;
        case "subcategories":
          return b._count.subcategories - a._count.subcategories;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const mainCategories = filteredCategories.filter((cat) => !cat.parentId);
  const totalProducts = categories.reduce((sum, cat) => sum + cat._count.products, 0);

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-12 lg:px-20 xl:px-32 py-10">
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#E8DDD0] shadow-sm p-5 text-center">
          <div className="text-2xl font-bold text-[#9B7040]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{categories.length}</div>
          <div className="text-xs text-[#6B5E52] mt-1 font-medium uppercase tracking-wide">Total Categories</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8DDD0] shadow-sm p-5 text-center">
          <div className="text-2xl font-bold text-[#9B7040]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{mainCategories.length}</div>
          <div className="text-xs text-[#6B5E52] mt-1 font-medium uppercase tracking-wide">Main Categories</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8DDD0] shadow-sm p-5 text-center">
          <div className="text-2xl font-bold text-[#9B7040]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {categories.reduce((sum, cat) => sum + cat._count.subcategories, 0)}
          </div>
          <div className="text-xs text-[#6B5E52] mt-1 font-medium uppercase tracking-wide">Subcategories</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8DDD0] shadow-sm p-5 text-center">
          <div className="text-2xl font-bold text-[#9B7040]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{totalProducts}</div>
          <div className="text-xs text-[#6B5E52] mt-1 font-medium uppercase tracking-wide">Total Products</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl border border-[#E8DDD0] shadow-sm p-5 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={filterType}
              onValueChange={(value: any) => setFilterType(value)}
            >
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="main">Main Categories</SelectItem>
                <SelectItem value="sub">Subcategories</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: any) => setSortBy(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="products">Sort by Products</SelectItem>
                <SelectItem value="subcategories">Sort by Subcategories</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-[#E8DDD0] overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-none ${viewMode === "grid" ? "bg-[#9B7040] text-white hover:bg-[#7A5520]" : ""}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`rounded-none ${viewMode === "list" ? "bg-[#9B7040] text-white hover:bg-[#7A5520]" : ""}`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {searchTerm && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1"
            >
              Search: {searchTerm}
              <button
                onClick={() => setSearchTerm("")}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
          {filterType !== "all" && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1"
            >
              Type: {filterType === "main" ? "Main Categories" : "Subcategories"}
              <button
                onClick={() => setFilterType("all")}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#1C1917]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{filteredCategories.length} Categories Found</h2>
        <div className="text-sm text-[#6B5E52]">
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      </div>

      {/* Categories Display */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      ) : viewMode === "grid" ? (
        <CategoryGrid categories={filteredCategories} />
      ) : (
        <CategoryList categories={filteredCategories} />
      )}
    </div>
  );
};

export default AllProductsContent;
