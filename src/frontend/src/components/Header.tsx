import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function Header() {
  const { currentUser, userProfile, logout } = useFirebaseAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!currentUser;
  const isOwner = userProfile?.role === "owner";

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
    navigate({ to: "/" });
  };

  const navLinks = [
    { to: "/", label: "Browse", icon: <Home className="h-4 w-4" /> },
    ...(isAuthenticated && isOwner
      ? [
          {
            to: "/dashboard",
            label: "Dashboard",
            icon: <LayoutDashboard className="h-4 w-4" />,
          },
        ]
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
            {isAuthenticated && userProfile && (
              <Badge
                variant="outline"
                className={`hidden sm:flex text-xs font-body font-medium capitalize border ${
                  userProfile.role === "owner"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-accent/10 text-accent border-accent/20"
                }`}
              >
                {userProfile.role}
              </Badge>
            )}
            {isAuthenticated && userProfile?.name && (
              <span className="hidden sm:block text-sm font-body text-muted-foreground truncate max-w-[120px]">
                {userProfile.name}
              </span>
            )}

            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="font-body font-medium"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Logout
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-body font-medium"
                  >
                    <LogIn className="h-4 w-4 mr-1.5" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="hero-gradient text-white border-0 hover:opacity-90 font-body font-medium"
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
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
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn className="h-4 w-4" /> Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-body font-medium text-primary hover:bg-primary/10"
                  onClick={() => setMobileOpen(false)}
                >
                  <UserPlus className="h-4 w-4" /> Register
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
      {/* Gradient accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </header>
  );
}
