"use client";

import Image from "next/image";
import { motion } from "motion/react";
import SectionWrapper from "./SectionWrapper";

const AboutBannerSection = () => {
  return (
    <section>
      {/* Hero Banner */}
      <div className="relative h-[36rem] w-full overflow-hidden">
        <Image
          src="/about-us-3.webp"
          alt="About Alfa Ventura"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-5 md:px-12 lg:px-20 xl:px-32 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="block w-8 h-[2px] bg-[#C9A96E]" />
              <span className="text-[#C9A96E] text-xs font-bold tracking-[0.2em] uppercase">Our Story</span>
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              About Alfa Ventura
            </h1>
            <p className="text-base md:text-lg text-white/80 max-w-lg leading-[1.7]">
              A USA-based company headquartered in Albuquerque, specializing in premium engineered quartz slabs for
              residential and commercial projects worldwide.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Who We Are section */}
      <section
        id="about-section"
        className="py-20 md:py-28 px-5 md:px-12 lg:px-20 xl:px-32 bg-[#FDFAF7] overflow-hidden"
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 xl:gap-24 items-center">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative h-[420px] lg:h-[540px]"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <Image
                src="/about-us-1.jpg"
                alt="Alfa Ventura operations"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="absolute top-4 -right-4 md:-right-10 w-44 h-32 md:w-56 md:h-40 rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.18)] border-[3px] border-white"
            >
              <Image
                src="/about-us-2.jpg"
                alt="Quartz slab detail"
                fill
                className="object-cover"
                sizes="240px"
              />
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="space-y-6"
          >
            <span className="section-label">About Us</span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#1C1917] leading-[1.1] tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              "Building Trust, Quality,<span className="block text-[#9B7040]">And Innovation"</span>
            </h2>
            <div className="text-sm text-[#57534E] leading-[1.8] space-y-4">
              <p>
                Founded by a single entrepreneur with deep, hands-on knowledge of global construction markets, Alfa Ventura was
                built on a clear vision — to simplify and strengthen international supply chains through expertise, reliability, and
                innovation.
              </p>
              <p>
                With experience spanning the U.S., India, and international sourcing networks, the founder brings a comprehensive
                understanding of materials, manufacturing, and market expectations across regions. Working closely with a trusted
                network of manufacturers and fabricators worldwide, we source, customize, and deliver high-quality quartz surfaces
                that meet global standards.
              </p>
              <p>
                Our mission is straightforward: make international procurement seamless, responsive, and future-ready. We
                don't just supply materials — we build long-term partnerships and drive value across the global construction
                ecosystem.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </section>
  );
};

export default SectionWrapper(AboutBannerSection, "about-banner-section");
