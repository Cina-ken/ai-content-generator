import Link from "next/link";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";

export function AuthCard({
  title,
  subtitle,
  error,
  notice,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  error?: string;
  notice?: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-ink">ContentForge</span>
          </Link>

          <div className="rounded-2xl border border-line bg-panel p-6">
            <h1 className="text-xl font-bold text-ink">{title}</h1>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>

            {error && (
              <div className="mt-4 rounded-xl bg-red-950/40 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}
            {notice && (
              <div className="mt-4 rounded-xl bg-emerald-950/40 px-3 py-2 text-sm text-emerald-400">
                {notice}
              </div>
            )}

            <div className="mt-5">{children}</div>
          </div>

          <p className="mt-4 text-center text-sm text-muted">{footer}</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
