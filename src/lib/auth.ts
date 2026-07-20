import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export type SubscriptionStatus = "free" | "active" | "past_due" | "canceled";

export async function getSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  return (data?.status as SubscriptionStatus) ?? "free";
}

export async function isSubscribed(userId: string) {
  const status = await getSubscriptionStatus(userId);
  return status === "active";
}
