import Link from "next/link";
import { Sparkles, Zap, LayoutGrid, Gift } from "lucide-react";
import DemoPanel from "@/components/DemoPanel";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="w-full max-w-[680px]">
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-accent">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-sm font-medium text-[#f4f4f6]">
              ContentForge
            </span>
          </div>
          <div className="flex items-center gap-3.5 text-xs text-muted">
            <Link href="/pricing">Pricing</Link>
            <Link href="/login">Sign in</Link>
            <Link
              href="/signup"
              className="rounded-[7px] bg-accent px-3.5 py-1.5 font-medium text-white hover:bg-accent-hover"
            >
              Get started
            </Link>
          </div>
        </header>

        <div className="px-6 pb-1 pt-8 text-center">
          <h1 className="mb-2 text-xl font-medium leading-tight text-[#f4f4f6] sm:text-2xl">
            Turn one idea into ready-to-publish copy
          </h1>
          <p className="mx-auto max-w-[400px] text-[13px] text-muted">
            Pick a format, describe the topic, watch it write. No account
            needed to try it.
          </p>
        </div>

        <div className="py-5">
          <DemoPanel />
        </div>

        <div className="grid grid-cols-3 gap-3 px-5 pb-8 pt-1">
          <div className="text-center">
            <Zap size={20} className="mx-auto text-accent-secondary" />
            <div className="mt-1.5 text-[11px] text-muted">
              Streams instantly
            </div>
          </div>
          <div className="text-center">
            <LayoutGrid size={20} className="mx-auto text-accent-secondary" />
            <div className="mt-1.5 text-[11px] text-muted">
              4 content types
            </div>
          </div>
          <div className="text-center">
            <Gift size={20} className="mx-auto text-accent-secondary" />
            <div className="mt-1.5 text-[11px] text-muted">
              5 free every month
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
