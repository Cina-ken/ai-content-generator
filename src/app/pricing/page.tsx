import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/auth";
import { createCheckoutSession, openBillingPortal } from "@/lib/billing-actions";
import { Footer } from "@/components/Footer";

const freeFeatures = [
  "5 generations every month",
  "4 content types",
  "Generation history",
];

const paidFeatures = [
  "Everything in Free",
  "Unlimited generations",
  "Priority support",
];

export default async function PricingPage() {
  const user = await getCurrentUser();
  const status = user ? await getSubscriptionStatus(user.id) : "free";
  const isActive = status === "active";

  return (
    <div className="flex flex-1 flex-col items-center bg-page">
      <div className="w-full max-w-3xl px-4 py-10">
        <Link
          href="/"
          className="mb-10 flex items-center justify-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-ink">ContentForge</span>
        </Link>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">
            Simple pricing
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Start free. Upgrade when you outgrow the monthly cap.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-panel p-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Free
            </span>
            <p className="mt-2 text-4xl font-bold text-ink">
              $0
              <span className="text-base font-medium text-muted">/month</span>
            </p>
            <p className="mt-2 text-sm text-muted">Enough to try it for real.</p>
            <ul className="mt-6 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink">
                  <Check size={16} className="mt-0.5 shrink-0 text-accent-secondary" />
                  {f}
                </li>
              ))}
            </ul>

            {!user && (
              <Link
                href="/signup?redirectTo=%2Fpricing"
                className="mt-8 block rounded-full border border-line py-2.5 text-center text-sm font-semibold text-ink hover:bg-panel-highlight"
              >
                Get started free
              </Link>
            )}
            {user && !isActive && (
              <div className="mt-8 rounded-full border border-line py-2.5 text-center text-sm font-medium text-muted">
                Your current plan
              </div>
            )}
            {user && isActive && (
              <div className="mt-8 rounded-full border border-line py-2.5 text-center text-sm font-medium text-muted">
                Included
              </div>
            )}
          </div>

          <div className="relative rounded-2xl border-2 border-accent bg-panel p-6">
            <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
              Most popular
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-accent-secondary">
              Unlimited
            </span>
            <p className="mt-2 text-4xl font-bold text-ink">
              $12
              <span className="text-base font-medium text-muted">/month</span>
            </p>
            <p className="mt-2 text-sm text-muted">
              For when 5 a month isn&apos;t enough.
            </p>
            <ul className="mt-6 space-y-3">
              {paidFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink">
                  <Check size={16} className="mt-0.5 shrink-0 text-accent-secondary" />
                  {f}
                </li>
              ))}
            </ul>

            {isActive ? (
              <form action={openBillingPortal}>
                <button
                  type="submit"
                  className="mt-8 w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
                >
                  Manage subscription
                </button>
              </form>
            ) : (
              <form action={createCheckoutSession}>
                <button
                  type="submit"
                  className="mt-8 w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
                >
                  {user ? "Upgrade to Unlimited" : "Sign in to upgrade"}
                </button>
              </form>
            )}
            <p className="mt-2 text-center text-xs text-muted">
              Recurring billing · Cancel anytime
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
