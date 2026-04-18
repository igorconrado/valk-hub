"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  FileText,
  BarChart3,
  Video,
  Users,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "./notification-bell";
import { OnboardingWizard } from "./onboarding-wizard";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", enabled: true },
  { label: "Projetos", icon: FolderKanban, href: "/projects", enabled: true },
  { label: "Tasks", icon: CheckSquare, href: "/tasks", enabled: true },
  { label: "Docs", icon: FileText, href: "/docs", enabled: true },
  { label: "Reuniões", icon: Video, href: "/meetings", enabled: true },
  { label: "Relatórios", icon: BarChart3, href: "/reports", enabled: true },
  { label: "People", icon: Users, href: "/people", enabled: true },
];

const disabledItems: { label: string; icon: typeof Users; tooltip: string }[] = [];

function NavItems({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`relative flex items-center gap-2.5 rounded-lg px-3 py-[9px] transition-colors duration-150 ${
              isActive
                ? "bg-white/5 text-[#F0F0F0]"
                : "text-[#4A4A4A] hover:bg-white/[0.03] hover:text-[#888]"
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r bg-[#E24B4A]" />
            )}
            <item.icon size={17} strokeWidth={1.5} />
            <span className="text-[13px] font-medium">{item.label}</span>
          </Link>
        );
      })}

      {/* Separator */}
      <div className="mx-3 my-2 h-px bg-[#111]" />

      {/* Disabled items */}
      {disabledItems.map((item) => (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <div className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-[9px] text-[#4A4A4A] opacity-25">
              <item.icon size={17} strokeWidth={1.5} />
              <span className="text-[13px] font-medium">{item.label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );
}

function UserAvatar({
  name,
  size = 30,
  textSize = "text-[11px]",
}: {
  name: string;
  size?: number;
  textSize?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] ${textSize} font-semibold text-[#555]`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

function SidebarBrand() {
  return (
    <div className="px-4 py-5">
      <div className="flex items-center gap-1.5">
        <span className="font-display text-[15px] font-semibold tracking-[0.2em] text-white">
          VALK
        </span>
        <span className="inline-block h-[5px] w-[5px] rounded-full bg-[#E24B4A]" />
      </div>
      <span className="mt-0.5 inline-block rounded border border-[rgba(226,75,74,0.12)] bg-[rgba(226,75,74,0.08)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-[#E24B4A]">
        hub
      </span>
    </div>
  );
}

function SidebarUser() {
  const { user } = useUser();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 border-t border-[#111] px-4 py-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-2.5 rounded-lg transition-colors hover:bg-white/[0.03]">
            <UserAvatar name={user.name} />
            <div className="min-w-0 text-left">
              <p className="truncate text-[13px] font-medium text-[#ccc]">
                {user.name}
              </p>
              <p className="truncate text-[10px] text-[#444]">
                {user.company_role ?? user.role}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="text-[#888]"
          >
            <Settings size={14} className="mr-2" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-[#888] focus:text-[#E24B4A]"
          >
            <LogOut size={14} className="mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside data-print-hide className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-[#111] bg-[#050505] lg:block">
      <SidebarBrand />
      <NavItems pathname={pathname} />
      <SidebarUser />
    </aside>
  );
}

function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center justify-center rounded-lg p-1.5 text-[#666] transition-colors hover:bg-white/[0.03] hover:text-[#ccc] lg:hidden">
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] border-r border-[#111] bg-[#050505] p-0"
      >
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <SidebarBrand />
        <NavItems pathname={pathname} onNavigate={() => setOpen(false)} />
        <SidebarUser />
      </SheetContent>
    </Sheet>
  );
}

function Topbar() {
  const pathname = usePathname();
  const { user } = useUser();

  const segments: { label: string; href?: string }[] = [];

  if (pathname === "/") {
    segments.push({ label: "Dashboard" });
  } else {
    const parts = pathname.split("/").filter(Boolean);
    parts.forEach((part, i) => {
      const href = "/" + parts.slice(0, i + 1).join("/");
      const label = part.charAt(0).toUpperCase() + part.slice(1);
      const isLast = i === parts.length - 1;
      segments.push({ label, href: isLast ? undefined : href });
    });
  }

  return (
    <header data-print-hide className="flex h-[52px] items-center justify-between border-b border-[#111] px-5 lg:px-7">
      <div className="flex items-center gap-2">
        <MobileSidebar />
        <div className="flex items-center gap-1.5">
          {segments.map((seg, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-[13px] text-[#333]">/</span>
              )}
              {seg.href ? (
                <Link
                  href={seg.href}
                  className="text-[13px] font-medium text-[#666] transition-colors hover:text-[#999]"
                >
                  {seg.label}
                </Link>
              ) : (
                <span className="text-[13px] font-medium text-[#ccc]">
                  {seg.label}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <NotificationBell />
        {user && <UserAvatar name={user.name} size={26} textSize="text-[10px]" />}
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <OnboardingWizard />
      <Sidebar />
      <div data-print-layout className="flex min-h-screen flex-col lg:ml-[240px] lg:h-screen lg:overflow-y-auto">
        <Topbar />
        <motion.main
          className="mx-auto w-full max-w-[1080px] flex-1 px-5 py-7 lg:px-8 lg:py-7"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
