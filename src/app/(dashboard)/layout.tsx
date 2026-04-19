"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SearchCommandPalette } from "@/components/search/SearchCommandPalette";
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
  Search,
  ChevronRight,
  Bell,
} from "lucide-react";
import { Avatar, ValkDropdown } from "@/components/ds";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ds/ValkSheet";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { OnboardingWizard } from "./onboarding-wizard";

type NavKey = "dashboard" | "projects" | "tasks" | "docs" | "meetings" | "reports" | "people";

const navItems: { key: NavKey; icon: typeof LayoutDashboard; href: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, href: "/" },
  { key: "projects", icon: FolderKanban, href: "/projects" },
  { key: "tasks", icon: CheckSquare, href: "/tasks" },
  { key: "docs", icon: FileText, href: "/docs" },
  { key: "meetings", icon: Video, href: "/meetings" },
  { key: "reports", icon: BarChart3, href: "/reports" },
  { key: "people", icon: Users, href: "/people" },
];

/* ─── Nav Items ─── */
function NavItems({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("nav");

  return (
    <nav style={{ padding: "4px 12px", paddingTop: 8, flex: 1, overflow: "auto" }}>
      <div className="label" style={{ padding: "10px 10px 6px" }}>
        Workspace
      </div>
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
            className="relative flex w-full items-center font-sans"
            style={{
              gap: 11,
              padding: "8px 10px",
              borderRadius: 7,
              marginBottom: 1,
              color: isActive ? "#F0F0F0" : "#4A4A4A",
              background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
              fontSize: 13,
              fontWeight: 500,
              transition: "all 150ms var(--ease)",
            }}
          >
            {isActive && (
              <span
                className="absolute rounded-r"
                style={{
                  left: -12,
                  top: 6,
                  bottom: 6,
                  width: 2,
                  background: "var(--primary)",
                }}
              />
            )}
            <item.icon
              size={15}
              strokeWidth={isActive ? 1.75 : 1.5}
            />
            <span>{t(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ─── User Avatar helper ─── */
function UserAvatar({ name, size = 26 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return <Avatar user={{ name, initials, color: "#555" }} size={size} />;
}

/* ─── Sidebar Brand ─── */
function SidebarBrand() {
  return (
    <div
      className="flex items-center"
      style={{ padding: "22px 20px 20px", gap: 10 }}
    >
      <span
        className="display"
        style={{
          fontWeight: 600,
          fontSize: 15,
          color: "var(--text-primary)",
          letterSpacing: "0.3em",
        }}
      >
        VALK
      </span>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "var(--primary)",
          boxShadow: "0 0 8px rgba(226,75,74,0.5)",
        }}
      />
      <span
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontWeight: 500,
        }}
      >
        hub
      </span>
    </div>
  );
}

/* ─── Sidebar User Footer ─── */
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
    <div className="mt-auto flex items-center gap-3 border-t border-[#1A1A1A] px-3 py-3">
      <ValkDropdown
        trigger={
          <button className="flex w-full items-center gap-3">
            <UserAvatar name={user.name} size={32} />
            <div className="min-w-0 flex-1 text-left flex flex-col gap-1">
              <span
                className="truncate font-sans text-sm font-medium leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {user.name}
              </span>
              <span
                className="truncate text-xs leading-tight"
                style={{ color: "var(--text-muted)" }}
              >
                {user.company_role ?? user.role}
              </span>
            </div>
            <span className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#1A1A1A] bg-[#0D0D0D] transition-colors hover:border-[#2A2A2A]">
              <Settings size={14} style={{ color: "var(--text-muted)" }} />
            </span>
          </button>
        }
        sections={[
          {
            items: [
              {
                label: "Configurações",
                icon: <Settings size={14} />,
                onClick: () => router.push("/settings"),
              },
              {
                label: "Sair",
                icon: <LogOut size={14} />,
                onClick: handleSignOut,
                destructive: true,
              },
            ],
          },
        ]}
        align="start"
      />
    </div>
  );
}

/* ─── Desktop Sidebar ─── */
function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      data-print-hide
      className="fixed inset-y-0 left-0 z-40 hidden lg:flex"
      style={{
        width: 240,
        background: "var(--bg-0)",
        borderRight: "1px solid #111",
        flexDirection: "column",
      }}
    >
      <SidebarBrand />
      <NavItems pathname={pathname} />
      <SidebarUser />
    </aside>
  );
}

/* ─── Mobile Sidebar (Sheet) ──�� */
function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center justify-center rounded-lg p-1.5 transition-colors lg:hidden" style={{ color: "var(--text-tertiary)" }}>
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] border-r p-0"
        style={{
          background: "var(--bg-0)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <SidebarBrand />
        <NavItems pathname={pathname} onNavigate={() => setOpen(false)} />
        <SidebarUser />
      </SheetContent>
    </Sheet>
  );
}

/* ─── Topbar ─── */
function Topbar({ onSearchOpen }: { onSearchOpen: () => void }) {
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
    <header
      data-print-hide
      className="flex items-center"
      style={{
        height: 56,
        borderBottom: "1px solid var(--border-subtle)",
        padding: "0 28px",
        gap: 16,
        background: "var(--bg-0)",
        position: "relative",
        zIndex: 5,
      }}
    >
      {/* Left: breadcrumbs */}
      <div
        className="flex min-w-0 flex-1 items-center"
        style={{ gap: 10 }}
      >
        <MobileSidebar />
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center" style={{ gap: 6 }}>
            {i > 0 && (
              <ChevronRight
                size={12}
                strokeWidth={2}
                style={{ color: "var(--text-ghost)" }}
              />
            )}
            {seg.href ? (
              <Link
                href={seg.href}
                className="transition-colors"
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  fontWeight: 400,
                }}
              >
                {seg.label}
              </Link>
            ) : (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-primary)",
                  fontWeight: 500,
                }}
              >
                {seg.label}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Center: search bar (desktop only) */}
      <button
        onClick={onSearchOpen}
        className="hidden items-center transition-all lg:flex"
        style={{
          gap: 10,
          padding: "7px 12px",
          background: "var(--bg-1)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          color: "var(--text-muted)",
          fontSize: 12,
          width: 220,
          transition: "all 200ms var(--ease)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "var(--border-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--border-subtle)")
        }
      >
        <Search size={13} />
        <span className="flex-1 text-left">Buscar…</span>
        <kbd
          className="font-mono"
          style={{
            fontSize: 10,
            padding: "1px 5px",
            background: "var(--bg-elev)",
            borderRadius: 3,
            color: "var(--text-tertiary)",
          }}
        >
          {typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      {/* Right: notifications + avatar */}
      <div className="flex items-center" style={{ gap: 8 }}>
        <button
          className="btn icon subtle relative"
        >
          <Bell size={15} />
          <span
            className="absolute"
            style={{
              top: 6,
              right: 6,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--primary)",
              boxShadow: "0 0 6px rgba(226,75,74,0.6)",
            }}
          />
        </button>
        {user && <UserAvatar name={user.name} size={26} />}
      </div>
    </header>
  );
}

/* ─── Layout ─── */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-0)" }}>
      <OnboardingWizard />
      <Sidebar />
      <div
        data-print-layout
        className="flex min-h-screen flex-col lg:ml-[240px] lg:h-screen lg:overflow-y-auto"
      >
        <Topbar onSearchOpen={() => setSearchOpen(true)} />
        <motion.main
          className="mx-auto w-full max-w-[1080px] flex-1 overflow-x-hidden px-4 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-7"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </div>
      <SearchCommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
