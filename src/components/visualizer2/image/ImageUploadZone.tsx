"use client";

import { useRef, useState } from "react";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/visualizer2/imageVisualizer/types";

interface ImageUploadZoneProps {
  onFileSelected: (file: File) => void;
  error: string | null;
}

/** Landing state: upload button + drag & drop, with client-side type/size
 * validation before the file ever reaches image decoding. */
const ImageUploadZone = ({ onFileSelected, error }: ImageUploadZoneProps) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFileSelected(file);
  };

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
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center gap-3 w-full h-full min-h-[380px] rounded-2xl border-2 border-dashed text-center px-6 transition-colors ${
        dragOver ? "border-[#9B7040] bg-[#F5EDE1]" : "border-[#E8DDD0] bg-[#EDE6DA]"
      }`}
    >
      <p className="text-lg font-bold text-[#1C1917]">Visualize Your Space</p>
      <p className="text-sm text-[#78716C] max-w-xs">
        Upload a photo of your kitchen, bathroom, or interior to preview Alfa Ventura materials in it.
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-2 px-5 py-2.5 rounded-lg bg-[#1C1917] text-white text-sm font-semibold hover:bg-[#33302B] transition-colors"
      >
        Upload Image
      </button>
      <p className="text-xs text-[#A8A29E]">or drag &amp; drop — JPG, PNG, WEBP, up to 20MB</p>
      {error && <p className="text-xs text-red-600 font-semibold mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};

export const validateImageFile = (file: File): string | null => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Unsupported file type. Please upload a JPG, PNG, or WEBP image.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "Image is too large. Please upload an image under 20 MB.";
  }
  return null;
};

export default ImageUploadZone;
