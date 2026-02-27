import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { Building2, Loader2, Lock, Mail, User, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

export function RegisterPage() {
  const { registerWithEmail } = useFirebaseAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "renter" | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    general?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim() || name.trim().length < 2) {
      e.name = "Name must be at least 2 characters.";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Enter a valid email address.";
    }
    if (!password || password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }
    if (!role) {
      e.role = "Please select your role.";
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      await registerWithEmail(
        name.trim(),
        email.trim(),
        password,
        role as "owner" | "renter",
      );
      setVerificationSent(true);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      if (msg.includes("email-already-in-use")) {
        setErrors({ email: "This email is already registered." });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center px-4 py-12"
        style={{
          backgroundImage:
            "radial-gradient(oklch(var(--border)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="relative w-full max-w-lg">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm animate-fade-in-up text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 mb-5">
              <Mail className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              Check your email
            </h2>
            <p className="font-body text-muted-foreground mb-6">
              We sent a verification link to{" "}
              <strong className="text-foreground">{email}</strong>. Please
              verify your email before logging in.
            </p>
            <Link to="/login">
              <Button className="hero-gradient text-white border-0 hover:opacity-90 font-body font-medium w-full h-11">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center px-4 py-12"
      style={{
        backgroundImage:
          "radial-gradient(oklch(var(--border)) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl hero-gradient shadow-lg mb-5">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
            Create account
          </h1>
          <p className="font-body text-muted-foreground">
            Join RentEasy Bhiwandi today
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm animate-fade-in-up stagger-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-body">
                {errors.general}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="font-body font-medium text-sm">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="Your full name"
                  className={`pl-10 font-body ${errors.name ? "border-destructive" : ""}`}
                />
              </div>
              {errors.name && (
                <p className="text-destructive text-xs font-body">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-email"
                className="font-body font-medium text-sm"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="you@example.com"
                  className={`pl-10 font-body ${errors.email ? "border-destructive" : ""}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs font-body">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-password"
                className="font-body font-medium text-sm"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="Min. 6 characters"
                  className={`pl-10 font-body ${errors.password ? "border-destructive" : ""}`}
                  autoComplete="new-password"
                />
              </div>
              {errors.password && (
                <p className="text-destructive text-xs font-body">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-body font-medium text-sm">I am a...</Label>
              {errors.role && (
                <p className="text-destructive text-xs font-body">
                  {errors.role}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRole("owner");
                    setErrors((p) => ({ ...p, role: undefined }));
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                    role === "owner"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <Building2
                    className={`h-6 w-6 mb-2 ${role === "owner" ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <p className="font-display font-semibold text-sm text-foreground">
                    Property Owner
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">
                    List & manage properties
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole("renter");
                    setErrors((p) => ({ ...p, role: undefined }));
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                    role === "renter"
                      ? "border-accent bg-accent/5"
                      : "border-border bg-card hover:border-accent/50"
                  }`}
                >
                  <Users
                    className={`h-6 w-6 mb-2 ${role === "renter" ? "text-accent" : "text-muted-foreground"}`}
                  />
                  <p className="font-display font-semibold text-sm text-foreground">
                    Renter
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">
                    Browse & find rentals
                  </p>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full hero-gradient text-white border-0 hover:opacity-90 font-body font-medium h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm font-body text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
