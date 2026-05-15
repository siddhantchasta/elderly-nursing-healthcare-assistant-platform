interface Props {
    eyebrow?: string;
    title: string;
    description: string;
    action?: React.ReactNode;
  }
  
  export default function AdminPageHeader({
    eyebrow = "ElderCare Platform",
    title,
    description,
    action,
  }: Props) {
    return (
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#ff6a3d]">
            {eyebrow}
          </p>
  
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            {title}
          </h1>
  
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/45">
            {description}
          </p>
        </div>
  
        {action ? (
          <div className="flex items-center gap-3">
            {action}
          </div>
        ) : null}
      </div>
    );
  }