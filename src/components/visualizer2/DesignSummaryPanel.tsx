"use client";

interface DesignSummaryRow {
  surfaceLabel: string;
  productName: string;
  collection: string;
  finish: string;
  size?: string;
  thickness?: string;
  edgeProfile?: string;
  waterfall?: string;
}

interface DesignSummaryPanelProps {
  roomName: string;
  rows: DesignSummaryRow[];
}

/**
 * Step 7 "Design Summary" -- generated live from the current design state
 * (real product/config data, never raw IDs). Doubles as the print-
 * friendly layout the spec asks to prepare for a future PDF export: it's
 * plain text-in-boxes, nothing canvas-based, so `window.print()` on this
 * section already renders reasonably without extra work.
 */
const DesignSummaryPanel = ({ roomName, rows }: DesignSummaryPanelProps) => (
  <div className="p-3 rounded-lg bg-white border border-[#E8DDD0]">
    <p className="text-[11px] font-bold uppercase tracking-wide text-[#78716C] mb-2">Design Summary</p>
    <p className="text-xs text-[#78716C] mb-2">
      Space: <span className="font-semibold text-[#1C1917]">{roomName}</span>
    </p>
    {rows.length === 0 ? (
      <p className="text-xs text-[#A8A29E]">No materials applied yet.</p>
    ) : (
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.surfaceLabel} className="text-xs border-t border-[#E8DDD0] pt-2 first:border-t-0 first:pt-0">
            <p className="font-bold text-[#1C1917]">{r.surfaceLabel}</p>
            <p className="text-[#78716C]">
              {r.productName} — {r.collection}
            </p>
            <p className="text-[#78716C]">
              Finish: {r.finish}
              {r.size ? ` · Size: ${r.size}` : ""}
              {r.thickness ? ` · Thickness: ${r.thickness}` : ""}
            </p>
            {(r.edgeProfile || r.waterfall) && (
              <p className="text-[#78716C]">
                {r.edgeProfile ? `Edge: ${r.edgeProfile}` : ""}
                {r.edgeProfile && r.waterfall ? " · " : ""}
                {r.waterfall && r.waterfall !== "none" ? `Waterfall: ${r.waterfall}` : ""}
              </p>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default DesignSummaryPanel;
