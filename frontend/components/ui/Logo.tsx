import Link from "next/link";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
};

export default function Logo({ variant = "light", className = "" }: LogoProps) {
  const isDark = variant === "dark"; // "dark" signifie fond sombre (texte clair)
  
  const textInstru = isDark ? "text-white" : "text-content";
  const textNaka = isDark ? "text-accent-light" : "text-accent";

  return (
    <Link href="/" className={`flex items-center gap-2 shrink-0 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="6" width="3" height="12" rx="1.5" fill="white"/>
          <rect x="10.5" y="3" width="3" height="18" rx="1.5" fill="white"/>
          <rect x="17" y="8" width="3" height="8" rx="1.5" fill="white"/>
        </svg>
      </div>
      <span className={`font-bold text-2xl tracking-tight ${textInstru}`}>
        Instru<span className={textNaka}>naka</span>
      </span>
    </Link>
  );
}