"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SectionWrapper from "./SectionWrapper";
import { motion } from "framer-motion";
import { useState } from "react";
import { FileDown, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(5, "Email is required").email("Invalid email"),
  phone_number: z.string().min(10, "Phone must be at least 10 digits").max(15),
});

const DownloadBrochureSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone_number: "" },
  });

  function onSubmit(_values: z.infer<typeof formSchema>) {
    window.open("https://drive.google.com/drive/folders/16OYn4ih_SoqvZ0eGDmRz45jkmzkThHeG", "_blank");
    setIsSubmitted(true);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="px-5 md:px-12 lg:px-20 xl:px-32 py-16 md:py-24 bg-[#F5EFE6]"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#E8DDD0] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left copy */}
            <div>
              <span className="section-label">Product Catalogue</span>
              <h2
                className="text-3xl md:text-4xl font-bold text-[#1C1917] tracking-tight leading-[1.15] mt-3 mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Download our
                <span className="text-[#9B7040]"> Brochure</span>
              </h2>
              <p className="text-[#78716C] text-sm leading-relaxed mb-6 max-w-md">
                Get detailed specifications, available sizes, edge profiles, and full product range information — delivered straight to you in a single PDF.
              </p>

              {!isSubmitted ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Your Name *"
                                {...field}
                                className="h-11 border-[#D6C9BB] focus:border-[#9B7040] focus:ring-[#9B7040]/20"
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
                            <FormControl>
                              <Input
                                placeholder="Email Address *"
                                {...field}
                                className="h-11 border-[#D6C9BB] focus:border-[#9B7040] focus:ring-[#9B7040]/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Phone Number *"
                                {...field}
                                className="h-11 border-[#D6C9BB] focus:border-[#9B7040] focus:ring-[#9B7040]/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="h-11 bg-[#9B7040] hover:bg-[#7A5520] text-white font-semibold px-8 rounded-lg shadow-[0_2px_8px_rgba(155,112,64,0.35)] hover:shadow-[0_4px_16px_rgba(155,112,64,0.45)] transition-all duration-200"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Download Brochure
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Brochure opening…</p>
                    <p className="text-sm text-green-700 mt-0.5">
                      If it didn&apos;t open automatically,{" "}
                      <a
                        href="https://drive.google.com/drive/folders/16OYn4ih_SoqvZ0eGDmRz45jkmzkThHeG"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium hover:text-green-900"
                      >
                        click here
                      </a>
                      .
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-xs aspect-[3/4] bg-gradient-to-br from-[#9B7040]/10 to-[#C9A96E]/20 rounded-2xl border border-[#E8DDD0] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/aboutusimg.webp')] bg-cover bg-center opacity-30 rounded-2xl" />
                <div className="relative z-10 text-center px-8 py-10">
                  <FileDown className="w-12 h-12 text-[#9B7040] mx-auto mb-4" />
                  <p className="text-xl font-bold text-[#1C1917]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Product Catalogue
                  </p>
                  <p className="text-sm text-[#78716C] mt-2">Full specs, sizes &amp; profiles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default SectionWrapper(DownloadBrochureSection, "Download-Brochure");
