"use client";

import { useState } from "react";
import { useCompletion } from "ai/react";
import { Play } from "lucide-react";
import { CONTENT_TYPES, type ContentType } from "@/lib/generate";

function parseErrorMessage(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { message?: string };
    return parsed.message ?? raw;
  } catch {
    return raw;
  }
}

export default function DemoPanel() {
  const [contentType, setContentType] = useState<ContentType>("blog-intro");
  const [topic, setTopic] = useState("a coffee shop opening in a college town");

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/demo",
    streamProtocol: "text",
  });

  const errorMessage = parseErrorMessage(error?.message);

  async function handleTryIt() {
    if (!topic.trim() || isLoading) return;
    await complete(topic, { body: { contentType } });
  }

  return (
    <div className="mx-5 rounded-xl border border-[color:rgba(127,119,221,0.25)] bg-panel-highlight p-4">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {CONTENT_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setContentType(type.value)}
            className={`rounded-full px-2.5 py-1.5 text-[11px] transition-colors ${
              contentType === type.value
                ? "bg-accent-soft text-[#c9c3f7]"
                : "border border-line-strong bg-panel text-muted-2"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Describe your topic"
          className="flex-1 rounded-lg border border-line-strong bg-panel px-3 py-2.5 text-xs text-ink placeholder:text-placeholder focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={handleTryIt}
          disabled={isLoading || !topic.trim()}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-accent px-4 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          <Play size={13} />
          Try it
        </button>
      </div>

      <div className="border-t border-line pt-3 text-xs leading-[1.7] text-ink-secondary min-h-[3.5rem]">
        {errorMessage ? (
          <span className="text-[#f0596c]">{errorMessage}</span>
        ) : completion ? (
          <>
            {completion}
            {isLoading && (
              <span className="ml-0.5 inline-block h-3 w-[2px] translate-y-[1px] bg-accent-secondary align-middle" />
            )}
          </>
        ) : (
          <span className="text-placeholder">
            {isLoading ? "Writing…" : "Your generated copy will appear here."}
          </span>
        )}
      </div>
    </div>
  );
}
