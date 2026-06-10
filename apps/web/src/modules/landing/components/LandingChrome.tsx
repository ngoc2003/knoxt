import { ArrowRight, Menu } from "lucide-react";
import { Link } from "react-router";
import LogoSquare from "@/shared/components/LogoSquare";
import { Button } from "@/shared/ui/button";
import { PrimaryActionProps } from "../types/landing";

export function LandingHeader({
  href,
  label,
  loading,
  isAuthenticated,
  isTransitioning,
  linkProps,
}: PrimaryActionProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="Knoxt.io home"
        >
          <LogoSquare alt="" className="size-9 rounded-lg" />
          <span className="text-lg font-semibold tracking-tight">Knoxt.io</span>
        </Link>

        <nav
          aria-label="Landing page sections"
          className="hidden items-center gap-8 md:flex"
        >
          {[
            ["Features", "#features"],
            ["Workflow", "#workflow"],
            ["Sharing", "#sharing"],
            ["Pricing", "#pricing"],
            ["Contact", "#contact"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#4f2fdf]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && !isAuthenticated && (
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
          <Button
            asChild={!loading}
            disabled={loading || isTransitioning}
            className="bg-[#4f2fdf] text-white shadow-sm shadow-[#d9d0ff] hover:bg-[#4124c7]"
          >
            {loading ? (
              <span>Checking session...</span>
            ) : (
              <Link to={href} {...linkProps}>
                {label}
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="Knoxt.io home"
        >
          <LogoSquare alt="" className="size-8 rounded-lg" />
          <span className="font-semibold">Knoxt.io</span>
        </Link>
        <p className="text-sm text-slate-500">
          Project knowledge, preserved and discoverable.
        </p>
        <p className="text-sm text-slate-500">© 2026 Knoxt.io</p>
      </div>
    </footer>
  );
}
