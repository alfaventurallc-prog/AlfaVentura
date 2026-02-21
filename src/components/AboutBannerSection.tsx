"use client";

import { fadeIn } from "@/lib/motion";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import SectionWrapper from "./SectionWrapper";

const AboutBannerSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    const element = document.getElementById("about-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section>
      <div className="relative h-[30rem] w-full top-0">
        <Image
          src="/aboutusimg.webp"
          alt="About Banner"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="z-0"
        />

        <div className="absolute inset-0 bg-black/50 z-10" />

        <motion.div
          variants={fadeIn("right", "tween", 0.3, 1)}
          className="relative z-20 mx-auto px-5 md:px-40 h-full flex p-10"
        >
          <div className="flex h-full items-center justify-center text-center lg:items-center lg:justify-start lg:text-left">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold max-w-[700px] text-white animate-slideright">About Alfa Ventura</h1>
              <p className="mt-6 text-base md:text-lg max-w-[520px] text-gray-200 animate-slideleft text-justify">
                We are a USA-based company headquartered in Albuquerque, specializing in the supply of premium engineered quartz
                slabs for residential and commercial projects. Serving clients across the United States, the UK, and global
                markets, we focus on delivering consistent quality, reliable supply, and design-forward surfaces that meet
                international standards. Built around performance, aesthetics, and long-term value, our quartz solutions support
                modern architecture and interior spaces with confidence-from specification to installation.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <section
        id="about-section"
        className="py-20 overflow-hidden px-5 md:px-40"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-36 items-center">
          {/* Left Side - Images */}
          <div className="relative h-[400px] lg:h-[600px]">
            {/* Main Kitchen Image - Flies in from right */}
            <div
              className={`absolute inset-0 transition-all duration-1000 ease-out ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
              }`}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/about-us-1.jpg"
                  alt="Modern kitchen with quartz countertops"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Shipping Container Image - Flies in from left with delay */}
            <div
              className={`absolute top-4 right-4 md:-right-20 w-48 h-32 md:w-64 md:h-40 transition-all duration-1000 ease-out delay-500 ${
                isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src="/about-us-2.jpg"
                  alt="Shipping containers"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div
            className={`space-y-6 transition-all duration-1000 ease-out delay-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            {/* Company Name */}
            <div className="text-sm font-medium text-gray-600 tracking-wider uppercase">About Us</div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              "Building Trust, Quality, <span className="block">And Innovation"</span>
            </h1>

            {/* Description */}
            <div className="text-gray-600 text-sm leading-relaxed space-y-4 text-justify">
              <p>
                Founded by a single entrepreneur with deep, hands-on knowledge of global construction markets, the company was
                built on a clear vision-to simplify and strengthen international supply chains through expertise, reliability, and
                innovation. With experience spanning the U.S., India, and international sourcing networks, the founder brings a
                comprehensive understanding of materials, manufacturing, and market expectations across regions.
                <br />
                <br />
                Working closely
                with a trusted network of manufacturers and fabricators worldwide, we source, customize, and deliver high-quality
                construction materials that meet global standards and exceed client expectations. Our mission is straightforward:
                make international procurement seamless, responsive, and future-ready. We don't just supply materials-we build
                long-term partnerships, deliver turnkey solutions, and drive value across the global construction ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default SectionWrapper(AboutBannerSection, "about-banner-section");
