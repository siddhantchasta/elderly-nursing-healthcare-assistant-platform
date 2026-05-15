import Link from "next/link";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  type?: "login" | "register";
}

export default function AuthShell({
  title,
  subtitle,
  children,
  type = "login",
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT SIDE */}
        <section className="relative hidden overflow-hidden bg-[#dfe9e5] lg:flex">
          <div className="flex min-h-screen w-full flex-col justify-between px-14 py-12">
            {/* LOGO */}
            <div className="flex items-center gap-3">
              <div className="p-0">
                <img
                  src="/images/avatar.png"
                  alt="ElderCare Logo"
                  className="h-12 w-12 object-cover"
                />
              </div>

              <span className="text-3xl font-bold tracking-tight text-[#111111]">
                ElderCare
              </span>
            </div>

            {/* HERO TEXT */}
            <div className="max-w-2xl">
              <h1 className="text-[72px] font-black leading-[0.95] tracking-[-0.06em] text-[#111111]">
                {type === "login"
                  ? "Trusted care, less stress."
                  : "Care starts with connection."}
              </h1>

              <p className="mt-8 max-w-xl text-[24px] leading-10 text-[#5f6d68]">
                {type === "login"
                  ? "Manage caregivers, bookings, and elderly care services in one place."
                  : "Create your ElderCare account and begin managing home healthcare easily."}
              </p>
            </div>

            {/* FOOTER */}
            <p className="text-[15px] text-[#8ca09a]">
              © 2026 ElderCare. Built for modern elderly care.
            </p>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[460px]">
            {/* MOBILE LOGO */}
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="rounded-2xl bg-white p-1 shadow-sm">
                <img
                  src="/images/avatar.png"
                  alt="ElderCare Logo"
                  className="h-11 w-11 object-cover"
                />
              </div>

              <span className="text-2xl font-bold tracking-tight text-[#111111]">
                ElderCare
              </span>
            </div>

            {/* HEADER */}
            <div>
              <h2 className="text-[42px] font-black tracking-[-0.04em] text-[#111111]">
                {title}
              </h2>

              <p className="mt-3 text-[17px] text-[#6d7b76]">
                {subtitle}
              </p>
            </div>

            {/* FORM */}
            <div className="mt-10">{children}</div>

            {/* FOOTER TEXT */}
              <div className="mt-8 text-center text-[15px] text-[#6d7b76]">
                {type === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/register"
                      className="font-semibold text-[#ff6a3d]"
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    Have an account?{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-[#ff6a3d]"
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
          </div>
        </section>
      </div>
    </main>
  );
}