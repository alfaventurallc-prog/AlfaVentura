"use client";

import type { ApplicationDef } from "@/data/scenes";

interface ApplicationSelectorProps {
  applications: ApplicationDef[];
  activeApplicationId: string;
  onSelect: (applicationId: string) => void;
}

const ApplicationSelector = ({ applications, activeApplicationId, onSelect }: ApplicationSelectorProps) => (
  <div>
    <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#78716C] mb-3">02. Select Application</p>
    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1">
      {applications.map((app) => (
        <button
          key={app.id}
          type="button"
          onClick={() => onSelect(app.id)}
          aria-pressed={activeApplicationId === app.id}
          className={`shrink-0 text-left px-4 py-3 rounded-xl text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B7040] ${
            activeApplicationId === app.id
              ? "bg-[#9B7040] text-white border-[#9B7040]"
              : "bg-white text-[#44403C] border-[#E8DDD0] hover:border-[#9B7040]"
          }`}
        >
          {app.label}
        </button>
      ))}
    </div>
  </div>
);

export default ApplicationSelector;
