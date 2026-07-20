import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { signIn } from "@/lib/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const { error, redirectTo = "/generate" } = await searchParams;

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back. Sign in to keep generating."
      error={error}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-accent-secondary"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form action={signIn} className="space-y-4">
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
            autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Sign in
        </button>
      </form>
    </AuthCard>
  );
}
