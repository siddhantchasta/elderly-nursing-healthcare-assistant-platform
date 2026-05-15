interface DashboardSectionProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  refreshLabel?: string;
  children: React.ReactNode;
}

export default function DashboardSection({
  title,
  description,
  onRefresh,
  refreshLabel = "Refresh",
  children,
}: DashboardSectionProps) {
  return (
    <section className="rounded-[24px] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#111111] sm:text-xl">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-relaxed text-[#6d7b76]">{description}</p> : null}
        </div>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="shrink-0 self-start rounded-full border border-[#d8d8d8] bg-white px-5 py-2 text-sm font-semibold text-[#111111] transition hover:border-[#cad5d2]"
          >
            {refreshLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
