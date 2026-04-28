import Link from "next/link";
import CaregiversCatalog from "@/components/user/CaregiversCatalog";

export default function UserCaregiversPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Caregiver Directory</h1>
          <Link href="/user/dashboard" className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">
            Back to Dashboard
          </Link>
        </div>

        <CaregiversCatalog />
      </div>
    </main>
  );
}
