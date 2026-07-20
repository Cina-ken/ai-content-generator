import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 w-full border-t border-line px-5 py-6 text-center text-xs text-muted">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        <Link href="/pricing" className="hover:text-ink">
          Pricing
        </Link>
        <a
          href="https://github.com/Cina-ken/ai-content-generator"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-ink"
        >
          GitHub
        </a>
        <a href="mailto:support@contentforge.app" className="hover:text-ink">
          Contact
        </a>
      </div>
      <p className="mt-2">&copy; {year} ContentForge. All rights reserved.</p>
    </footer>
  );
}
