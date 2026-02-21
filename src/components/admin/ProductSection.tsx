"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Category, Product } from "../../../types";
import { Button, buttonVariants } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import LoadingSpinner from "../LoadingSpinner";
import Image from "next/image";
import { deleteProduct } from "@/actions/products";
import { Badge } from "../ui/badge";
import { useRouter } from "nextjs-toploader/app";

const ProductSection = ({ products, categories }: { products: Product[]; categories: Category[] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        const matchesSearch =
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  const handleDelete = async (productId: string) => {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (confirmed) {
      try {
        setLoading(true);
        const res = await deleteProduct(productId);
        if (res.success) {
          toast.success("Product deleted successfully");
          router.refresh();
        } else {
          toast.error(res.error || "Failed to delete product");
        }
      } catch (error: any) {
        console.error("Failed to delete product:", error);
        toast.error(error.response?.data?.error || "Failed to delete product");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="mt-5 flex flex-col gap-7">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10 py-2 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          defaultValue="all"
          onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Array.isArray(categories) &&
              categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Premium Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                        width={64}
                        height={64}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md mr-4">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.title}</div>
                      <div className="text-sm text-gray-500 w-20 line-clamp-1">{product.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.category!.name}</TableCell>
                <TableCell>
                  <Badge variant={product.isPremium ? "default" : "secondary"}>{product.isPremium ? "Premium" : "Normal"}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className={`!text-blue-600 hover:text-blue-900 bg-transparent hover:!bg-blue-200 ${buttonVariants()}`}
                    >
                      <Edit size={16} />
                    </Link>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900 hover:bg-red-200 bg-transparent"
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
  );
};

export default ProductSection;
