import fs from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const extension = ALLOWED_MIME_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: "Invalid image format. Allowed formats: JPEG, PNG, WEBP, GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image exceeds the 5MB maximum file size." },
        { status: 400 }
      );
    }

    const filename = `${user.id}-${Date.now()}.${extension}`;
    const arrayBuffer = await file.arrayBuffer();

    let avatarUrl: string;

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    // Use Supabase Storage in production / cloud environments
    if (supabaseUrl && supabaseKey) {
      const cleanUrl = supabaseUrl.replace(/\/+$/, "");
      const uploadRes = await fetch(
        `${cleanUrl}/storage/v1/object/avatars/${filename}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": file.type,
            "x-upsert": "true",
          },
          body: arrayBuffer,
        }
      );

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error("[supabase storage upload error]:", errorText);
        return NextResponse.json(
          { error: "Failed to upload avatar to cloud storage." },
          { status: 500 }
        );
      }

      avatarUrl = `${cleanUrl}/storage/v1/object/public/avatars/${filename}`;
    } else {
      // Local fallback for local development without Supabase Storage
      const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
      fs.mkdirSync(uploadDir, { recursive: true });
      const buffer = Buffer.from(arrayBuffer);
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      avatarUrl = `/uploads/avatars/${filename}`;
    }

    await db
      .update(users)
      .set({
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      avatarUrl,
    });
  } catch (error) {
    console.error("[avatar upload error]:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar image." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await db
      .update(users)
      .set({
        avatarUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      avatarUrl: null,
    });
  } catch (error) {
    console.error("[avatar delete error]:", error);
    return NextResponse.json(
      { error: "Failed to remove avatar image." },
      { status: 500 }
    );
  }
}
