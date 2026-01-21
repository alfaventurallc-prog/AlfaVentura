"use client";

import { fadeIn } from "@/lib/motion";
import SectionWrapper from "./SectionWrapper";
import { HoverEffect } from "./ui/card-hover-effect";
import { motion } from "motion/react";

const ValuesSection = () => {
  return (
    <section
      // variants={fadeIn("down", "tween", 0.3, 1)}
      className="px-5 lg:px-20 xl:px-40 py-20 bg-sky-50"
    >
      <div className="flex flex-col items-start gap-2">
        <motion.h1
          variants={fadeIn("down", "tween", 0.3, 1)}
          className="text-gray-700 animate-slidedown border-l-4 border-[#D4AF37] pl-4 uppercase"
        >
          Our values
        </motion.h1>
        <motion.h1
          variants={fadeIn("down", "tween", 0.3, 1)}
          className="text-3xl md:text-5xl font-extrabold animate-slidedown uppercase"
        >
          Crafted with Care
          <br />
          Delivered with Purpose
        </motion.h1>
        <motion.div variants={fadeIn("up", "tween", 0.5, 1)}>
          <HoverEffect className="animate-slideup" />
        </motion.div>
      </div>
    </section>
  );
};

export default SectionWrapper(ValuesSection, "values-section");
