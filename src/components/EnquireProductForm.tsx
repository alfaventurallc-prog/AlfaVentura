"use client";

import { z } from "zod";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TbHandFinger } from "react-icons/tb";
import { toast } from "sonner";
import { Product } from "../../types";
import LoadingSpinner from "./LoadingSpinner";
import { Textarea } from "./ui/textarea";
import { createEnquiry } from "@/actions/enquiries";
import { FaArrowLeft, FaLongArrowAltLeft } from "react-icons/fa";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(5, "Email is required").email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

const EnquireProductForm = ({ product }: { product: Product }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...values,
        productId: product.id,
      };
      const res = await createEnquiry(submitData);

      if (res.success) {
        toast.success("Enquiry submitted successfully!");
        form.reset();
      } else {
        toast.error(res.error || "Failed to submit enquiry.");
      }
      setOpen(false);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.error || "An error occurred while submitting the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center mt-3">
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        {isSubmitting && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-[100]">
            <LoadingSpinner />
          </div>
        )}
        <DialogTrigger asChild>
          <Button className="bg-alfa-primary hover:bg-alfa-blue text-white">
            Enquire Now
            <TbHandFinger className="inline-block ml-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <DialogHeader>
              <DialogTitle>Enquire about {product.title}</DialogTitle>
              <DialogDescription>Fill out the form below to make an enquiry about this product.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-2"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                        disabled={isSubmitting}
                        required
                      />
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
                      <Input
                        placeholder="Enter your email address"
                        {...field}
                        disabled={isSubmitting}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Enter your message"
                        {...field}
                        disabled={isSubmitting}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    disabled={isSubmitting}
                    className="mt-2 md:mt-0"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-alfa-primary hover:bg-alfa-blue text-white"
                >
                  {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => window.history.back()}
        variant="secondary"
        className="ml-4"
      >
        <FaLongArrowAltLeft />
        Go Back
      </Button>
    </div>
  );
};

export default EnquireProductForm;
