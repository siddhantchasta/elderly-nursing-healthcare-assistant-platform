export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-md rounded-2xl bg-white p-7 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
