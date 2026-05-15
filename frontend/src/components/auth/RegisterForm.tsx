"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";

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
      await registerUser({
        email,
        password,
        role,
      });

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
          minLength={6}
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-14 w-full rounded-2xl border border-[#d8d8d8] bg-white px-5 text-[15px] outline-none transition focus:border-[#ff6a3d]"
        />
      </div>

      {/* ROLE */}
      <div>
        <label
          htmlFor="role"
          className="mb-3 block text-sm font-semibold text-[#111111]"
        >
          Role
        </label>

        <select
          id="role"
          value={role}
          onChange={(event) =>
            setRole(event.target.value as "user" | "caregiver")
          }
          className="h-14 w-full rounded-2xl border border-[#d8d8d8] bg-white px-5 text-[15px] outline-none transition focus:border-[#ff6a3d]"
        >
          <option value="user">User / Family</option>
          <option value="caregiver">Caregiver</option>
        </select>
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
        {isSubmitting ? "Creating account..." : "Create account"}

        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}