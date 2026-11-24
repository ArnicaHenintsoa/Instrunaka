import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white border border-border rounded-3xl shadow-sm">
      <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-accent" />
      </div>
      <h3 className="text-xl font-semibold text-content mb-2">{title}</h3>
      <p className="text-content-secondary max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}