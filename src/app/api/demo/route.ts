import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildPrompt, CONTENT_TYPES, type ContentType } from "@/lib/generate";

// Public, unauthenticated preview — deliberately simple rate-limiting for a
// portfolio-scoped demo, not a robust defense. A cookie blocks repeat use
// from the same browser; a per-IP counter is a secondary speed-bump against
// a single script hammering the endpoint. The in-memory Map resets on every
// cold start/redeploy — an accepted, documented tradeoff, not a bug.
const DEMO_COOKIE = "demo_used";
const MAX_DEMO_TOKENS = 120;
const MAX_HITS_PER_IP = 5;
const ipHits = new Map<string, number>();

function hasUsedDemo(req: Request): boolean {
  const cookieHeader = req.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .some((c) => c.trim().startsWith(`${DEMO_COOKIE}=`));
}

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: Request) {
  if (hasUsedDemo(req)) {
    return Response.json(
      {
        error: "demo_used",
        message: "You've used your free preview — sign up for 5 free every month.",
      },
      { status: 429 }
    );
  }

  const ip = getClientIp(req);
  const hits = ipHits.get(ip) ?? 0;
  if (hits >= MAX_HITS_PER_IP) {
    return Response.json(
      { error: "rate_limited", message: "Too many requests — try again later." },
      { status: 429 }
    );
  }

  // useCompletion's complete(text, { body }) posts { prompt: text, ...body }.
  const { prompt: topic, contentType } = (await req.json()) as {
    prompt: string;
    contentType: ContentType;
  };

  if (!topic?.trim()) {
    return Response.json({ error: "topic_required" }, { status: 400 });
  }
  if (!CONTENT_TYPES.some((c) => c.value === contentType)) {
    return Response.json({ error: "invalid_content_type" }, { status: 400 });
  }

  ipHits.set(ip, hits + 1);

  const prompt = buildPrompt(contentType, "casual", topic);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    prompt,
    maxTokens: MAX_DEMO_TOKENS,
    onError: ({ error }) => {
      console.error("streamText error in /api/demo:", error);
    },
  });

  const response = result.toTextStreamResponse();
  response.headers.append(
    "Set-Cookie",
    `${DEMO_COOKIE}=1; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax`
  );
  return response;
}
