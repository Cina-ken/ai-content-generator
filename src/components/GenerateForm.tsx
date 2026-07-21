"use client";

import { useState } from "react";
import { useCompletion } from "ai/react";
import { useRouter } from "next/navigation";
import { Sparkles, Copy, Bookmark, ChevronDown } from "lucide-react";
import { CONTENT_TYPES, TONES, type ContentType, type Tone } from "@/lib/generate";
import { createCheckoutSession } from "@/lib/billing-actions";

function parseError(raw: string | undefined): { type: string; message: string } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { error?: string; message?: string };
    return { type: parsed.error ?? "error", message: parsed.message ?? raw };
  } catch {
    return { type: "error", message: raw };
  }
}

export default function GenerateForm() {
  const router = useRouter();
  const [contentType, setContentType] = useState<ContentType>("blog-intro");
  const [tone, setTone] = useState<Tone>("professional");
  const [topic, setTopic] = useState("");
  const [copied, setCopied] = useState(false);

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/generate",
    streamProtocol: "text",
    onFinish: () => {
      // Refreshes the server-rendered quota bar and Recent list, which read
      // straight from Supabase — the generation was already persisted
      // server-side in the route's onFinish before this client callback fires.
      router.refresh();
    },
  });

  const parsedError = parseError(error?.message);

  async function handleGenerate() {
    if (!topic.trim() || isLoading) return;
    setCopied(false);
    await complete(topic, { body: { contentType, tone } });
  }

  function handleCopy() {
    if (!completion) return;
    navigator.clipboard.writeText(completion);
    setCopied(true);
  }

  return (
    <div className="grid grid-cols-1 border-b border-line py-6 md:grid-cols-[280px_1fr] md:gap-8">
      <div className="flex flex-col gap-3 border-b border-line pb-6 md:border-b-0 md:pb-0">
        <div>
          <div className="mb-1.5 text-[11px] text-muted-2">Content type</div>
          <div className="relative">
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full appearance-none rounded-lg border border-line-strong bg-panel px-2.5 py-2 text-xs text-ink"
            >
              {CONTENT_TYPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-2"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[11px] text-muted-2">Topic</div>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What should this be about?"
            rows={3}
            className="w-full resize-none rounded-lg border border-line-strong bg-panel px-2.5 py-2 text-xs text-ink placeholder:text-placeholder focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <div className="mb-1.5 text-[11px] text-muted-2">Tone</div>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTone(t.value)}
                className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                  tone === t.value
                    ? "bg-accent-soft text-[#c9c3f7]"
                    : "border border-line-strong bg-panel text-muted-2"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className="mt-0.5 flex items-center justify-center gap-1.5 rounded-lg bg-accent py-2.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          <Sparkles size={14} />
          Generate
        </button>
      </div>

      <div className="flex min-h-[200px] flex-col gap-3.5 pt-6 md:border-l md:border-line md:pt-0 md:pl-8">
        <div className="max-w-2xl flex-1">
          {parsedError?.type === "quota_exceeded" ? (
            <div className="rounded-xl border border-line bg-panel-highlight p-4">
              <p className="text-sm text-ink">{parsedError.message}</p>
              <form action={createCheckoutSession}>
                <button
                  type="submit"
                  className="mt-3 rounded-full bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover"
                >
                  Upgrade to Unlimited
                </button>
              </form>
            </div>
          ) : parsedError ? (
            <p className="text-xs text-[#f0596c]">{parsedError.message}</p>
          ) : completion ? (
            <p className="text-[13px] leading-[1.7] text-ink-secondary sm:text-sm">
              {completion}
              {isLoading && (
                <span className="ml-0.5 inline-block h-[13px] w-[2px] translate-y-[2px] bg-accent-secondary align-middle" />
              )}
            </p>
          ) : (
            <p className="text-[13px] text-placeholder sm:text-sm">
              {isLoading ? "Writing…" : "Your generated copy will appear here."}
            </p>
          )}
        </div>

        {completion && !parsedError && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md border border-line-strong px-2.5 py-1.5 text-[11px] text-[#c7c9d9] transition-colors hover:bg-panel"
            >
              <Copy size={12} />
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              disabled
              title="Automatically saved to history once generation finishes"
              className="flex items-center gap-1.5 rounded-md border border-line-strong px-2.5 py-1.5 text-[11px] text-[#c7c9d9] opacity-70"
            >
              <Bookmark size={12} />
              Saved
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
