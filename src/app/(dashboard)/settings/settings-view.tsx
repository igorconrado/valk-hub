"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { saveNotificationPreferences, savePreferences } from "./actions";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  company_role: string | null;
  avatar_url: string | null;
};

const NOTIFICATION_TYPES = [
  { key: "task_assigned", label: "Task atribuída" },
  { key: "task_blocked", label: "Task bloqueada" },
  { key: "meeting_scheduled", label: "Reunião agendada" },
  { key: "meeting_reminder", label: "Lembrete de reunião" },
  { key: "decision_registered", label: "Decisão registrada" },
  { key: "action_item_assigned", label: "Action item" },
  { key: "report_published", label: "Relatório publicado" },
];

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "America/Chicago", label: "Chicago (CST)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Lisbon", label: "Lisboa (WET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
];

const sectionClass =
  "rounded-xl border border-[#141414] bg-[#0A0A0A] p-6";

const sectionTitle = "eyebrow";

const inputClass =
  "w-full rounded-lg border border-[#1A1A1A] bg-[#050505] px-3.5 py-2.5 text-[13px] text-[#ddd] transition-all duration-200 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.06)]";

function Toggle({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50 ${
        enabled ? "bg-[#E24B4A]" : "bg-[#333]"
      }`}
    >
      <div
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
          enabled ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function ProfileSection({ user }: { user: User }) {
  const tc = useTranslations("common");
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={sectionClass}>
      <h2 className={sectionTitle}>Perfil</h2>
      <div className="mt-4 flex items-center gap-4">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1A1A]">
            <span className="font-display text-[14px] font-semibold text-[#555]">
              {initials}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-[#eee]">{user.name}</p>
          <p className="mt-0.5 text-[12px] text-[#555]">
            {user.company_role ?? user.role}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-[#444]">
            {user.email}
          </p>
        </div>
        <Link
          href={`/people/${user.id}`}
          className="shrink-0 rounded-lg border border-[#222] px-3 py-1.5 text-[11px] text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc]"
        >
          {tc("edit")}
        </Link>
      </div>
    </div>
  );
}

function NotificationsSection({
  preferences,
}: {
  preferences: Record<string, boolean>;
}) {
  const [prefs, setPrefs] = useState(preferences);
  const [isSaving, startTransition] = useTransition();

  function handleToggle(key: string) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);

    startTransition(async () => {
      const result = await saveNotificationPreferences(updated);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <div className={sectionClass}>
      <h2 className={sectionTitle}>Notificações</h2>
      <div className="mt-4 flex flex-col">
        {NOTIFICATION_TYPES.map((nt, i) => (
          <div
            key={nt.key}
            className={`flex items-center justify-between py-3 ${
              i < NOTIFICATION_TYPES.length - 1
                ? "border-b border-[#0F0F0F]"
                : ""
            }`}
          >
            <span className="text-[13px] text-[#ddd]">{nt.label}</span>
            <Toggle
              enabled={prefs[nt.key] ?? true}
              onToggle={() => handleToggle(nt.key)}
              disabled={isSaving}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PreferencesSection({
  defaultTaskView,
  timezone,
}: {
  defaultTaskView: string;
  timezone: string;
}) {
  const tTasks = useTranslations("tasks");
  const [view, setView] = useState(defaultTaskView);
  const [tz, setTz] = useState(timezone);
  const [isSaving, startTransition] = useTransition();

  function handleViewChange(newView: string) {
    setView(newView);
    startTransition(async () => {
      const result = await savePreferences({ default_task_view: newView });
      if (result.error) toast.error(result.error);
    });
  }

  function handleTimezoneChange(newTz: string) {
    setTz(newTz);
    startTransition(async () => {
      const result = await savePreferences({ timezone: newTz });
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <div className={sectionClass}>
      <h2 className={sectionTitle}>Preferências</h2>
      <div className="mt-4 flex flex-col gap-5">
        {/* Default task view */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#ddd]">
            Visualização de tasks
          </span>
          <div className="flex rounded-lg border border-[#1A1A1A] bg-[#050505]">
            <button
              onClick={() => handleViewChange("list")}
              disabled={isSaving}
              className={`rounded-l-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                view === "list"
                  ? "bg-white/[0.06] text-[#ccc]"
                  : "text-[#555] hover:text-[#888]"
              }`}
            >
              {tTasks("list")}
            </button>
            <button
              onClick={() => handleViewChange("kanban")}
              disabled={isSaving}
              className={`rounded-r-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                view === "kanban"
                  ? "bg-white/[0.06] text-[#ccc]"
                  : "text-[#555] hover:text-[#888]"
              }`}
            >
              {tTasks("kanban")}
            </button>
          </div>
        </div>

        {/* Timezone */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#ddd]">Fuso horário</span>
          <select
            value={tz}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            disabled={isSaving}
            className="appearance-none rounded-lg border border-[#1A1A1A] bg-[#050505] px-3 py-1.5 text-[11px] text-[#888] outline-none transition-colors focus:border-[#333]"
          >
            {TIMEZONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function LocaleSection() {
  const router = useRouter();

  function handleLocaleChange(newLocale: string) {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    router.refresh();
  }

  // Read current locale from cookie
  const current =
    typeof document !== "undefined"
      ? (document.cookie
          .split("; ")
          .find((c) => c.startsWith("NEXT_LOCALE="))
          ?.split("=")[1] ?? "pt-BR")
      : "pt-BR";

  const [locale, setLocale] = useState(current);

  return (
    <div className={sectionClass}>
      <h2 className={sectionTitle}>Idioma / Language</h2>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[13px] text-[#ddd]">Idioma / Language</span>
        <select
          value={locale}
          onChange={(e) => {
            setLocale(e.target.value);
            handleLocaleChange(e.target.value);
          }}
          className="appearance-none rounded-lg border border-[#1A1A1A] bg-[#050505] px-3 py-1.5 text-[11px] text-[#888] outline-none transition-colors focus:border-[#333]"
        >
          <option value="pt-BR">Portugues (BR)</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div className={sectionClass}>
      <h2 className={sectionTitle}>Sobre</h2>
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#ddd]">Versão</span>
          <span className="font-mono text-[12px] text-[#555]">1.0.0</span>
        </div>
        <p className="mt-2 text-[11px] text-[#333]">
          VALK SOFTWARE &copy; 2026
        </p>
      </div>
    </div>
  );
}

export function SettingsView({
  user,
  notificationPreferences,
  defaultTaskView,
  timezone,
}: {
  user: User;
  notificationPreferences: Record<string, boolean>;
  defaultTaskView: string;
  timezone: string;
}) {
  return (
    <motion.div
      className="mx-auto max-w-[640px] space-y-4"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <ProfileSection user={user} />
      <NotificationsSection preferences={notificationPreferences} />
      <PreferencesSection
        defaultTaskView={defaultTaskView}
        timezone={timezone}
      />
      <LocaleSection />
      <AboutSection />
    </motion.div>
  );
}
