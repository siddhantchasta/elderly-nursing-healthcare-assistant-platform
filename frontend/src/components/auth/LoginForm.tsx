"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
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
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Login"}
      </button>

      <p className="text-sm text-slate-600">
        New here?{" "}
        <Link href="/register" className="font-medium text-blue-600">
          Create account
        </Link>
      </p>
    </form>
  );
}
