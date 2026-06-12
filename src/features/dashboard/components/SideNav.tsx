import { Link, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  BarChart3,
  PiggyBank,
  Settings,
  LogOut,
} from "lucide-react";
import logoSrc from "../../../assets/logo.png";
import mobileLogoSrc from "../../../assets/mobile view logo.png";
import { useLogout } from "../../auth/hooks/useLogout";
import { Button, Text, cn } from "../../../shared/ui";

interface AdminNavProps {
  setActiveComponent: (component: string) => void;
  activeComponent: string;
}

function SideNav({ setActiveComponent, activeComponent }: AdminNavProps) {
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const navItems: { name: string; icon: LucideIcon; link?: string }[] = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Transactions", icon: Receipt },
    { name: "Bills", icon: FileText },
    { name: "Goals", icon: BarChart3 },
    { name: "SavingPlan", icon: PiggyBank },
    { name: "Setting", icon: Settings },
  ];

  const bottomNav: {
    name: string;
    icon: LucideIcon;
    link?: string;
    onClick?: () => void;
  }[] = [
      {
        name: "Log out",
        icon: LogOut,
        onClick: async () => {
          await logoutMutation.mutateAsync();
          navigate("/welcome", { replace: true });
        },
      },
    ];

  const renderNavItem = (
    name: string,
    Icon: LucideIcon,
    link?: string,
    onClick?: () => void
  ) => {
    const isActive = activeComponent === name;

    const baseClasses =
      "flex items-center justify-center lg:justify-start gap-3 px-3 py-3 cursor-pointer w-full lg:w-[85%] h-12 rounded-2xl transition-all duration-200 lg:ms-4 font-normal";

    const activeClasses =
      "bg-primary-600 text-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]";

    const hoverClasses =
      "hover:bg-white/30 hover:backdrop-blur-md hover:text-black";

    const classes = cn(
      baseClasses,
      isActive ? activeClasses : cn("text-black/80", hoverClasses)
    );

    const content = (
      <>
        <Icon size={20} className="shrink-0" />
        <Text as="span" variant="body" className="hidden lg:block">
          {name === "SavingPlan" ? "Saving Plan" : name}
        </Text>
      </>
    );

    return link ? (
      <Link
        key={name}
        to={link}
        onClick={() => {
          setActiveComponent(name);
          onClick?.();
        }}
        className={classes}
      >
        {content}
      </Link>
    ) : (
      <Button
        key={name}
        onClick={() => {
          setActiveComponent(name);
          void onClick?.();
        }}
        className={classes}
        variant="ghost"
        size="md"
      >
        {content}
      </Button>
    );
  };

  return (
    <aside className="fixed top-0 left-0 w-16 md:w-20 lg:w-60 h-screen z-[1030] flex flex-col items-center lg:items-start overflow-hidden">
      {/* 🔥 Background lighting (ده السر) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute  -left-20 w-72 h-full bg-primary/20 rounded-full blur-3xl" />



      </div>

      {/* 🔥 Glass Layer */}
      <div
        className="
    absolute inset-0 z-[1]
    bg-white/30
    backdrop-blur-xl
    border-r border-white/40
    shadow-[0_8px_40px_rgba(0,0,0,0.08)]
  "
      />

      {/* 🔥 Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center lg:items-start">

        {/* 🔹 Logo */}
        <div
          className="mb-5 ms-3 w-10 lg:w-[60%] mt-4 flex flex-col items-center lg:items-start"
          data-aos="zoom-in"
          data-aos-once="true"
        >
          <img
            src={logoSrc}
            alt="Finexa"
            className="hidden w-full object-cover md:block"
          />
          <img
            src={mobileLogoSrc}
            alt="Finexa mobile"
            className="block w-full object-contain md:hidden"
          />
        </div>

        {/* 🔹 Main Nav */}
        <nav
          className="flex flex-col mb-5 space-y-2 w-full items-center lg:items-start"
          data-aos="fade-right"
          data-aos-once="true"
        >
          {navItems.map(({ name, icon, link }) =>
            renderNavItem(name, icon, link)
          )}
        </nav>

        {/* 🔹 Bottom Nav */}
        <div
          className="absolute bottom-12 w-full flex flex-col items-center lg:items-start space-y-2"
        >
          {bottomNav.map(({ name, icon, link, onClick }) =>
            renderNavItem(name, icon, link, onClick)
          )}
        </div>

      </div>
    </aside>
  );
}

export default SideNav;
