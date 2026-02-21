"use client";

import Image from "next/image";
import Link from "next/link";
import SectionWrapper from "./SectionWrapper";
import { motion } from "motion/react";

const MeetTeamSection = () => {
  return (
    <section className="px-5 md:px-12 lg:px-20 xl:px-32 py-20 md:py-28 bg-[#FDFAF7]">
      <div className="max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="flex flex-col items-start gap-3 mb-10"
      >
        <span className="section-label">Our Team</span>
        <h2
          className="text-3xl md:text-5xl font-bold text-[#1C1917] tracking-tight leading-[1.1]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Meet Our Dedicated
          <span className="block text-[#9B7040]">Team of Experts</span>
        </h2>
      </motion.div>

        <div className="flex flex-col sm:flex-row gap-8 justify-start items-start">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <Link
              href="https://www.linkedin.com/in/sheth-harshil/"
              target="_blank"
              className="group block w-64 sm:w-72 rounded-2xl overflow-hidden border border-[#E8DDD0] shadow-sm hover:shadow-[0_8px_30px_rgba(155,112,64,0.18)] transition-shadow duration-300"
            >
              <div className="relative h-80 w-full overflow-hidden bg-[#F5EFE6]">
                <Image
                  src="/harshilsheth.png"
                  alt="Harshil Sheth"
                  fill
                  sizes="(max-width: 640px) 256px, 288px"
                  className="object-cover object-top group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                />
              </div>
              <div className="px-5 py-4 bg-white flex items-center justify-between">
                <div>
                  <p
                    className="font-semibold text-[#1C1917] text-base"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Harshil Sheth
                  </p>
                  <p className="text-sm text-[#9B7040] font-medium tracking-wide uppercase mt-0.5">
                    Founder
                  </p>
                </div>
                <span className="w-9 h-9 rounded-full bg-[#9B7040]/10 flex items-center justify-center group-hover:bg-[#9B7040] transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9B7040] group-hover:text-white transition-colors duration-200"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SectionWrapper(MeetTeamSection, "meet-team-section");
