"use client";

import { TILE_LAYOUTS, GROUT_PRESETS, ROTATION_PRESETS, type MaterialMode, type Alignment, type SurfaceMaterialConfig } from "@/lib/visualizer2/layout";
import type { Product } from "@/lib/visualizer2/product";

interface MaterialConfigPanelProps {
  product: Product;
  config: SurfaceMaterialConfig;
  isVerticalSurface: boolean;
  onChange: (patch: Partial<SurfaceMaterialConfig>) => void;
  onReset: () => void;
}

const pill = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
    active ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
  }`;

/**
 * Step 3: how the currently selected surface's product is installed --
 * mode, size, layout, rotation, scale, offset, grout, alignment, vein
 * orientation. Every control here writes into `config` via `onChange`
 * (a patch merged into that one surface's SurfaceMaterialConfig), so the
 * 3D scene re-renders immediately -- no "Apply" button.
 */
const MaterialConfigPanel = ({ product, config, isVerticalSurface, onChange, onReset }: MaterialConfigPanelProps) => {
  const availableModes = product.availableModes;
  const sizesForMode = product.sizes.filter((s) => s.mode === config.mode);
  const horizontalAlignments: Alignment[] = isVerticalSurface ? ["center", "top", "bottom"] : ["center", "left", "right"];

  return (
    <div className="flex flex-col gap-4 mt-2 p-3 rounded-lg bg-[#F5F1EA] border border-[#E8DDD0]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-[#78716C]">Installation</span>
        <button type="button" onClick={onReset} className="text-xs font-semibold text-[#9B7040] hover:underline">
          Reset Surface
        </button>
      </div>

      {availableModes.length > 1 && (
        <div className="flex gap-1.5">
          {availableModes.map((m: MaterialMode) => (
            <button key={m} type="button" onClick={() => onChange({ mode: m })} className={pill(config.mode === m)}>
              {m}
            </button>
          ))}
        </div>
      )}

      {sizesForMode.length > 1 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#78716C] mb-1.5">Size</p>
          <div className="flex gap-1.5 flex-wrap">
            {sizesForMode.map((s) => (
              <button key={s.id} type="button" onClick={() => onChange({ sizeId: s.id })} className={pill(config.sizeId === s.id)}>
                {s.width} × {s.height} mm
              </button>
            ))}
          </div>
        </div>
      )}

      {config.mode === "tile" && (
        <>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#78716C] mb-1.5">Layout</p>
            <div className="flex gap-1.5 flex-wrap">
              {TILE_LAYOUTS.map((l) => (
                <button key={l.id} type="button" onClick={() => onChange({ layout: l.id })} className={pill(config.layout === l.id)}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#78716C] mb-1.5">Grout Width: {config.groutWidthMm}mm</p>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={config.groutWidthMm}
              onChange={(e) => onChange({ groutWidthMm: Number(e.target.value) })}
              className="w-full accent-[#9B7040]"
            />
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#78716C] mb-1.5">Grout Color</p>
            <div className="flex gap-1.5 flex-wrap">
              {GROUT_PRESETS.map((g) => (
                <button
                  key={g.name}
                  type="button"
                  title={g.name}
                  onClick={() => onChange({ groutColor: g.color })}
                  className={`w-7 h-7 rounded-full border-2 ${config.groutColor === g.color ? "border-[#9B7040]" : "border-[#E8DDD0]"}`}
                  style={{ backgroundColor: g.color }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#78716C] mb-1.5">Vein Orientation</p>
            <div className="flex gap-1.5">
              {(["horizontal", "vertical"] as const).map((v) => (
                <button key={v} type="button" onClick={() => onChange({ veinOrientation: v })} className={pill(config.veinOrientation === v)}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#78716C] mb-1.5">Rotation: {config.rotation}°</p>
        <div className="flex gap-1.5 flex-wrap">
          {ROTATION_PRESETS.map((deg) => (
            <button key={deg} type="button" onClick={() => onChange({ rotation: deg })} className={pill(config.rotation === deg)}>
              {deg}°
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#78716C] mb-1.5">Scale</p>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={config.scale}
          onChange={(e) => onChange({ scale: Number(e.target.value) })}
          className="w-full accent-[#9B7040]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#78716C] mb-1.5">Offset X</p>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={config.offsetX}
            onChange={(e) => onChange({ offsetX: Number(e.target.value) })}
            className="w-full accent-[#9B7040]"
          />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#78716C] mb-1.5">Offset Y</p>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={config.offsetY}
            onChange={(e) => onChange({ offsetY: Number(e.target.value) })}
            className="w-full accent-[#9B7040]"
          />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#78716C] mb-1.5">Alignment</p>
        <div className="flex gap-1.5">
          {horizontalAlignments.map((a) => (
            <button key={a} type="button" onClick={() => onChange({ alignment: a })} className={pill(config.alignment === a)}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaterialConfigPanel;
