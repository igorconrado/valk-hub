"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { NOTIFICATION_ROUTES, NOTIFICATION_ICONS } from "@/lib/notification-utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations("notifications");
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications(10);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleClick = async (n: Notification) => {
    if (!n.is_read) await markAsRead(n.id);
    if (n.entity_type && n.entity_id && NOTIFICATION_ROUTES[n.entity_type]) {
      router.push(NOTIFICATION_ROUTES[n.entity_type](n.entity_id));
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1F1F1F] bg-transparent transition hover:bg-[#141414]"
        aria-label={t("bellAriaLabel")}
      >
        <Bell size={16} className="text-[#888]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E24B4A] px-1 font-mono text-[9px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 flex max-h-[520px] w-[380px] flex-col overflow-hidden rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1F1F1F] px-4 py-3">
            <h3 className="font-display text-[14px] font-semibold text-white">
              {t("title")}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="font-mono text-[11px] text-[#888] transition hover:text-[#E24B4A]"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[13px] text-[#666]">{t("empty")}</p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => handleClick(n)}
                      className={`flex w-full items-start gap-3 border-b border-[#141414] px-4 py-3 text-left transition hover:bg-[#0D0D0D] ${
                        !n.is_read ? "bg-[rgba(226,75,74,0.03)]" : ""
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] ${
                          !n.is_read
                            ? "bg-[rgba(226,75,74,0.15)] text-[#E24B4A]"
                            : "bg-[#141414] text-[#666]"
                        }`}
                      >
                        {NOTIFICATION_ICONS[n.type] ?? "●"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-[13px] leading-snug ${
                            !n.is_read
                              ? "font-medium text-white"
                              : "text-[#AAA]"
                          }`}
                        >
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="mt-0.5 line-clamp-2 text-[12px] text-[#666]">
                            {n.body}
                          </p>
                        )}
                        {n.created_at && (
                          <p
                            suppressHydrationWarning
                            className="mt-1 font-mono text-[10px] text-[#444]"
                          >
                            {formatDistanceToNow(new Date(n.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        )}
                      </div>
                      {!n.is_read && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E24B4A]" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#1F1F1F] px-4 py-2 text-center">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/notifications");
              }}
              className="font-mono text-[11px] text-[#888] transition hover:text-white"
            >
              {t("viewAll")} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
