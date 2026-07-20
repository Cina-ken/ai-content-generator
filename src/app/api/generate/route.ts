import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@/lib/supabase/server";
import { isSubscribed } from "@/lib/auth";
import { checkAndIncrementQuota } from "@/lib/quota";
import { buildPrompt, type ContentType, type Tone } from "@/lib/generate";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // useCompletion's complete(text, { body }) posts { prompt: text, ...body } —
  // "prompt" here is the raw topic the user typed, not the composed model prompt.
  const { prompt: topic, contentType, tone } = (await req.json()) as {
    prompt: string;
    contentType: ContentType;
    tone: Tone;
  };

  if (!topic?.trim()) {
    return Response.json({ error: "topic_required" }, { status: 400 });
  }

  const subscribed = await isSubscribed(user.id);
  if (!subscribed) {
    const { allowed } = await checkAndIncrementQuota(user.id);
    if (!allowed) {
      // Rejected before the OpenAI call ever happens — the atomic RPC
      // already charged nothing, so no cost was incurred here.
      return Response.json(
        {
          error: "quota_exceeded",
          message: "You've used all 5 free generations this month.",
        },
        { status: 402 }
      );
    }
  }

  const prompt = buildPrompt(contentType, tone, topic);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    prompt,
    onError: ({ error }) => {
      // toTextStreamResponse() has no error-framing in the wire protocol, so a
      // model-call failure otherwise surfaces to the client as a silent empty
      // 200 stream. Logging here is the only visibility into that failure.
      console.error("streamText error in /api/generate:", error);
    },
    onFinish: async ({ text }) => {
      // Quota was already charged above, once the model call started — this
      // insert only records the result and never gates the request. A client
      // disconnecting mid-stream skips this write, not the quota charge.
      await supabase.from("generations").insert({
        user_id: user.id,
        content_type: contentType,
        prompt: topic,
        output: text,
      });
    },
  });

  return result.toTextStreamResponse();
}
