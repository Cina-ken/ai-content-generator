import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { signUp } from "@/lib/auth-actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string; checkEmail?: string }>;
}) {
  const { error, redirectTo = "/generate", checkEmail } = await searchParams;

  return (
    <AuthCard
      title="Create your account"
      subtitle="Sign up to get 5 free generations every month."
      error={error}
      notice={
        checkEmail
          ? "Check your inbox to confirm your email, then sign in."
          : undefined
      }
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-accent-secondary"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form action={signUp} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Sign up
        </button>
      </form>
    </AuthCard>
  );
}
