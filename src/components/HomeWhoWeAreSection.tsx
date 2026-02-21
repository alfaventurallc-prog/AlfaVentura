"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const fadeSlide = (dir: "left" | "right" | "up", delay = 0) => ({
  hidden: {
    opacity: 0,
    x: dir === "left" ? -40 : dir === "right" ? 40 : 0,
    y: dir === "up" ? 30 : 0,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  },
});

const stats = [
  { value: "2025", label: "Est." },
  { value: "100%", label: "Quality Controlled" },
  { value: "USA", label: "Headquarters" },
  { value: "Global", label: "Reach" },
];

const HomeWhoWeAreSection = () => {
  return (
    <section
      id="about-section"
      className="py-20 md:py-28 px-5 md:px-12 lg:px-20 xl:px-32 bg-[#FDFAF7] overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
        {/* Left — stacked images */}
        <motion.div
          variants={fadeSlide("left")}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative h-[420px] lg:h-[560px]"
        >
          {/* Main image */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            <Image
              src="/who.webp"
              alt="Modern kitchen with quartz countertops"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Corner accent image */}
          <motion.div
            variants={fadeSlide("right", 0.35)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="absolute -bottom-6 -right-4 md:-right-10 w-44 h-32 md:w-56 md:h-40 rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.18)] border-[3px] border-white"
          >
            <Image
              src="/who-we-are-2.png"
              alt="Global shipping operations"
              fill
              className="object-cover"
              sizes="240px"
            />
          </motion.div>

          {/* Floating stat badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute top-6 -right-4 md:-right-8 bg-white rounded-2xl px-4 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.1)] border border-[#E8DDD0]"
          >
            <p className="text-xl font-bold text-[#9B7040]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Premium
            </p>
            <p className="text-xs text-[#78716C] font-medium">Engineered Quartz</p>
          </motion.div>
        </motion.div>

        {/* Right — content */}
        <motion.div
          variants={fadeSlide("up", 0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-7"
        >
          <div>
            <span className="section-label">Alfa Ventura</span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1917] leading-[1.1] tracking-tight mt-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              "Precision In Every Slab,
              <span className="block text-[#9B7040]">Trust In Every Shipment"</span>
            </h2>
          </div>

          <div className="space-y-4 text-[#57534E] text-sm leading-[1.75]">
            <p>
              We are Alfa Ventura, a premium supplier of engineered quartz slabs, delivering high-performance surfaces to
              clients across the United States and international markets. Established in 2025, we are focused on
              consistency, material excellence, and dependable supply.
            </p>
            <p>
              Our identity lies in precision, customization, and international compliance. With in-house prefabrication
              units and CNC workshops, we offer cut-to-size quartz countertops, polished vanities, and engineered stone
              surfaces that save time and cost for global buyers.
            </p>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            {stats.map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <p
                  className="text-2xl font-bold text-[#9B7040]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {s.value}
                </p>
                <p className="text-xs text-[#78716C] font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <Link
            href="/about"
            className="btn-primary inline-flex gap-2 items-center"
          >
            Learn More About Us
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default SectionWrapper(HomeWhoWeAreSection, "home-who-we-are");
