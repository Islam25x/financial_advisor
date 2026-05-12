import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logoSrc from "../../../../assets/logo.png";
import { cn } from "../../../../shared/ui/types";
import AuthIllustration from "./AuthIllustration";

type AuthFlowLayoutProps = {
  children: ReactNode;
  headerAside?: ReactNode;
  footer?: ReactNode;
  illustration?: boolean;
  illustrationClassName?: string;
  contentClassName?: string;
};

const DEFAULT_FOOTER = (
  <footer className="pb-4 text-center text-sm text-slate-400">
    <span>Copyright 2026 Finexa. All rights reserved.</span>
    <span className="mx-3 hidden sm:inline">Privacy Policy</span>
    <span className="hidden sm:inline">Terms of Service</span>
  </footer>
);

export default function AuthFlowLayout({
  children,
  headerAside,
  footer = DEFAULT_FOOTER,
  illustration = true,
  illustrationClassName,
  contentClassName,
}: AuthFlowLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f8ff] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(125,211,252,0.18),_transparent_28%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-6">
          <Link to="/welcome" className="inline-flex items-center">
            <img src={logoSrc} alt="Finexa" className="h-12 w-auto object-contain sm:h-14" />
          </Link>
          {headerAside}
        </header>

        <div
          className={cn("relative flex flex-1 items-center justify-center py-10", contentClassName)}
        >
          {illustration ? <AuthIllustration className={illustrationClassName} /> : null}
          {children}
        </div>

        {footer}
      </div>
    </main>
  );
}
