"use client";

import { useState } from "react";
import type { CountertopFabricationConfig, EdgeProfile, WaterfallSide, SeamMode } from "@/lib/visualizer2/layout";
import type { Product } from "@/lib/visualizer2/product";

interface FabricationPanelProps {
  product: Product;
  config: CountertopFabricationConfig;
  onChange: (patch: Partial<CountertopFabricationConfig>) => void;
}

const pill = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
    active ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
  }`;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-[#E8DDD0] pt-2 first:border-t-0 first:pt-0">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-left">
        <span className="text-[11px] font-bold uppercase tracking-wide text-[#78716C]">{title}</span>
        <span className="text-[#78716C] text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="mt-1.5">{children}</div>}
    </div>
  );
};

/**
 * Step 5: countertop/island fabrication controls -- only rendered when the
 * selected surface's type is "countertop"/"island" (see VisualizerV2Shell).
 * Every control here writes straight into the surface's
 * CountertopFabricationConfig, so CountertopRenderer re-renders the real
 * 3D geometry immediately.
 */
const FabricationPanel = ({ product, config, onChange }: FabricationPanelProps) => {
  const thicknesses = product.availableThicknesses.length ? product.availableThicknesses : [20];
  const edgeProfiles: EdgeProfile[] = product.availableEdgeProfiles.length ? product.availableEdgeProfiles : ["square"];

  return (
    <div className="flex flex-col gap-3 mt-2 p-3 rounded-lg bg-[#F5F1EA] border border-[#E8DDD0]">
      <span className="text-xs font-bold uppercase tracking-wide text-[#78716C]">Fabrication</span>

      <Section title={`Thickness: ${config.thicknessMm}mm`}>
        <div className="flex gap-1.5">
          {thicknesses.map((t) => (
            <button key={t} type="button" onClick={() => onChange({ thicknessMm: t })} className={pill(config.thicknessMm === t)}>
              {t}mm
            </button>
          ))}
        </div>
      </Section>

      <Section title={`Edge Profile: ${config.edgeProfile}`}>
        <div className="flex gap-1.5 flex-wrap">
          {edgeProfiles.map((e) => (
            <button key={e} type="button" onClick={() => onChange({ edgeProfile: e })} className={pill(config.edgeProfile === e)}>
              {e}
            </button>
          ))}
        </div>
      </Section>

      <Section title={`Overhang: ${config.overhangMm}mm`}>
        <input
          type="range"
          min={0}
          max={60}
          step={10}
          value={config.overhangMm}
          onChange={(e) => onChange({ overhangMm: Number(e.target.value) })}
          className="w-full accent-[#9B7040]"
        />
      </Section>

      {product.supportsWaterfall && (
        <Section title={`Waterfall: ${config.waterfall}`}>
          <div className="flex gap-1.5">
            {(["none", "left", "right", "both"] as WaterfallSide[]).map((w) => (
              <button key={w} type="button" onClick={() => onChange({ waterfall: w })} className={pill(config.waterfall === w)}>
                {w}
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section title={`Seams: ${config.seams}`}>
        <div className="flex gap-1.5">
          {(["auto", "visible", "hidden"] as SeamMode[]).map((s) => (
            <button key={s} type="button" onClick={() => onChange({ seams: s })} className={pill(config.seams === s)}>
              {s}
            </button>
          ))}
        </div>
      </Section>

      {product.supportsBookmatch && (
        <Section title={`Bookmatch: ${config.bookmatch ? "On" : "Off"}`}>
          <div className="flex flex-col gap-2">
            <div className="flex gap-1.5">
              {[false, true].map((v) => (
                <button key={String(v)} type="button" onClick={() => onChange({ bookmatch: v })} className={pill(config.bookmatch === v)}>
                  {v ? "On" : "Off"}
                </button>
              ))}
            </div>
            {config.bookmatch && (
              <>
                <div className="flex gap-1.5">
                  {(["standard", "mirrored"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => onChange({ bookmatchType: t })} className={pill(config.bookmatchType === t)}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {(["left-right", "top-bottom"] as const).map((d) => (
                    <button key={d} type="button" onClick={() => onChange({ bookmatchDirection: d })} className={pill(config.bookmatchDirection === d)}>
                      {d}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </Section>
      )}

      <Section title={`Cutouts (${config.cutouts.length})`}>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() =>
              onChange({
                cutouts: [
                  ...config.cutouts,
                  { id: `cutout-${Date.now()}`, type: "sink", xPct: 50, yPct: 50, widthPct: 25, depthPct: 40 },
                ],
              })
            }
            className={pill(false)}
          >
            + Add Sink Cutout
          </button>
          {config.cutouts.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-xs bg-white/60 rounded px-2 py-1">
              <span className="capitalize">{c.type} cutout</span>
              <button
                type="button"
                onClick={() => onChange({ cutouts: config.cutouts.filter((x) => x.id !== c.id) })}
                className="text-[#9B7040] hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          <p className="text-[10px] text-[#A8A29E]">Placeholder marker only -- not yet cut from the 3D geometry.</p>
        </div>
      </Section>
    </div>
  );
};

export default FabricationPanel;
