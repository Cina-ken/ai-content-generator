"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStripe, PAID_PLAN_PRICE_ID } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function createCheckoutSession() {
  const user = await getCurrentUser();
  if (!user || !user.email) {
    redirect("/login?redirectTo=/pricing");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const origin = await getOrigin();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existing?.stripe_customer_id ?? undefined,
    customer_email: existing?.stripe_customer_id ? undefined : user.email,
    line_items: [{ price: PAID_PLAN_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  redirect(session.url);
}

export async function openBillingPortal() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/pricing");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    redirect("/pricing");
  }

  const origin = await getOrigin();
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${origin}/pricing`,
  });

  redirect(session.url);
}
