import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "alfa_ventura";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await uploadToCloudinary(file, folder);

    return NextResponse.json({
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
