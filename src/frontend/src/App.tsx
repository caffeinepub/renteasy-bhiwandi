import { useState, useEffect } from "react";
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  Navigate,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { BrowsePage } from "./pages/BrowsePage";
import { PropertyDetailPage } from "./pages/PropertyDetailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RoleSelectionPage } from "./pages/RoleSelectionPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerRole } from "./hooks/useQueries";
import { UserRole } from "./backend.d";
import { Loader2 } from "lucide-react";

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell() {
  const [userRoleChoice, setUserRoleChoice] = useState<"owner" | "renter" | null>(() => {
    const stored = localStorage.getItem("userRoleChoice");
    if (stored === "owner" || stored === "renter") return stored;
    return null;
  });

  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: callerRole, isLoading: roleLoading } = useGetCallerRole();

  // Sync: if user already has role "user" in backend and localStorage choice, keep it
  // If user logs out, clear role choice
  useEffect(() => {
    if (!isAuthenticated) {
      setUserRoleChoice(null);
    }
  }, [isAuthenticated]);

  // Check backend role: if guest and stored choice exists, also store choice again
  useEffect(() => {
    if (isAuthenticated && callerRole === UserRole.user) {
      const stored = localStorage.getItem("userRoleChoice");
      if (stored === "owner" || stored === "renter") {
        setUserRoleChoice(stored);
      }
    }
  }, [isAuthenticated, callerRole]);

  const handleRoleSelected = (role: "owner" | "renter") => {
    setUserRoleChoice(role);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl hero-gradient flex items-center justify-center animate-pulse">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
          <p className="font-body text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show role selection if authenticated but no role chosen yet
  if (isAuthenticated && !roleLoading && (callerRole === UserRole.guest || callerRole === undefined) && !userRoleChoice) {
    return (
      <>
        <RoleSelectionPage onRoleSelected={handleRoleSelected} />
        <Toaster richColors />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userRoleChoice={userRoleChoice} />
      <Outlet />
      <Footer />
      <Toaster richColors />
    </div>
  );
}

// ─── Dashboard Guard ──────────────────────────────────────────────────────────

function DashboardGuard() {
  const { identity } = useInternetIdentity();
  const userRoleChoice = localStorage.getItem("userRoleChoice");

  if (!identity) {
    return <Navigate to="/" />;
  }

  if (userRoleChoice !== "owner") {
    return <Navigate to="/" />;
  }

  return <DashboardPage />;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: BrowsePage,
});

const propertyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/property/$id",
  component: PropertyDetailPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardGuard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  propertyRoute,
  dashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
