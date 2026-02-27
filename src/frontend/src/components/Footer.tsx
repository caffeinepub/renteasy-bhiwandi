import { Link } from "@tanstack/react-router";
import { Heart, Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top row: logo + links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand column */}
          <div className="sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center shadow-sm">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-semibold text-lg text-foreground leading-none">
                RentEasy <span className="text-primary">Bhiwandi</span>
              </span>
            </Link>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Find your perfect rental in Bhiwandi
            </p>
          </div>

          {/* Spacer on mobile */}
          <div className="hidden sm:block" />

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-body font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-3">
                Explore
              </p>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="font-body text-sm text-foreground/70 hover:text-primary transition-colors"
                  >
                    Browse Properties
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="font-body text-sm text-foreground/70 hover:text-primary transition-colors"
                  >
                    Owner Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-body font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-3">
                Platform
              </p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://caffeine.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm text-foreground/70 hover:text-primary transition-colors"
                  >
                    caffeine.ai
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-display font-semibold text-foreground">
            <span className="text-sm">RentEasy</span>
            <span className="text-primary text-sm">Bhiwandi</span>
          </div>
          <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
            © 2026. Built with{" "}
            <Heart className="h-3 w-3 fill-primary text-primary" /> using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
