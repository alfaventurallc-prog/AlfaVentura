"use client";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Search, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button, buttonVariants } from "../ui/button";
import { toast } from "sonner";
import LoadingSpinner from "../LoadingSpinner";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { deleteCategory } from "@/actions/categories";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "nextjs-toploader/app";

interface CategoryWithParent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  parent: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    products: number;
    subcategories: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface CategoriesSectionProps {
  categories: CategoryWithParent[];
  pagination: PaginationData | null;
  currentSearch: string;
}

export const CategoriesSection = ({ categories, pagination, currentSearch }: CategoriesSectionProps) => {
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to first page on search
    router.push(`/admin/categories?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/admin/categories?${params.toString()}`);
  };

  const handleLimitChange = (limit: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", limit);
    params.set("page", "1"); // Reset to first page on limit change
    router.push(`/admin/categories?${params.toString()}`);
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      try {
        setLoading(true);
        const res = await deleteCategory(id);
        if (!res.success) {
          toast.error(res.error || "Failed to delete category");
        } else {
          toast.success("Category deleted successfully");
          router.refresh();
        }
      } catch (error: any) {
        console.error("Failed to delete category:", error);
        toast.error("Failed to delete category");
      } finally {
        setLoading(false);
      }
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== currentSearch) {
        handleSearch(searchTerm);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="mt-5 flex flex-col gap-7 relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}

      {/* Search and Pagination Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search categories..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select
              value={pagination?.limit.toString() || "10"}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pagination && (
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount}
            </div>
          )}
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Subcategories</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {category.imageUrl && (
                        <Image
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                          src={category.imageUrl}
                          alt={category.name}
                          width={40}
                          height={40}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {category.parentId && <ChevronRight className="h-4 w-4 text-gray-400 mr-1" />}
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-sm text-gray-500 w-32 line-clamp-1">{category.description}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.parentId ? "secondary" : "default"}>
                      {category.parentId ? "Subcategory" : "Main Category"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {category.parent ? (
                      <Link
                        href={`/admin/categories/${category.parent.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {category.parent.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>{category._count?.products || 0}</TableCell>
                  <TableCell>
                    {category.parentId ? <span className="text-gray-400 text-sm">-</span> : category._count?.subcategories || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className={`!text-blue-600 hover:text-blue-900 bg-transparent hover:!bg-blue-100 ${buttonVariants({
                          variant: "ghost",
                          size: "sm",
                        })}`}
                      >
                        <Edit size={16} />
                      </Link>
                      <Button
                        onClick={() => handleDelete(category.id, category.name)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;

                if (pageNum > pagination.totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
