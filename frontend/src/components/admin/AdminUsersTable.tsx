"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { listAdminUsers, updateAdminUserRole } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { AuthUser, UserRole } from "@/types/auth";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "user", label: "User" },
  { value: "caregiver", label: "Caregiver" },
  { value: "admin", label: "Admin" },
];

export default function AdminUsersTable() {
  const router = useRouter();
  const [users, setUsers] = useState<AuthUser[]>([]);
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

  async function handleRoleChange(userId: string, role: UserRole) {
    setActionId(userId);
    setError(null);
    setSuccess(null);

    try {
      await updateAdminUserRole(userId, role);
      setSuccess("User role updated.");
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
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
          <p className="mt-1 text-sm text-slate-600">Update access roles for platform users.</p>
        </div>
        <button onClick={() => void loadUsers()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Refresh
        </button>
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-600">Loading users...</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p> : null}

      {!loading && users.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No users found.</p>
      ) : null}

      {!loading && users.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                <th className="px-2 py-2 font-medium">User ID</th>
                <th className="px-2 py-2 font-medium">Email</th>
                <th className="px-2 py-2 font-medium">Role</th>
                <th className="px-2 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isBusy = actionId === user.id;

                return (
                  <tr key={user.id} className="border-b border-slate-100 align-top">
                    <td className="px-2 py-3 text-sm text-slate-700">{user.id}</td>
                    <td className="px-2 py-3 text-sm text-slate-800">{user.email}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{user.role}</td>
                    <td className="px-2 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {ROLE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => void handleRoleChange(user.id, option.value)}
                            disabled={isBusy || user.role === option.value}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-60"
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
        </div>
      ) : null}
    </section>
  );
}
