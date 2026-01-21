"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { IoEye } from "react-icons/io5";
import { toast } from "sonner";
import { Contact } from "../../../types";
import LoadingSpinner from "../LoadingSpinner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { deleteContact } from "@/actions/contact";
import { useRouter } from "nextjs-toploader/app";

const ContactsSection = ({ contacts }: { contacts: Contact[] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filteredContacts = Array.isArray(contacts)
    ? contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      try {
        setLoading(true);
        const res = await deleteContact(id);
        if (!res.success) {
          toast.error(res.error || "Failed to delete contact");
        } else {
          toast.success("Contact deleted successfully");
          router.refresh();
        }
      } catch (error: any) {
        console.error("Failed to delete Contact:", error);
        toast.error(error.response?.data?.error || "Failed to delete Contact");
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

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          type="text"
          placeholder="Search contacts..."
          className="pl-10 py-2 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name of Person</TableHead>
                <TableHead>Email of Person</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.contactNumber}</TableCell>
                  <TableCell>{formatDate(contact.createdAt)}</TableCell>
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
                          <DialogTitle>Contact Us Request</DialogTitle>
                        </DialogHeader>
                        <hr className="my-1" />
                        <DialogDescription asChild>
                          <div className="grid grid-cols-2 gap-4">
                            <p>
                              <strong>Name of Person:</strong> {contact.name}
                            </p>
                            <p>
                              <strong>Email:</strong> {contact.email}
                            </p>
                            <p>
                              <strong>COntact Number:</strong> {contact.contactNumber}
                            </p>
                            <p>
                              <strong>Date Submitted:</strong> {formatDate(contact.createdAt)}
                            </p>
                            <p className="col-span-2">
                              <strong>Message:</strong> {contact.message}
                            </p>
                          </div>
                        </DialogDescription>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => handleDelete(contact.id)}
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
export default ContactsSection;
