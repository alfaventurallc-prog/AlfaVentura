"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SectionWrapper from "./SectionWrapper";
import { motion } from "framer-motion";
import { fadeIn, slideIn } from "@/lib/motion";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(5).email(),
  phone_number: z.string().min(10).max(15),
});

const DownloadBrochureSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    window.open("https://drive.google.com/drive/folders/16OYn4ih_SoqvZ0eGDmRz45jkmzkThHeG", "_blank");
    setIsSubmitted(true);
  }

  return (
    <motion.section
      variants={fadeIn("up", "tween", 0.4, 1)}
      className="px-5 md:px-40 py-10 relative overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large blurred circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-purple-500/15 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-500/8 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-cyan-500/12 rounded-full blur-xl animate-pulse delay-1000"></div>

        {/* Geometric shapes */}
        {/* <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-lg rotate-45 blur-sm"></div>
        <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-gradient-to-tr from-cyan-400/25 to-blue-500/25 rounded-full blur-md"></div> */}

        {/* Smudged icon-like shapes */}
        <div className="absolute top-16 left-1/2 w-8 h-8 bg-blue-600/20 rounded-full blur-md transform rotate-12"></div>
        <div className="absolute top-1/4 left-5 md:left-16 w-20 h-20 bg-purple-600/25 rounded-full blur-lg"></div>
        <div className="absolute bottom-16 right-1/3 w-10 h-10 bg-indigo-600/15 rounded-lg blur transform -rotate-12"></div>

        {/* Floating dots */}
        {/* <div className="absolute top-24 right-1/4 w-3 h-3 bg-blue-500/30 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-32 left-1/2 w-2 h-2 bg-cyan-500/40 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-1/2 right-20 w-4 h-4 bg-purple-500/20 rounded-full animate-bounce"></div> */}

        {/* Gradient overlays */}
        {/* <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-20 bg-gradient-to-t from-purple-500/5 to-transparent"></div> */}
      </div>

      <div className="rounded-lg p-10 bg-white/10 backdrop-blur-sm border border-gray-200 shadow-lg relative z-10">
        <h2 className="text-3xl font-bold text-black text-center md:text-left">
          Download our <span className="text-white bg-alfa-blue px-2">Brochure</span>
        </h2>
        <p className="text-gray-400 text-base mb-8 text-center md:text-left mt-2">
          Please fill out the form below to receive our brochure.
        </p>
        {isSubmitted ? (
          <p className="text-green-500 text-center">
            Thank you for your submission! You can now view our brochure{" "}
            <a
              href="https://drive.google.com/drive/folders/16OYn4ih_SoqvZ0eGDmRz45jkmzkThHeG"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              here
            </a>
            .
          </p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Name *"
                          required
                          className="h-12"
                          {...field}
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
                          placeholder="Email *"
                          className="h-12"
                          required
                          {...field}
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
                          className="h-12"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-5 h-12 bg-alfa-primary hover:bg-alfa-blue text-white"
              >
                Download our Brochure
              </Button>
            </form>
          </Form>
        )}
      </div>
    </motion.section>
  );
};

export default SectionWrapper(DownloadBrochureSection, "Download-Brochure");
