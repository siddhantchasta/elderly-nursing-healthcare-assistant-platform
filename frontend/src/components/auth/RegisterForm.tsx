"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { registerUser } from "@/lib/api/endpoints";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "caregiver">("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await registerUser({ email, password, role });
      router.push("/login");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Unexpected error during registration");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          placeholder="Create a secure password"
          className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">Must be at least 6 characters</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="role">
          I am registering as
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("user")}
            className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
              role === "user"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <span className="block text-base">Family Member</span>
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
              Seeking care for a loved one
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRole("caregiver")}
            className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
              role === "caregiver"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <span className="block text-base">Caregiver</span>
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
              Professional care provider
            </span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
        </div>
      </div>

      <Link
        href="/login"
        className="block w-full rounded-md border border-border bg-background px-4 py-3 text-center font-medium text-foreground transition-colors hover:bg-muted"
      >
        Sign In Instead
      </Link>
    </form>
  );
}
