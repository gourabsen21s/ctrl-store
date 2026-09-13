import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error: "Cloudinary is not configured.",
          details:
            "Please provide CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME), CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env.local file.",
        },
        { status: 503 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const customHandle = (formData.get("handle") as string) || "product";
      const face = (formData.get("face") as string) || "front";

      if (!file) {
        return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

      const publicId = `${customHandle}-${face}-${Date.now()}`;
      const url = await uploadImageToCloudinary(base64Data, {
        folder: "ctrl-store/products",
        publicId,
      });

      return NextResponse.json({ success: true, url });
    } else {
      // JSON body with base64 data url
      const { image, handle = "product", face = "front" } = await req.json();

      if (!image) {
        return NextResponse.json({ error: "No image data provided" }, { status: 400 });
      }

      const publicId = `${handle}-${face}-${Date.now()}`;
      const url = await uploadImageToCloudinary(image, {
        folder: "ctrl-store/products",
        publicId,
      });

      return NextResponse.json({ success: true, url });
    }
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
