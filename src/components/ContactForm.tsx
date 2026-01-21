"use client";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "./ui/textarea";
import { FaPhoneAlt } from "react-icons/fa";
import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { createContact } from "@/actions/contact";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  organizationName: z.string().min(1, { message: "Organization name is required" }),
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Email is invalid" }),
  contactNumber: z
    .string()
    .min(10, { message: "Contact number is required" })
    .refine(
      (value) => {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(value);
      },
      { message: "Contact number is invalid" }
    )
    .refine(
      (value) => {
        return value.length >= 10 || value.length <= 15;
      },
      { message: "Contact number must be between 10 and 15 digits" }
    ),
  message: z.string().min(1, { message: "Message is required" }),
});

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      organizationName: "",
      email: "",
      contactNumber: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const res = await createContact(values);
      if (res.success) {
        toast.success("Contact request sent successfully!");
        form.reset();
      } else {
        toast.error(res.error || "Something went wrong! Please try again.");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.error || "Something went wrong! Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="rounded-lg border shadow-lg mx-auto overflow-hidden h-[44rem] xl:h-[35rem]">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full justify-between">
        <div className="w-full p-6">
          <div>
            <h1 className="text-2xl font-bold">Contact Us</h1>
            <p className="text-lg text-gray-50">We’d Love to Hear from You!</p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 mt-5"
            >
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
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
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your organization name"
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
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
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
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your contact number"
                          {...field}
                          disabled={isSubmitting}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
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
              <Button
                type="submit"
                className="w-full bg-alfa-primary hover:bg-alfa-blue text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="w-full hidden items-center justify-center md:flex">
          <Image
            src="/contactus.png"
            alt="Descriptive alt text"
            width={600}
            height={300}
            className="w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
