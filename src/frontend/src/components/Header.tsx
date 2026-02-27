import { Link, useRouterState } from "@tanstack/react-router";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, LayoutDashboard, LogIn, LogOut, Loader2, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  userRoleChoice: "owner" | "renter" | null;
}

export function Header({ userRoleChoice }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      localStorage.removeItem("userRoleChoice");
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const e = error as Error;
        if (e.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: "/", label: "Browse", icon: <Home className="h-4 w-4" /> },
    ...(isAuthenticated && userRoleChoice === "owner"
      ? [{ to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> }]
      : []),
  ];

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <header className="sticky top-0 z-50 border-b border-border glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg hero-gradient flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Home className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-foreground leading-none">
              RentEasy <span className="text-primary">Bhiwandi</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-body font-medium transition-colors relative ${
                  isActive(link.to)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.icon}
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated && userRoleChoice && (
              <Badge
                variant="outline"
                className={`hidden sm:flex text-xs font-body font-medium capitalize border ${
                  userRoleChoice === "owner"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-accent/10 text-accent border-accent/20"
                }`}
              >
                {userRoleChoice}
              </Badge>
            )}

            <Button
              variant={isAuthenticated ? "outline" : "default"}
              size="sm"
              onClick={handleAuth}
              disabled={isLoggingIn}
              className={`font-body font-medium ${
                !isAuthenticated ? "hero-gradient text-white border-0 hover:opacity-90" : ""
              }`}
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Login
                </>
              )}
            </Button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-border py-3 pb-4 flex flex-col gap-1 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
      {/* Gradient accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </header>
  );
}
