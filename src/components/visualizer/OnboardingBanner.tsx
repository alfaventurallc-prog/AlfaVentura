"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "alfa-ventura-visualizer-onboarding-dismissed";

const STEPS = [
  { n: 1, title: "Upload or Select a Room", desc: "Use the 3D Visualizer, or upload a photo of your own kitchen." },
  { n: 2, title: "Choose Your Products", desc: "Pick a countertop, cabinet, backsplash and floor finish." },
  { n: 3, title: "See It Live", desc: "Watch your design update instantly, then save, share or compare it." },
];

/** First-time-user guided banner, MSI-style. Dismissal persists per-browser
 * so returning visitors don't see it every time. */
const OnboardingBanner = () => {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // localStorage unavailable -- banner will just reappear next visit
    }
  };

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#1C1917] to-[#2A241E] rounded-2xl shadow-premium-lg px-5 py-5 md:px-7 md:py-6 text-white">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss guide"
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
      >
        <X size={14} />
      </button>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#C9A96E] mb-3">How it works</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {STEPS.map((step) => (
          <div key={step.n} className="flex items-start gap-3">
            <span className="shrink-0 w-8 h-8 rounded-full bg-[#9B7040] text-white text-sm font-bold flex items-center justify-center">
              {step.n}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-snug">{step.title}</p>
              <p className="text-xs text-white/60 leading-snug mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingBanner;
