"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, Download as DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import type { VisualizerProduct } from "../../../types";

interface RoomUploadPanelProps {
  countertopProduct: VisualizerProduct | null;
  backsplashProduct: VisualizerProduct | null;
  cabinetColor: string;
}

/**
 * "Upload Your Own Room" -- honestly scoped: there's no AI surface
 * segmentation in this project, so we don't pretend to auto-replace the
 * countertop in the user's photo. Instead the uploaded photo becomes the
 * background and the currently-selected materials are shown as labeled
 * swatch chips over it, the way a sales rep would hold a physical sample
 * up against a photo of your kitchen. Download exports a real composited
 * PNG (photo + swatches), not just the raw upload.
 */
const RoomUploadPanel = ({ countertopProduct, backsplashProduct, cabinetColor }: RoomUploadPanelProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG or PNG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.onerror = () => toast.error("Couldn't read that image — try a different file.");
    reader.readAsDataURL(file);
  }, []);

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("image failed to load"));
        img.src = imageUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas context");
      ctx.drawImage(img, 0, 0);

      // Swatch chips in the bottom-left corner, sized relative to the photo
      // so the export looks right regardless of the uploaded photo's resolution.
      const chipSize = Math.max(64, Math.round(canvas.width * 0.09));
      const pad = Math.round(chipSize * 0.35);
      const chips: { label: string; color?: string; src?: string }[] = [
        { label: "Cabinet", color: cabinetColor },
        ...(countertopProduct ? [{ label: "Countertop", src: countertopProduct.image }] : []),
        ...(backsplashProduct ? [{ label: "Backsplash", src: backsplashProduct.image }] : []),
      ];

      const drawChip = async (chip: (typeof chips)[number], index: number) => {
        const x = pad;
        const y = canvas.height - pad - chipSize * (index + 1) - pad * index;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 6, y - 6, chipSize + 12, chipSize + 12);
        ctx.restore();
        if (chip.src) {
          const swatchImg = new Image();
          swatchImg.crossOrigin = "anonymous";
          await new Promise<void>((resolve) => {
            swatchImg.onload = () => resolve();
            swatchImg.onerror = () => resolve();
            swatchImg.src = chip.src!;
          });
          ctx.drawImage(swatchImg, x, y, chipSize, chipSize);
        } else if (chip.color) {
          ctx.fillStyle = chip.color;
          ctx.fillRect(x, y, chipSize, chipSize);
        }
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(x, y + chipSize - 18, chipSize, 18);
        ctx.fillStyle = "#ffffff";
        ctx.font = "11px sans-serif";
        ctx.fillText(chip.label, x + 4, y + chipSize - 5);
      };

      for (let i = 0; i < chips.length; i++) {
        await drawChip(chips[i], i);
      }

      const link = document.createElement("a");
      link.download = "alfa-ventura-my-room-design.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      toast.error("Couldn't export this image — try downloading the photo directly instead.");
    }
  };

  if (!imageUrl) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          loadFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 w-full h-full min-h-[380px] rounded-2xl border-2 border-dashed cursor-pointer transition-colors duration-200 ${
          dragOver ? "border-[#9B7040] bg-[#F5EFE4]" : "border-[#E8DDD0] bg-[#FDFAF7] hover:border-[#C9A96E]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => loadFile(e.target.files?.[0])}
        />
        <div className="w-14 h-14 rounded-full bg-[#F0E8DB] flex items-center justify-center text-[#9B7040]">
          <UploadCloud size={26} />
        </div>
        <p className="text-sm font-bold text-[#1C1917]">Upload a photo of your room</p>
        <p className="text-xs text-[#A8987F] max-w-xs text-center">
          Drag & drop a JPG or PNG here, or click to browse. Your selected materials will show as sample swatches over the photo.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[380px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="Your uploaded room" className="absolute inset-0 w-full h-full object-cover" />

      <button
        type="button"
        onClick={() => setImageUrl(null)}
        aria-label="Remove uploaded photo"
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors duration-200"
      >
        <X size={16} />
      </button>

      <button
        type="button"
        onClick={handleDownload}
        className="absolute top-3 right-14 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200"
      >
        <DownloadIcon size={13} /> Export
      </button>

      <div className="absolute bottom-3 left-3 flex gap-2">
        <div className="flex flex-col items-center gap-1">
          <span className="w-14 h-14 rounded-lg shadow-premium-lg border-2 border-white" style={{ backgroundColor: cabinetColor }} />
          <span className="text-[10px] font-bold uppercase tracking-wide text-white bg-black/50 px-1.5 py-0.5 rounded">Cabinet</span>
        </div>
        {countertopProduct && (
          <div className="flex flex-col items-center gap-1">
            <span
              className="w-14 h-14 rounded-lg shadow-premium-lg border-2 border-white bg-cover bg-center"
              style={{ backgroundImage: `url(${countertopProduct.image})` }}
            />
            <span className="text-[10px] font-bold uppercase tracking-wide text-white bg-black/50 px-1.5 py-0.5 rounded">Countertop</span>
          </div>
        )}
        {backsplashProduct && (
          <div className="flex flex-col items-center gap-1">
            <span
              className="w-14 h-14 rounded-lg shadow-premium-lg border-2 border-white bg-cover bg-center"
              style={{ backgroundImage: `url(${backsplashProduct.image})` }}
            />
            <span className="text-[10px] font-bold uppercase tracking-wide text-white bg-black/50 px-1.5 py-0.5 rounded">Backsplash</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomUploadPanel;
