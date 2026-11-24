import { ReactNode } from "react";

export default function PageContainer({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <div className={`container mx-auto px-4 md:px-6 max-w-7xl ${className}`}>
      {children}
    </div>
  );
}