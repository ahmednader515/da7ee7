"use client";

import { useRouter } from "next/navigation";

const LAST_PATH_KEY = "devtools:last-path";

export default function DevToolsWarningPage() {
  const router = useRouter();

  const handleReturn = () => {
    let destination = "/";

    try {
      const saved = sessionStorage.getItem(LAST_PATH_KEY);

      // Only accept a local route outside the warning page.
      if (
        saved?.startsWith("/") &&
        !saved.startsWith("//") &&
        !saved.includes("\\") &&
        !saved.startsWith("/devtools-warning")
      ) {
        destination = saved;
      }
    } catch {
      // Fall back to the homepage.
    }

    router.push(destination);
  };

  return (
    <section className="flex min-h-[60vh] items-center justify-center p-6 text-center" aria-labelledby="devtools-warning-title">
      <div className="w-full max-w-md rounded-2xl border border-red-500/50 bg-[var(--color-surface)] p-8 shadow-xl">
        <h1 id="devtools-warning-title" className="mb-4 text-xl font-bold text-red-500">
          تم اكتشاف أدوات المطور
        </h1>
        <p className="mb-6 text-[var(--color-foreground)]">
          يُرجى إغلاق أدوات المطور (Developer Tools / Inspect)، ثم العودة إلى الصفحة السابقة.
        </p>
        <button
          type="button"
          onClick={handleReturn}
          className="rounded-[var(--radius-btn)] bg-[var(--color-primary)] px-6 py-3 font-medium text-white hover:bg-[var(--color-primary-hover)]"
        >
          العودة إلى الصفحة السابقة
        </button>
      </div>
    </section>
  );
}
