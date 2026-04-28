import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Elderly Nursing & Healthcare Assistant</h1>
        <p className="mt-3 text-slate-600">Start by registering or logging in.</p>
        <div className="mt-8 flex gap-4">
          <Link href="/login" className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white">
            Login
          </Link>
          <Link href="/register" className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-800">
            Register
          </Link>
        </div>
      </section>
    </main>
  );
}
