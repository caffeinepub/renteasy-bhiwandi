import { Building2, CheckCircle2, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAssignRoleMutation } from "../hooks/useQueries";

interface RoleSelectionPageProps {
  onRoleSelected: (role: "owner" | "renter") => void;
}

export function RoleSelectionPage({ onRoleSelected }: RoleSelectionPageProps) {
  // eslint-disable-next-line custom/require-internet-identity-provider
  const { identity } = useInternetIdentity();
  const [selectedRole, setSelectedRole] = useState<"owner" | "renter" | null>(
    null,
  );
  const assignRole = useAssignRoleMutation();

  const handleSelect = async (role: "owner" | "renter") => {
    if (!identity) return;
    setSelectedRole(role);
    try {
      await assignRole.mutateAsync({
        user: identity.getPrincipal(),
        role: UserRole.user,
      });
      localStorage.setItem("userRoleChoice", role);
      onRoleSelected(role);
      toast.success(`Welcome! You're registered as a ${role}.`);
    } catch (err) {
      toast.error("Failed to set role. Please try again.");
      setSelectedRole(null);
      console.error(err);
    }
  };

  const isLoading = assignRole.isPending;

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center px-4"
      style={{
        backgroundImage:
          "radial-gradient(oklch(var(--border)) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl hero-gradient shadow-lg mb-5">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-3">
            Welcome to RentEasy Bhiwandi
          </h1>
          <p className="text-muted-foreground font-body text-lg">
            How would you like to use the platform?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Owner Card */}
          <button
            type="button"
            onClick={() => !isLoading && handleSelect("owner")}
            disabled={isLoading}
            className={`group relative p-8 rounded-2xl border-2 transition-all duration-200 text-left animate-fade-in-up stagger-1 ${
              selectedRole === "owner" && isLoading
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary hover:bg-primary/3 hover:shadow-lg"
            } disabled:cursor-not-allowed`}
          >
            <div className="flex flex-col items-start gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                  selectedRole === "owner" && isLoading
                    ? "hero-gradient"
                    : "bg-primary/10 group-hover:bg-primary/20"
                }`}
              >
                {selectedRole === "owner" && isLoading ? (
                  <Loader2 className="h-7 w-7 text-white animate-spin" />
                ) : (
                  <Building2 className="h-7 w-7 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  I'm a Property Owner
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">
                  List your properties, manage tenants, and track your rental
                  income.
                </p>
                <ul className="space-y-1.5">
                  {[
                    "List unlimited properties",
                    "Manage tenants easily",
                    "Track rental income",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-muted-foreground font-body"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 text-primary font-body text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Get started →
              </div>
            </div>
          </button>

          {/* Renter Card */}
          <button
            type="button"
            onClick={() => !isLoading && handleSelect("renter")}
            disabled={isLoading}
            className={`group relative p-8 rounded-2xl border-2 transition-all duration-200 text-left animate-fade-in-up stagger-2 ${
              selectedRole === "renter" && isLoading
                ? "border-accent bg-accent/5"
                : "border-border bg-card hover:border-accent hover:bg-accent/3 hover:shadow-lg"
            } disabled:cursor-not-allowed`}
          >
            <div className="flex flex-col items-start gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                  selectedRole === "renter" && isLoading
                    ? "bg-accent"
                    : "bg-accent/10 group-hover:bg-accent/20"
                }`}
              >
                {selectedRole === "renter" && isLoading ? (
                  <Loader2 className="h-7 w-7 text-white animate-spin" />
                ) : (
                  <Users className="h-7 w-7 text-accent" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  I'm a Renter
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">
                  Browse available properties, filter by your needs, and find
                  your perfect home.
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Browse verified listings",
                    "Filter by budget & area",
                    "Contact owners directly",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-muted-foreground font-body"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 text-accent font-body text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Browse listings →
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
