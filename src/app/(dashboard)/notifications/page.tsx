"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { NOTIFICATION_ROUTES, NOTIFICATION_ICONS } from "@/lib/notification-utils";

export default function NotificationsPage() {
  const router = useRouter();
  const t = useTranslations("notifications");

  useEffect(() => {
    document.title = "Notificações · VALK Hub";
  }, []);
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } =
    useNotifications(50);

  const handleClick = async (n: Notification) => {
    if (!n.is_read) await markAsRead(n.id);
    if (n.entity_type && n.entity_id && NOTIFICATION_ROUTES[n.entity_type]) {
      router.push(NOTIFICATION_ROUTES[n.entity_type](n.entity_id));
    }
  };

  return (
    <div className="fadeUp mx-auto max-w-3xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[28px] font-bold text-white">
            {t("title")}
          </h1>
          <p className="mt-1 text-[13px] text-[#888]">
            {unreadCount > 0
              ? t(unreadCount === 1 ? "unreadOne" : "unreadMany", { count: unreadCount })
              : t("allRead")}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="rounded-lg border border-[#1F1F1F] bg-transparent px-4 py-2 text-[13px] text-[#AAA] transition hover:bg-[#0D0D0D]"
          >
            {t("markAllRead")}
          </button>
        )}
      </header>

      {loading ? (
        <p className="text-[13px] text-[#666]">{t("loading")}</p>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-[#141414] bg-[#0A0A0A] py-16 text-center">
          <p className="text-[14px] text-[#666]">{t("empty")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => handleClick(n)}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition hover:bg-[#0D0D0D] ${
                  !n.is_read
                    ? "border-[rgba(226,75,74,0.2)] bg-[rgba(226,75,74,0.03)]"
                    : "border-[#141414] bg-[#0A0A0A]"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[12px] ${
                    !n.is_read
                      ? "bg-[rgba(226,75,74,0.15)] text-[#E24B4A]"
                      : "bg-[#141414] text-[#666]"
                  }`}
                >
                  {NOTIFICATION_ICONS[n.type] ?? "●"}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[14px] leading-snug ${
                      !n.is_read ? "font-medium text-white" : "text-[#AAA]"
                    }`}
                  >
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="mt-0.5 text-[12px] text-[#666] line-clamp-2">
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
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#E24B4A]" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
