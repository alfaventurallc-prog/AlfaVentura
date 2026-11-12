import AboutBannerSection from "@/components/AboutBannerSection";
import MeetTeamSection from "@/components/MeetTeamSection";
import ValuesSection from "@/components/ValuesSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Quartz Slab Supplier in Albuquerque, NM",
  description:
    "Alfa Ventura is a USA-based engineered quartz company in Albuquerque, New Mexico, supplying quartz slabs, countertops, cabinets and flooring to projects nationwide.",
  alternates: { canonical: "/about" },
};

const AboutPage = () => {
  return (
    <div>
      <AboutBannerSection />
      <ValuesSection />
      <MeetTeamSection />
    </div>
  );
};

export default AboutPage;
