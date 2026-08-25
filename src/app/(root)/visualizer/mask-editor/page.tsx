import type { Metadata } from "next";
import MaskEditor from "@/components/visualizer/MaskEditor";

export const metadata: Metadata = {
  title: "Mask Editor",
  robots: { index: false, follow: false },
};

export default function MaskEditorPage() {
  return <MaskEditor />;
}
