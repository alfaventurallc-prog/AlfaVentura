import DownloadBrochureSection from "@/components/DownloadBrochureSection";
import HomeWhoWeAreSection from "@/components/HomeWhoWeAreSection";
import InstallationFlowSection from "@/components/InstallationFlowSection";
import FeaturesSection from "../../components/FeaturesSection";
import Hero from "../../components/Hero";

export default async function Home() {
  return (
    <>
      <Hero />
      <HomeWhoWeAreSection />
      <InstallationFlowSection />
      <FeaturesSection />
      <DownloadBrochureSection />
    </>
  );
}
