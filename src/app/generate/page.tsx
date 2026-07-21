import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getCurrentUser, isSubscribed } from "@/lib/auth";
import { getQuotaStatus } from "@/lib/quota";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";
import GenerateForm from "@/components/GenerateForm";
import { Footer } from "@/components/Footer";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function GeneratePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/generate");
  }

  const subscribed = await isSubscribed(user.id);
  const quota = await getQuotaStatus(user.id);

  const supabase = await createClient();
  const { data: history } = await supabase
    .from("generations")
    .select("id, content_type, prompt, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const initials = (user.email ?? "??").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-1 flex-col">
      <header className="w-full border-b border-line">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-accent">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-sm font-medium text-[#f4f4f6]">
              ContentForge
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs sm:gap-4">
            <span className="hidden text-ink-secondary sm:inline">
              Generate
            </span>
            <a href="#recent" className="text-muted">
              History
            </a>
            <form action={signOut}>
              <button
                type="submit"
                title="Sign out"
                className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#2a2e42] text-[11px] font-medium text-[#c7c9d9] transition-colors hover:bg-[#353a54]"
              >
                {initials}
              </button>
            </form>
          </div>
        </div>
      </header>

      {!subscribed && (
        <div className="w-full bg-[rgba(127,119,221,0.06)]">
          <div className="mx-auto max-w-[1600px] px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-xs text-muted">
                {quota.count} of {quota.limit} free generations this month
              </span>
              <Link
                href="/pricing"
                className="shrink-0 text-xs text-accent-secondary"
              >
                Upgrade
              </Link>
            </div>
            <div className="h-1 max-w-md overflow-hidden rounded-full bg-[#1e2233]">
              <div
                className="h-full bg-accent-secondary"
                style={{
                  width: `${Math.min(100, (quota.count / quota.limit) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 sm:px-6 lg:px-8">
        <GenerateForm />

        <div id="recent" className="border-t border-line py-6">
          <div className="mb-3 text-[11px] text-muted-2">Recent</div>
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-x-8">
            {history && history.length > 0 ? (
              history.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between gap-2 border-b border-line py-2 text-xs lg:border-none lg:py-0"
                >
                  <span className="min-w-0 truncate text-[#c7c9d9]">
                    {g.content_type}, {g.prompt}
                  </span>
                  <span className="shrink-0 text-[#5c5e70]">
                    {formatRelativeTime(g.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-placeholder">
                No generations yet.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
