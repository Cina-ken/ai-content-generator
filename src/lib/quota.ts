import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const FREE_MONTHLY_QUOTA = 5;

export function getCurrentMonthKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Atomically checks and increments the caller's quota via the increment_quota
// RPC (security definer, see supabase/schema.sql) — never do a separate
// SELECT-then-INSERT here, that reintroduces the race condition the RPC
// exists to close. Uses the admin client because quota_counters has no
// authenticated-role write policy; the RPC itself is the only write path.
export async function checkAndIncrementQuota(
  userId: string
): Promise<{ allowed: boolean; count: number | null }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("increment_quota", {
    p_user_id: userId,
    p_month: getCurrentMonthKey(),
    p_limit: FREE_MONTHLY_QUOTA,
  });

  if (error) {
    // Fail closed, not open — an RPC error must not be treated as "allowed."
    throw new Error(`Quota check failed: ${error.message}`);
  }

  // increment_quota returns NULL when the free-tier cap is already hit.
  return { allowed: data !== null, count: data };
}

export async function getQuotaStatus(
  userId: string
): Promise<{ count: number; limit: number }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quota_counters")
    .select("count")
    .eq("user_id", userId)
    .eq("month", getCurrentMonthKey())
    .maybeSingle();

  return { count: data?.count ?? 0, limit: FREE_MONTHLY_QUOTA };
}
