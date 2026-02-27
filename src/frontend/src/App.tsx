import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { useFirebaseAuth } from "./hooks/useFirebaseAuth";
import { BrowsePage } from "./pages/BrowsePage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { PropertyDetailPage } from "./pages/PropertyDetailPage";
import { RegisterPage } from "./pages/RegisterPage";

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell() {
  const { loading } = useFirebaseAuth();

  if (loading) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Outlet />
      <Footer />
      <Toaster richColors />
    </div>
  );
}

// ─── Dashboard Guard ──────────────────────────────────────────────────────────

function DashboardGuard() {
  const { currentUser, userProfile, loading } = useFirebaseAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;
  if (userProfile?.role !== "owner") return <Navigate to="/" />;
  return <DashboardPage />;
}

// ─── Auth-Only Shell (no Header/Footer for login/register) ───────────────────

function AuthOnlyShell() {
  return (
    <>
      <Outlet />
      <Toaster richColors />
    </>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: AuthOnlyShell });

const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "main",
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/",
  component: BrowsePage,
});

const propertyRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/property/$id",
  component: PropertyDetailPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/dashboard",
  component: DashboardGuard,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren([indexRoute, propertyRoute, dashboardRoute]),
  loginRoute,
  registerRoute,
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
