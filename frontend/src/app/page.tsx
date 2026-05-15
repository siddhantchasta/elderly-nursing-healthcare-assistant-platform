import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

const features = [
  {
    title: "Book care in minutes",
    description:
      "Choose a service, pick a verified caregiver, schedule by the hour, day, or long-term. No phone tag, no agencies.",
    image: "/images/feature-1.png",
  },
  {
    title: "Verified caregivers only",
    description:
      "Every nurse, attendant, and physiotherapist is background-checked, qualified, and reviewed by the families they serve.",
    image: "/images/feature-2.png",
  },
  {
    title: "Track every visit",
    description:
      "Live service status, care notes after each visit, and clear updates so the whole family stays in the loop.",
    image: "/images/feature-3.png",
  },
];

const stats = [
  {
    value: "12k+",
    label: "Care visits completed",
  },
  {
    value: "1,800+",
    label: "Verified caregivers",
  },
  {
    value: "< 2 hrs",
    label: "Average response time",
  },
  {
    value: "4.9/5",
    label: "Family satisfaction score",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#f7f7f5] text-[#111111]">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pb-28 lg:pt-10">
        {/* NAVBAR */}
        <nav className="flex items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white p-1 shadow-sm">
              <img
                src="/images/avatar.png"
                alt="ElderCare Logo"
                className="h-12 w-12 object-cover"
              />
            </div>

            <span className="text-2xl font-bold tracking-tight">
              ElderCare
            </span>
          </div>

          {/* NAV LINKS */}
          <div className="hidden items-center gap-10 text-[15px] font-medium text-[#4b4b4b] md:flex">
            <a href="#features">Features</a>
            <a href="#families">Families</a>
            <a href="#contact">Contact</a>
          </div>

          {/* CTA */}
          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-full bg-[#ff6a3d] px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] md:inline-flex"
          >
            Join as a caregiver
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        {/* HERO CONTENT */}
        <div className="mt-14 grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* LEFT */}
          <div className="max-w-xl">
            <h1 className="text-[42px] font-black leading-[0.95] tracking-[-0.05em] text-[#111111] sm:text-[58px] lg:text-[72px]">
              Trusted home care for the ones who raised us
            </h1>

            <p className="mt-7 max-w-xl text-[17px] leading-8 text-[#666666] sm:text-[18px]">
              ElderCare connects families with verified nurses, caregivers,
              physiotherapists, and attendants for safe, reliable in-home
              elderly care — booked in minutes.
            </p>

            <div className="mt-10">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#ff6a3d] px-7 py-4 text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                Book a caregiver
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div>
            <img
              src="/images/hero-image.png"
              alt="Elder care"
              className="w-full rounded-[38px] object-cover shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="rounded-t-[40px] bg-[#dfe9e5] py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          {/* HEADER */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex rounded-full border border-[#cad5d2] bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#727272]">
              Built for families and caregivers
            </div>

            <h2 className="mt-6 max-w-4xl text-center text-[34px] font-black leading-[1.05] tracking-[-0.04em] text-[#111111] sm:text-[50px]">
              Everything elder care should be.
            </h2>
          </div>

          {/* FEATURE CARDS */}
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* IMAGE */}
                <div className="w-full overflow-hidden rounded-[30px] bg-[#c7ddd7]">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="h-[260px] w-full object-cover"
                  />
                </div>

                {/* TEXT */}
                <div className="mt-7 max-w-[340px] text-center">
                  <h3 className="text-[28px] font-bold tracking-tight text-[#111111]">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-[15px] leading-7 text-[#666666]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS + TESTIMONIAL */}
      <section
        id="families"
        className="bg-[#f7f7f5] py-20 sm:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          {/* LEFT */}
          <div>
            <div className="inline-flex rounded-full border border-[#dddddd] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#727272]">
              Trusted by families
            </div>

            <h2 className="mt-6 text-[34px] font-black leading-tight tracking-[-0.03em] sm:text-[48px]">
              Care that families actually rely on.
            </h2>

            <div className="mt-14 grid grid-cols-2 gap-y-10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <h3 className="text-[42px] font-black tracking-tight text-[#ff6a3d]">
                    {stat.value}
                  </h3>

                  <p className="mt-2 text-[15px] text-[#727272]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* TESTIMONIAL */}
          <div className="rounded-[32px] border border-[#e7e7e7] bg-white p-8 shadow-sm sm:p-10">
            <Quote className="h-10 w-10 text-[#d7d7d7]" />

            <p className="mt-8 text-[20px] leading-10 text-[#1a1a1a]">
              Finding a trustworthy nurse for my mother used to take weeks of
              calls. With ElderCare we had a verified caregiver at home the
              next morning.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="User"
                className="h-14 w-14 rounded-full object-cover"
              />

              <div>
                <h4 className="font-semibold">Jamie Reeves</h4>

                <p className="text-sm text-[#7b7b7b]">
                  Daughter & primary caregiver
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-t-[40px] bg-[#0d1216]">
          <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:px-10 sm:py-28">
            <h2 className="mx-auto max-w-3xl text-[42px] font-black leading-[1] tracking-[-0.05em] text-white sm:text-[64px]">
              Your family deserves care you can trust.
            </h2>

            <p className="mx-auto mt-8 max-w-2xl text-[18px] leading-8 text-[#a5a5a5]">
              Verified caregivers. Transparent pricing. Book in minutes — not
              weeks.
            </p>

            <div className="mt-10">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#ff6a3d] px-8 py-4 font-semibold text-white transition hover:scale-[1.02]"
              >
                Find a caregiver / Be a caregiver
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* FOOTER */}
          <footer
            id="contact"
            className="border-t border-white/10"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 text-sm text-[#8d8d8d] sm:flex-row sm:items-center sm:justify-between">
              {/* FOOTER LOGO */}
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-1">
                  <img
                    src="/images/avatar.png"
                    alt="ElderCare Logo"
                    className="h-12 w-12 object-cover"
                  />
                </div>

                <span className="font-medium text-white">ElderCare</span>
              </div>

              <div className="flex gap-8">
                <Link href="/login">Sign in</Link>
                <a href="#">Contact</a>
              </div>

              <p>© 2026 ElderCare</p>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}