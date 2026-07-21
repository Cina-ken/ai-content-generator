import Link from "next/link";
import { Sparkles, Zap, LayoutGrid, Gift } from "lucide-react";
import DemoPanel from "@/components/DemoPanel";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="w-full border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-accent">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-sm font-medium text-[#f4f4f6]">
              ContentForge
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted sm:gap-3.5">
            <Link href="/pricing" className="hidden sm:inline">
              Pricing
            </Link>
            <Link href="/login">Sign in</Link>
            <Link
              href="/signup"
              className="whitespace-nowrap rounded-[7px] bg-accent px-3 py-1.5 font-medium text-white hover:bg-accent-hover sm:px-3.5"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="text-center lg:text-left">
            <h1 className="mb-3 text-2xl font-medium leading-tight text-[#f4f4f6] sm:text-3xl lg:text-5xl">
              Turn one idea into ready-to-publish copy
            </h1>
            <p className="mx-auto max-w-[440px] text-sm text-muted sm:text-base lg:mx-0 lg:max-w-md">
              Pick a format, describe the topic, watch it write. No account
              needed to try it.
            </p>

            <div className="mt-8 hidden gap-6 lg:flex">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-accent-secondary" />
                <span className="text-sm text-muted">Streams instantly</span>
              </div>
              <div className="flex items-center gap-2">
                <LayoutGrid size={18} className="text-accent-secondary" />
                <span className="text-sm text-muted">4 content types</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift size={18} className="text-accent-secondary" />
                <span className="text-sm text-muted">5 free every month</span>
              </div>
            </div>
          </div>

          <div className="mt-8 lg:mt-0">
            <DemoPanel />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3 lg:hidden">
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
      </main>

      <Footer />
    </div>
  );
}
