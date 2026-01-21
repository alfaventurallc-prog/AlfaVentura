"use client";

import Image from "next/image";
import Link from "next/link";
import SectionWrapper from "./SectionWrapper";
import { motion } from "motion/react";
import { fadeIn, slideIn } from "@/lib/motion";

const MeetTeamSection = () => {
  return (
    <section className="px-10 lg:px-20 xl:px-40 py-20 flex flex-col gap-10">
      <motion.div
        variants={fadeIn("right", "tween", 0.3, 1)}
        className="flex flex-col items-start gap-2"
      >
        <h1 className="text-gray-700 animate-slidedown border-l-4 border-[#D4AF37] pl-4 uppercase">Our Team</h1>
        <h1 className="text-5xl font-extrabold animate-slidedown uppercase">
          Meet our dedicated
          <br />
          Team of experts
        </h1>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-10 justify-start items-start lg:items-center">
        <motion.div variants={fadeIn("up", "tween", 0.3, 1)}>
          <Link
            href="https://www.linkedin.com/in/sheth-harshil/"
            target="_blank"
            className="flex flex-col items-center gap-2 group w-full lg:w-[400px] overflow-hidden relative"
          >
            <Image
              src="/harshilsheth.jpeg"
              alt="Harshil Sheth"
              width={400}
              height={200}
              className="rounded-md w-full lg:w-[400px] object-cover group-hover:scale-110 transition-transform duration-300 ease-in-out overflow-hidden"
            />
            <div className="h-20 lg:h-0 overflow-hidden w-full text-center group-hover:h-20 absolute bottom-0 bg-alfa-blue p-0 transition-all duration-300 ease-in-out">
              <h1 className="text-white text-xl mt-3">Harshil Sheth</h1>
              <p className="uppercase text-base text-gray-400">Co-Founder</p>
            </div>
          </Link>
        </motion.div>
        {/* 
        <motion.div variants={fadeIn("up", "tween", 0.7, 1)}>
          <Link
            href="https://www.linkedin.com/in/meetsaiya/"
            target="_blank"
            className="flex flex-col items-center w-full lg:w-[400px] gap-2 group overflow-hidden relative"
          >
            <Image
              src="/meetsaiya.jpeg"
              alt="Meet Saiya"
              width={400}
              height={200}
              className="rounded-md  w-full lg:w-[400px] object-cover group-hover:scale-110 transition-transform duration-300 ease-in-out overflow-hidden"
            />
            <div className="h-20 lg:h-0 overflow-hidden w-full text-center group-hover:h-20 absolute bottom-0 bg-alfa-blue p-0 transition-all duration-300 ease-in-out">
              <h1 className="text-white text-xl mt-3">Meet Saiya</h1>
              <p className="uppercase text-base text-gray-400">Co-Founder</p>
            </div>
          </Link>
        </motion.div> */}
      </div>
    </section>
  );
};

export default SectionWrapper(MeetTeamSection, "meet-team-section");
