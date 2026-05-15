"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { RefreshCcw } from "lucide-react";

import { ApiClientError } from "@/lib/api/client";

import {
  listAdminUsers,
  updateAdminUserRole,
} from "@/lib/api/endpoints";

import { getSessionUser } from "@/lib/auth/session";

import type { UserRole } from "@/types/auth";

import type { AdminUserListItem } from "@/types/admin";

const ROLE_OPTIONS: {
  value: UserRole;
  label: string;
}[] = [
  { value: "user", label: "User" },
  { value: "caregiver", label: "Caregiver" },
  { value: "admin", label: "Admin" },
];

const ROLE_STYLES: Record<UserRole, string> = {
  user: "bg-[#1d2430] text-[#c7d2fe]",
  caregiver: "bg-[#1d2a26] text-[#9fe3c5]",
  admin: "bg-[#2b211d] text-[#ffb38f]",
};

export default function AdminUsersTable() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUserListItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [actionId, setActionId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);

    setError(null);

    try {
      const data = await listAdminUsers();

      setUsers(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401 || err.status === 403) {
          router.replace("/login");

          return;
        }

        setError(err.message);
      } else {
        setError("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const user = getSessionUser();

    if (!user || user.role !== "admin") {
      router.replace("/login");

      return;
    }

    const timer = setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, loadUsers]);

  async function handleRoleChange(
    userId: string,
    role: UserRole
  ) {
    setActionId(userId);

    setError(null);

    setSuccess(null);

    try {
      await updateAdminUserRole(userId, role);

      setSuccess("User role updated successfully.");

      await loadUsers();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to update user role");
      }
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/3 backdrop-blur-xl">
      {/* TOP */}
      <div className="border-b border-white/10 px-7 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Platform Users
            </h2>

            <p className="mt-2 text-[15px] text-white/45">
              Manage permissions and roles across the ElderCare ecosystem.
            </p>
          </div>

          <button
            onClick={() => void loadUsers()}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="px-7 py-16 text-center text-white/50">
            Loading users...
          </div>
        ) : null}

        {!loading && users.length === 0 ? (
          <div className="px-7 py-16 text-center text-white/50">
            No users found.
          </div>
        ) : null}

        {!loading && users.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-7 py-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  User
                </th>

                <th className="px-7 py-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  Role
                </th>

                <th className="px-7 py-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  Joined
                </th>

                <th className="px-7 py-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => {
                const isBusy = actionId === user.id;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-white/6 transition hover:bg-white/2.5"
                  >
                    <td className="px-7 py-6">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {user.email}
                        </p>

                        <p className="mt-1 text-xs text-white/35">
                          {user.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-7 py-6">
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${ROLE_STYLES[user.role]}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-7 py-6 text-sm text-white/60">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-7 py-6">
                      <div className="flex flex-wrap gap-2">
                        {ROLE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              void handleRoleChange(
                                user.id,
                                option.value
                              )
                            }
                            disabled={
                              isBusy ||
                              user.role === option.value
                            }
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                              user.role === option.value
                                ? "bg-[#ff6a3d] text-white"
                                : "border border-white/10 bg-white/4 text-white/70 hover:bg-white/8 hover:text-white"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </div>
    </section>
  );
}