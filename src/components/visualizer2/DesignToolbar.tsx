"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DesignRepository } from "@/lib/visualizer2/designRepository";
import { createDesignId, DEFAULT_DESIGN_NAME, type Design } from "@/lib/visualizer2/design";

interface DesignToolbarProps {
  currentDesign: Design | null;
  isDirty: boolean;
  onSave: (design: Design) => void;
  onNewDesign: () => void;
  onOpenDesign: (design: Design) => void;
  onImportDesign: (raw: unknown) => void;
  onDownload: (format: "png" | "jpg") => void;
  buildDesign: (overrides?: Partial<Pick<Design, "id" | "name" | "createdAt" | "previewDataUrl">>) => Design;
  captureThumbnail: () => string | undefined;
}

const btnClass =
  "px-3 py-2 rounded-lg text-xs font-semibold border border-[#E8DDD0] text-[#44403C] hover:border-[#9B7040] transition-colors";

/**
 * Save / My Designs / Share / Download / Export-Import -- every action
 * here genuinely persists or exports real state (via DesignRepository and
 * the serializer in design.ts), nothing is a placeholder button.
 */
const DesignToolbar = ({ currentDesign, isDirty, onSave, onNewDesign, onOpenDesign, onImportDesign, onDownload, buildDesign, captureThumbnail }: DesignToolbarProps) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [nameInput, setNameInput] = useState(DEFAULT_DESIGN_NAME);
  const [myDesignsOpen, setMyDesignsOpen] = useState(false);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (myDesignsOpen) setDesigns(DesignRepository.list());
  }, [myDesignsOpen]);

  const handleSaveClick = () => {
    setNameInput(currentDesign?.name ?? DEFAULT_DESIGN_NAME);
    setSaveDialogOpen(true);
  };

  const handleConfirmSave = () => {
    const name = nameInput.trim() || DEFAULT_DESIGN_NAME;
    const design = buildDesign({
      id: currentDesign?.id ?? createDesignId(),
      name,
      createdAt: currentDesign?.createdAt,
      previewDataUrl: captureThumbnail(),
    });
    DesignRepository.update(design);
    onSave(design);
    setSaveDialogOpen(false);
    toast.success("Design saved.");
  };

  const handleOpen = (design: Design) => {
    onOpenDesign(design);
    setMyDesignsOpen(false);
  };

  const handleDuplicate = (design: Design) => {
    const copy: Design = { ...design, id: createDesignId(), name: `${design.name} Copy`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    DesignRepository.create(copy);
    setDesigns(DesignRepository.list());
    toast.success("Design duplicated.");
  };

  const handleDelete = (id: string) => {
    DesignRepository.delete(id);
    setDesigns(DesignRepository.list());
    setDeleteConfirmId(null);
    toast.success("Design deleted.");
  };

  const handleShare = () => {
    const design = buildDesign({ id: currentDesign?.id ?? createDesignId(), name: currentDesign?.name });
    const url = DesignRepository.share(design);
    setShareUrl(url);
    setShareDialogOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied.");
    } catch {
      toast.error("Couldn't copy the link — copy it manually instead.");
    }
  };

  const handleWebShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: currentDesign?.name ?? "My Alfa Ventura Design", url: shareUrl });
    } catch {
      // user cancelled -- no-op
    }
  };

  const handleExportJson = () => {
    const design = buildDesign({ id: currentDesign?.id ?? createDesignId(), name: currentDesign?.name });
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${design.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onImportDesign(JSON.parse(String(reader.result)));
      } catch {
        toast.error("That file isn't a valid design export.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        <button type="button" onClick={onNewDesign} className={btnClass}>
          + New Design
        </button>
        <button type="button" onClick={handleSaveClick} className={btnClass}>
          Save Design{isDirty ? " •" : ""}
        </button>
        <button type="button" onClick={() => setMyDesignsOpen(true)} className={btnClass}>
          My Designs
        </button>
        <button type="button" onClick={handleShare} className={btnClass}>
          Share
        </button>
        <div className="relative">
          <button type="button" onClick={() => setDownloadMenuOpen((v) => !v)} className={btnClass}>
            Download ▾
          </button>
          {downloadMenuOpen && (
            <div className="absolute z-10 mt-1 bg-white border border-[#E8DDD0] rounded-lg shadow-lg overflow-hidden">
              {(["png", "jpg"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => {
                    onDownload(fmt);
                    setDownloadMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-xs font-semibold text-[#44403C] hover:bg-[#F5F1EA]"
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={handleExportJson} className={btnClass}>
          Export JSON
        </button>
        <button type="button" onClick={() => importInputRef.current?.click()} className={btnClass}>
          Import JSON
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSaveDialogOpen(false)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-[#1C1917] mb-3">Save Your Design</p>
            <label className="text-xs font-semibold text-[#78716C] block mb-1">Design Name</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8DDD0] text-sm mb-4 focus:outline-none focus:border-[#9B7040]"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setSaveDialogOpen(false)} className={btnClass}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirmSave} className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#1C1917] text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {shareDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShareDialogOpen(false)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-[#1C1917] mb-3">Share Design</p>
            <input readOnly value={shareUrl} className="w-full px-3 py-2 rounded-lg border border-[#E8DDD0] text-xs mb-3 text-[#57534E]" />
            <div className="flex justify-end gap-2 flex-wrap">
              <button type="button" onClick={() => setShareDialogOpen(false)} className={btnClass}>
                Close
              </button>
              {typeof navigator !== "undefined" && !!navigator.share && (
                <button type="button" onClick={handleWebShare} className={btnClass}>
                  Share
                </button>
              )}
              <button type="button" onClick={handleCopyLink} className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#1C1917] text-white">
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {myDesignsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setMyDesignsOpen(false)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#1C1917]">My Designs</p>
              <button type="button" onClick={() => setMyDesignsOpen(false)} className="text-[#78716C] text-sm">
                ✕
              </button>
            </div>
            {designs.length === 0 ? (
              <p className="text-sm text-[#78716C] py-6 text-center">No saved designs yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {designs.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-[#E8DDD0]">
                    {d.previewDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.previewDataUrl} alt={d.name} className="w-14 h-14 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded bg-[#F5F1EA] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1C1917] truncate">{d.name}</p>
                      <p className="text-[11px] text-[#78716C]">{new Date(d.updatedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button type="button" onClick={() => handleOpen(d)} className="text-xs font-semibold text-[#9B7040] hover:underline">
                        Open
                      </button>
                      <button type="button" onClick={() => handleDuplicate(d)} className="text-xs font-semibold text-[#78716C] hover:underline">
                        Duplicate
                      </button>
                      {deleteConfirmId === d.id ? (
                        <button type="button" onClick={() => handleDelete(d.id)} className="text-xs font-semibold text-red-600 hover:underline">
                          Confirm?
                        </button>
                      ) : (
                        <button type="button" onClick={() => setDeleteConfirmId(d.id)} className="text-xs font-semibold text-red-500 hover:underline">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DesignToolbar;
