"use client";

import SectionWrapper from "./SectionWrapper";
import { HoverEffect } from "./ui/card-hover-effect";
import { motion } from "motion/react";

const ValuesSection = () => {
  return (
    <section className="px-5 md:px-12 lg:px-20 xl:px-32 py-20 md:py-28 bg-[#F5EFE6]">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="flex flex-col items-start gap-3 mb-2"
        >
          <span className="section-label">Our Values</span>
          <h2
            className="text-3xl md:text-5xl font-bold text-[#1C1917] tracking-tight leading-[1.1]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Crafted with Care
            <span className="block text-[#9B7040]">Delivered with Purpose</span>
          </h2>
        </motion.div>
        <HoverEffect />
      </div>
    </section>
  );
};

export default SectionWrapper(ValuesSection, "values-section");
