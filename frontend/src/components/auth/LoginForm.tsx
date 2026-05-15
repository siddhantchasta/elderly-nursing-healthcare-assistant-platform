"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";

import { ApiClientError } from "@/lib/api/client";
import { loginUser } from "@/lib/api/endpoints";
import { setSession } from "@/lib/auth/session";

function getRoleHome(role: string) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "caregiver") return "/caregiver/dashboard";
  return "/user/dashboard";
}

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const data = await loginUser({ email, password });

      setSession(data.token, data.user);

      router.push(getRoleHome(data.user.role));
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Unexpected error during login");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {/* EMAIL */}
      <div>
        <label
          htmlFor="email"
          className="mb-3 block text-sm font-semibold text-[#111111]"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          required
          placeholder="jane@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-14 w-full rounded-2xl border border-[#d8d8d8] bg-white px-5 text-[15px] outline-none transition focus:border-[#ff6a3d]"
        />
      </div>

      {/* PASSWORD */}
      <div>
        <label
          htmlFor="password"
          className="mb-3 block text-sm font-semibold text-[#111111]"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-14 w-full rounded-2xl border border-[#d8d8d8] bg-white px-5 text-[15px] outline-none transition focus:border-[#ff6a3d]"
        />
      </div>

      {/* ERROR */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* BUTTON */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#ff6a3d] text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}

        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}