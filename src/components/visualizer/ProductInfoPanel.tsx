"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createEnquiry } from "@/actions/enquiries";
import type { VisualizerProduct } from "../../../types";

interface ProductInfoPanelProps {
  product: VisualizerProduct | null;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(5, "Email is required").email("Invalid email address"),
});

const ProductInfoPanel = ({ product }: ProductInfoPanelProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "" },
  });

  if (!product) {
    return (
      <div className="bg-white rounded-2xl shadow-premium border border-[#F0E8DB] p-5">
        <p className="text-sm text-[#78716C]">Select a quartz design below to see it applied in the kitchen.</p>
      </div>
    );
  }

  const message = `Interested in ${product.name} for a kitchen countertop, island and backsplash.`;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await createEnquiry({
        name: values.name,
        email: values.email,
        message,
        productId: product.id,
      });

      if (res.success) {
        toast.success("Enquiry submitted successfully!");
        form.reset();
        setOpen(false);
      } else {
        toast.error(res.error || "Failed to submit enquiry.");
      }
    } catch {
      toast.error("An error occurred while submitting the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-premium border border-[#F0E8DB] p-5 space-y-6">
      <div>
        <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#9B7040] mb-2">Selected Quartz</p>
        <h3 className="text-xl font-bold text-[#1C1917] leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {product.name}
        </h3>
        <p className="text-sm text-[#78716C] mt-1.5 flex items-center gap-1.5">
          {product.categoryName}
          <span className="w-1 h-1 rounded-full bg-[#D6CBBA]" />
          Polished
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-[#9B7040] hover:bg-[#7A5520] text-white shadow-premium hover:shadow-premium-hover transition-all duration-200">
            Request a Quote
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <DialogHeader>
              <DialogTitle>Request a Quote</DialogTitle>
              <DialogDescription>{product.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} disabled={isSubmitting} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email address" {...field} disabled={isSubmitting} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="space-y-0">
                <FormLabel>Message</FormLabel>
                <Textarea readOnly rows={3} value={message} className="bg-[#F5F1EA] text-[#57534E]" />
              </FormItem>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting} className="mt-2 md:mt-0">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting} className="bg-[#9B7040] hover:bg-[#7A5520] text-white transition-colors duration-200">
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductInfoPanel;
