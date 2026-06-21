"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { ArrowRight } from "lucide-react";

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

const steps = [
  "Quartz Slab",
  "Fabrication & Finishing",
  "Installed Countertop",
];

const InstallationFlowSection = () => {
  return (
    <section className="px-5 md:px-12 lg:px-20 xl:px-32 py-20 bg-[#FFFFFF]">
      <div className="max-w-[1400px] mx-auto grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center">
        <motion.div
          variants={fadeSlide("left")}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-6"
        >
          <div>
            <span className="section-label">From Slab to Installation</span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1917] leading-[1.05] mt-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              FROM RAW QUARTZ TO FINISHED SPACES
            </h2>
          </div>

          <p className="max-w-xl text-[#57534E] text-sm leading-[1.8]">
            Crafted In-House • Precision Finished • Installed to Perfection
          </p>

          <div className="rounded-[24px] border border-[#E8DDD0] bg-[#F9F3E8] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
            <div className="text-[#1C1917] font-semibold text-sm uppercase tracking-[0.25em] mb-4">
              Workflow
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-3xl bg-white p-4 border border-[#E8DDD0] shadow-[0_8px_20px_rgba(0,0,0,0.05)]">
                <p className="text-xs uppercase tracking-[0.25em] text-[#9B7040] font-semibold mb-2">Step 1</p>
                <p className="text-base font-bold text-[#1C1917]">Premium Quartz Slabs</p>
              </div>
              <div className="rounded-3xl bg-white p-4 border border-[#E8DDD0] shadow-[0_8px_20px_rgba(0,0,0,0.05)]">
                <p className="text-xs uppercase tracking-[0.25em] text-[#9B7040] font-semibold mb-2">Step 2</p>
                <p className="text-base font-bold text-[#1C1917]">CNC Fabrication & Edge Finishing</p>
              </div>
              <div className="rounded-3xl bg-white p-4 border border-[#E8DDD0] shadow-[0_8px_20px_rgba(0,0,0,0.05)]">
                <p className="text-xs uppercase tracking-[0.25em] text-[#9B7040] font-semibold mb-2">Step 3</p>
                <p className="text-base font-bold text-[#1C1917]">Quality Inspection</p>
              </div>
              <div className="rounded-3xl bg-white p-4 border border-[#E8DDD0] shadow-[0_8px_20px_rgba(0,0,0,0.05)]">
                <p className="text-xs uppercase tracking-[0.25em] text-[#9B7040] font-semibold mb-2">Step 4</p>
                <p className="text-base font-bold text-[#1C1917]">Custom Installation</p>
              </div>
            </div>
          </div>

          <p className="max-w-lg text-[#57534E] text-sm leading-[1.8]">
            From premium quartz slabs to fully finished countertops, every surface is precision fabricated, expertly finished, and delivered ready for residential and commercial projects worldwide.
          </p>
        </motion.div>

        <motion.div
          variants={fadeSlide("right", 0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="rounded-[32px] overflow-hidden bg-[#F3ECE2] border border-[#E8DDD0] shadow-[0_24px_72px_rgba(0,0,0,0.08)]"
        >
          <div className="bg-white">
            <Image
              src="/installation-flow.png"
              alt="From quartz slab to custom installation"
              width={1400}
              height={800}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SectionWrapper(InstallationFlowSection, "installation-flow");
