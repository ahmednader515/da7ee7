/** Upload directly to storage so PDFs do not hit the app server's body limit. */
export async function uploadPdf(file: File): Promise<string> {
  if (!(file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) || !file.size) {
    throw new Error("اختر ملف PDF صالحاً وغير فارغ.");
  }
  const response = await fetch("/api/upload/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.uploadUrl !== "string" || typeof data.url !== "string") {
    throw new Error(typeof data.error === "string" ? data.error : "تعذر تجهيز رفع الملف. حاول مرة أخرى.");
  }
  let uploaded: Response;
  try {
    uploaded = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: file,
    });
  } catch {
    throw new Error("تعذر الاتصال بالتخزين. تحقق من اتصال الإنترنت وإعدادات CORS في R2.");
  }
  if (!uploaded.ok) {
    throw new Error("فشل رفع الملف إلى التخزين. حاول مرة أخرى.");
  }
  return data.url;
}
