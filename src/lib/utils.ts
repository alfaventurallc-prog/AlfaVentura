import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoString: Date): string {
  const date = new Date(isoString);

  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export async function compressImage(
  file: File,
  maxSizeMB: number = 10,
  maxWidth: number = 4000,
  maxHeight: number = 4000
): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size <= maxSizeBytes) return file;

  const img = await createImageBitmap(file);

  let width = img.width;
  let height = img.height;

  if (width > maxWidth || height > maxHeight) {
    const aspect = width / height;
    if (width > height) {
      width = maxWidth;
      height = Math.round(maxWidth / aspect);
    } else {
      height = maxHeight;
      width = Math.round(maxHeight * aspect);
    }
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  const toBlob = (quality: number): Promise<Blob> =>
    new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))), "image/jpeg", quality);
    });

  let quality = 0.9;
  let blob: Blob = await toBlob(quality);

  while (blob.size > maxSizeBytes && quality > 0.1) {
    quality -= 0.05;
    blob = await toBlob(quality);
  }

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}
