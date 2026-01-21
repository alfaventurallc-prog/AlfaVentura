import { staggerContainer } from "@/lib/motion";
import { motion } from "motion/react";

const SectionWrapper = <T extends object>(Component: React.ComponentType<T>, idName: string) =>
  function HOC(props: T) {
    return (
      <motion.section
        variants={staggerContainer()}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className={`max-w-full mx-auto relative z-0`}
      >
        {/* <span
          className="hash-span"
          id={idName}
        ></span> */}
        <Component {...props} />
      </motion.section>
    );
  };

export default SectionWrapper;
