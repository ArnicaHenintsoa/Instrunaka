import { ReactNode } from "react";

type PageHeaderProps = {
  label: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export default function PageHeader({ label, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-8">
      <div>
        <span className="text-accent font-semibold text-xs tracking-wider uppercase mb-2 block">
          {label}
        </span>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-content mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-content-secondary text-sm md:text-base max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}