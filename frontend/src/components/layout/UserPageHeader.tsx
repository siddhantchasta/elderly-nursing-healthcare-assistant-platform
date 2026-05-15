import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface UserPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export default function UserPageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
}: UserPageHeaderProps) {
  return (
    <header className="mb-8">
      {backHref ? (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#6d7b76] transition hover:text-[#111111]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </Link>
      ) : null}
      <h1 className="text-[28px] font-black tracking-[-0.03em] text-[#111111] sm:text-[34px]">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#6d7b76]">{description}</p> : null}
    </header>
  );
}
