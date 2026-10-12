import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPdfUploadUrl, uploadToR2, isR2Configured, getMissingR2EnvVars } from "@/lib/r2";

export const maxDuration = 300;

const ALLOWED_TYPE = "application/pdf";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;
  const canUpload =
    role === "ADMIN" || role === "ASSISTANT_ADMIN" || role === "TEACHER";
  if (!session || !canUpload) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  if (!isR2Configured()) {
    const missing = getMissingR2EnvVars().filter((m) => !m.startsWith("R2_PUBLIC"));
    return NextResponse.json(
      {
        error: "التخزين R2 غير مضبوط.",
        missing: missing.length ? missing : ["R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"],
      },
      { status: 503 }
    );
  }

  // Only metadata passes through the app server; the PDF goes directly to R2.
  if (request.headers.get("content-type")?.includes("application/json")) {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.name !== "string" ||
      !(body.type === ALLOWED_TYPE || body.name.toLowerCase().endsWith(".pdf")) ||
      typeof body.size !== "number" || !Number.isSafeInteger(body.size) || body.size <= 0) {
      return NextResponse.json({ error: "اختر ملف PDF صالحاً وغير فارغ." }, { status: 400 });
    }
    try {
      return NextResponse.json(await createPdfUploadUrl());
    } catch (e) {
      console.error("R2 PDF upload URL error:", e);
      return NextResponse.json({ error: "تعذر تجهيز رفع الملف. تأكد من إعدادات التخزين R2 ورابط الملفات العام." }, { status: 503 });
    }
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "لم يُرفع أي ملف" }, { status: 400 });
  }

  const isPdf =
    file.type === ALLOWED_TYPE || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json(
      { error: "نوع الملف غير مدعوم. استخدم ملف PDF فقط." },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const safeExt = ext === "pdf" ? "pdf" : "pdf";
  const key = `pdfs/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url: uploadedUrl } = await uploadToR2(buffer, key, file.type || ALLOWED_TYPE);

    const baseUrl = (uploadedUrl ? null : process.env.R2_PUBLIC_URL?.trim()?.replace(/\/$/, "")) || null;
    const url = uploadedUrl || (baseUrl ? `${baseUrl}/${key}` : null);

    if (!url) {
      return NextResponse.json({
        error: "تم الرفع لكن R2_PUBLIC_URL غير مضبوط.",
        key,
      }, { status: 200 });
    }

    return NextResponse.json({ url, key });
  } catch (e) {
    console.error("R2 PDF upload error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "فشل رفع الملف" },
      { status: 500 }
    );
  }
}
