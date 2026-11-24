import Link from "next/link";
import { PLATFORM } from "@/lib/config";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col items-center justify-center text-center gap-6 mb-12">
          
          <Logo variant="dark" />
          
          <p className="text-white/60 text-sm max-w-md">
            Le son malgache, sans limites.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-white/80 font-medium">
            <Link href="/conditions" className="hover:text-accent transition-colors">
              Conditions
            </Link>
            <Link href="/licences" className="hover:text-accent transition-colors">
              Licences
            </Link>
            <Link href="/contact" className="hover:text-accent transition-colors">
              Contact
            </Link>
            <a
              href={PLATFORM.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Instagram
            </a>
            <a
              href={PLATFORM.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              YouTube
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Instrunaka. Fait avec passion à Madagascar.
          </p>
        </div>
      </div>
    </footer>
  );
}