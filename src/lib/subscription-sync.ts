import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): "free" | "active" | "past_due" | "canceled" {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "free";
  }
}

export async function syncSubscriptionToSupabase(params: {
  userId: string;
  customerId: string;
  subscription: Stripe.Subscription;
}) {
  const { userId, customerId, subscription } = params;
  const admin = createAdminClient();

  const status = mapStripeStatus(subscription.status);
  const item = subscription.items.data[0];
  const priceId = item?.price.id ?? null;
  const periodEndUnix = item?.current_period_end;

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status,
      price_id: priceId,
      current_period_end: periodEndUnix
        ? new Date(periodEndUnix * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}
