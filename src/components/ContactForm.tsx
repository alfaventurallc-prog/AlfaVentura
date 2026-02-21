"use client";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { createContact } from "@/actions/contact";
import { Send } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  organizationName: z.string().min(1, { message: "Organization name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Email is invalid" }),
  contactNumber: z
    .string()
    .min(10, { message: "Contact number must be at least 10 digits" })
    .refine(
      (v) => /^\+?[1-9]\d{1,14}$/.test(v),
      { message: "Contact number is invalid" }
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
        toast.success("Message sent successfully!");
        form.reset();
      } else {
        toast.error(res.error || "Something went wrong. Please try again.");
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-2xl border border-[#E8DDD0] bg-white shadow-sm overflow-hidden">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5">
        {/* Form */}
        <div className="md:col-span-3 p-8 lg:p-10">
          <div className="mb-7">
            <span className="section-label">Get In Touch</span>
            <h2
              className="mt-2 text-2xl md:text-3xl font-bold text-[#1C1917] leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              We&apos;d Love to Hear
              <span className="text-[#9B7040]"> from You</span>
            </h2>
            <p className="mt-2 text-[#6B5E52] text-sm">
              Fill in the form below and our team will get back to you within 24 hours.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#1C1917] text-sm font-medium">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          {...field}
                          disabled={isSubmitting}
                          className="input"
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
                      <FormLabel className="text-[#1C1917] text-sm font-medium">Organization</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your company"
                          {...field}
                          disabled={isSubmitting}
                          className="input"
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
                      <FormLabel className="text-[#1C1917] text-sm font-medium">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
                          type="email"
                          {...field}
                          disabled={isSubmitting}
                          className="input"
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
                      <FormLabel className="text-[#1C1917] text-sm font-medium">Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 000-0000"
                          {...field}
                          disabled={isSubmitting}
                          className="input"
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
                    <FormLabel className="text-[#1C1917] text-sm font-medium">Message</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Tell us about your project or inquiry…"
                        {...field}
                        disabled={isSubmitting}
                        className="input resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full sm:w-auto gap-2"
              >
                <Send size={15} />
                {isSubmitting ? "Sending…" : "Send Message"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Info panel */}
        <div className="md:col-span-2 bg-[#9B7040] flex flex-col justify-center p-8 lg:p-10 gap-8">
          <div>
            <p
              className="text-[#C9A96E] text-xs font-semibold tracking-widest uppercase mb-3"
            >
              Contact Information
            </p>
            <h3
              className="text-white text-xl font-bold leading-snug"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Let&apos;s Build Something
              <br />
              Great Together
            </h3>
          </div>

          <div className="space-y-5 text-white/90 text-sm">
            <div className="flex gap-3">
              <span className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <span>1209 Mountain Road Place NE, Suite N<br />Albuquerque, NM 87110, USA</span>
            </div>
            <div className="flex gap-3 items-center">
              <span className="shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 8.91A16 16 0 0 0 15 15.91l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <span>+1 (480) 791-5581</span>
            </div>
            <div className="flex gap-3 items-center">
              <span className="shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <span>info@alfaventura.com</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="text-white/60 text-xs">Business hours: Mon–Fri, 9am–6pm MST</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
