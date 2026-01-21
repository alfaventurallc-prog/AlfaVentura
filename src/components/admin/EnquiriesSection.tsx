"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { IoEye } from "react-icons/io5";
import { toast } from "sonner";
import { Category, Enquiry } from "../../../types";
import LoadingSpinner from "../LoadingSpinner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { deleteEnquiry } from "@/actions/enquiries";
import { useRouter } from "nextjs-toploader/app";

const EnquiriesSection = ({ enquiries, categories }: { enquiries: Enquiry[]; categories: Category[] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filteredEnquiries = Array.isArray(enquiries)
    ? enquiries.filter((enquiry) => {
        const matchesSearch =
          enquiry.product!.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enquiry.product!.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || enquiry.product!.category?.id === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this enquiry?")) {
      try {
        setLoading(true);
        const res = await deleteEnquiry(id);
        if (!res.success) {
          toast.error(res.error || "Failed to delete enquiry");
        } else {
          toast.success("Enquiry deleted successfully");
          router.refresh();
        }
      } catch (error: any) {
        console.error("Failed to delete Enquiry:", error);
        toast.error(error.response?.data?.error || "Failed to delete Enquiry");
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
            placeholder="Search enquiries..."
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

      {/* Categories Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Name of Person</TableHead>
                <TableHead>Email of Person</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell>{enquiry.product!.category?.name}</TableCell>
                  <TableCell>{enquiry.product!.title}</TableCell>
                  <TableCell>{enquiry.name}</TableCell>
                  <TableCell>{enquiry.email}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                        >
                          <IoEye />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Enquiry for {enquiry.product!.title}</DialogTitle>
                        </DialogHeader>
                        <hr className="my-1" />
                        <DialogDescription asChild>
                          <div className="grid grid-cols-2 gap-4">
                            <p>
                              <strong>Product:</strong> {enquiry.product!.title}
                            </p>
                            <p>
                              <strong>Category:</strong> {enquiry.product!.category?.name}
                            </p>
                            <p>
                              <strong>Name of enquirer:</strong> {enquiry.name}
                            </p>
                            <p>
                              <strong>Email of enquirer:</strong> {enquiry.email}
                            </p>
                            <p className="col-span-2">
                              <strong>Message:</strong> {enquiry.message}
                            </p>
                          </div>
                        </DialogDescription>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => handleDelete(enquiry.id)}
                      size="icon"
                      className="ml-2 text-red-600 hover:text-red-900 bg-transparent hover:bg-red-200"
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default EnquiriesSection;
