import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign In — MS Silks Dharmavaram" }] }),
  component: Auth,
});

type Mode = "login" | "signup" | "forgot" | "otp";

function Auth() {
  const [mode, setMode] = useState<Mode>("login");
  const navigate = useNavigate();

  const fakeSubmit = (e: React.FormEvent, msg: string, next?: Mode | "account") => {
    e.preventDefault();
    toast.success(msg);
    if (next === "account") navigate({ to: "/account" });
    else if (next) setMode(next);
  };

  return (
    <div className="container-luxe grid min-h-[70vh] place-items-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-soft"
      >
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold/60 font-display text-lg font-semibold text-primary">
            MS
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold">
            {mode === "login" && "Welcome Back"}
            {mode === "signup" && "Create Account"}
            {mode === "forgot" && "Reset Password"}
            {mode === "otp" && "Verify OTP"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" && "Sign in to continue shopping"}
            {mode === "signup" && "Join the MS Silks family"}
            {mode === "forgot" && "We'll send a reset link to your email"}
            {mode === "otp" && "Enter the 6-digit code sent to your phone"}
          </p>
        </div>

        {mode === "login" && (
          <form onSubmit={(e) => fakeSubmit(e, "Signed in successfully", "account")} className="mt-6 space-y-4">
            <div>
              <Label className="mb-1.5 block text-sm">Email or Phone</Label>
              <Input type="text" required placeholder="you@example.com" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-sm">Password</Label>
                <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                  Forgot?
                </button>
              </div>
              <Input type="password" required placeholder="••••••••" />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">
              Sign In
            </Button>
            <Button type="button" variant="luxeOutline" size="lg" className="w-full" onClick={() => setMode("otp")}>
              Sign in with OTP
            </Button>
            <GoogleButton />
            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <button type="button" onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">
                Create an account
              </button>
            </p>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={(e) => fakeSubmit(e, "Account created!", "otp")} className="mt-6 space-y-4">
            <div>
              <Label className="mb-1.5 block text-sm">Full Name</Label>
              <Input required placeholder="Your name" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Email</Label>
              <Input type="email" required placeholder="you@example.com" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Phone</Label>
              <Input type="tel" required placeholder="+91 …" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Password</Label>
              <Input type="password" required placeholder="Create a password" />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">
              Create Account
            </Button>
            <GoogleButton />
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("login")} className="font-medium text-primary hover:underline">
                Sign in
              </button>
            </p>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={(e) => fakeSubmit(e, "Reset link sent to your email", "login")} className="mt-6 space-y-4">
            <div>
              <Label className="mb-1.5 block text-sm">Email</Label>
              <Input type="email" required placeholder="you@example.com" />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">
              Send Reset Link
            </Button>
            <button type="button" onClick={() => setMode("login")} className="w-full text-center text-sm text-primary hover:underline">
              Back to sign in
            </button>
          </form>
        )}

        {mode === "otp" && (
          <form onSubmit={(e) => fakeSubmit(e, "Verified successfully", "account")} className="mt-6 space-y-5">
            <div className="flex justify-center">
              <InputOTP maxLength={6}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">
              Verify
            </Button>
            <button type="button" onClick={() => toast("OTP resent")} className="w-full text-center text-sm text-primary hover:underline">
              Resend code
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/policies/$slug" params={{ slug: "terms" }} className="underline">
            Terms
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}

function GoogleButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      onClick={() => toast("Google Sign-In connects once Cloud is enabled")}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </Button>
  );
}
