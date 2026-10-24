import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { signOutUser } from "@/integrations/firebase/client";
import { Button } from "@/components/ui/button";
import { GUIDE_META } from "@/lib/guide";

const NAV = [
  { to: "/discover", label: "Discover" },
  { to: "/recreate", label: "RE:CREATE" },
  { to: "/collection", label: "Collection" },
  { to: "/journey", label: "Journey" },
  { to: "/guide", label: "Guide" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-baseline gap-1">
      <span className="font-display text-3xl leading-none">Sahi</span>
      <span className="font-display text-3xl italic leading-none text-primary">Sort</span>
    </Link>
  );
}

export function SiteHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="border-b border-border/50 bg-sage/40 px-4 py-1 text-center text-[11px] sm:text-xs text-muted-foreground">
        <span>
          Rules for:{" "}
          <strong className="font-semibold text-foreground">
            {GUIDE_META.locality}
          </strong>{" "}
          —{" "}
          <Link to="/guide" className="underline hover:text-primary">
            {GUIDE_META.guide_title}
          </Link>
        </span>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="ghost" size="sm" onClick={() => signOutUser()}>
              Sign out
            </Button>
          ) : null}
          <Button asChild size="sm" className="shrink-0 rounded-full">
            <Link to="/discover">
              <span className="sm:hidden">Discover</span>
              <span className="hidden sm:inline">Discover an object</span>
            </Link>
          </Button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="shrink-0 rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors active:scale-95"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-sage">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Sort it right. Give it a second life.
          </p>
          <p className="mt-3 text-xs font-semibold text-foreground">
            Rules for: {GUIDE_META.locality} — {GUIDE_META.guide_title}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Source: <a href={GUIDE_META.guide_source} target="_blank" rel="noreferrer" className="underline">{GUIDE_META.guide_source}</a> (Updated {GUIDE_META.last_updated})
          </p>
          <p className="mt-4 max-w-md text-xs text-muted-foreground">
            SahiSort's AI can be wrong. Disposal guidance is based on summaries of India's national
            waste rules and does not cover your municipality's collection schedules or facilities.
            Always follow local instructions.
          </p>
        </div>
        <div className="grid content-start gap-2 text-sm">
          <p className="text-eyebrow text-muted-foreground">Product</p>
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="hover:text-primary">
              {n.label}
            </Link>
          ))}
        </div>
        <div className="grid content-start gap-2 text-sm">
          <p className="text-eyebrow text-muted-foreground">SahiSort</p>
          <Link to="/about" className="hover:text-primary">
            About
          </Link>
          <Link to="/guide" className="hover:text-primary">
            How evidence works
          </Link>
        </div>
      </div>
    </footer>
  );
}
