"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell,
  CheckCircle,
  Calendar,
  Scale,
  BarChart3,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  read: boolean;
  created_at: string;
};

const typeIcons: Record<string, typeof CheckCircle> = {
  task_assigned: CheckCircle,
  task_blocked: AlertCircle,
  task_unblocked: CheckCircle,
  meeting_scheduled: Calendar,
  meeting_reminder: Calendar,
  decision_registered: Scale,
  action_item_assigned: CheckCircle,
  report_published: BarChart3,
  member_added: UserPlus,
  mention: AlertCircle,
};

function getEntityUrl(entityType: string | null, entityId: string | null): string | null {
  if (!entityType || !entityId) return null;
  switch (entityType) {
    case "task":
      return "/tasks";
    case "meeting":
      return `/meetings/${entityId}`;
    case "decision":
      return "/";
    case "report":
      return `/reports/${entityId}`;
    case "project":
      return `/projects/${entityId}`;
    default:
      return null;
  }
}

export function NotificationBell() {
  const { user } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();

    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, body, entity_type, entity_id, read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const items = (data ?? []) as Notification[];
    setNotifications(items);
    setUnreadCount(items.filter((n) => !n.read).length);
  }, [user]);

  // Initial fetch + poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAsRead(notificationId: string) {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  async function markAllAsRead() {
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  function handleNotificationClick(notification: Notification) {
    if (!notification.read) markAsRead(notification.id);
    const url = getEntityUrl(notification.entity_type, notification.entity_id);
    if (url) router.push(url);
    setOpen(false);
  }

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#555] transition-colors hover:bg-white/[0.03] hover:text-[#888]"
      >
        <Bell size={18} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <div className="absolute right-1 top-1 h-[6px] w-[6px] rounded-full bg-[#E24B4A]" />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#141414] px-4 py-3">
            <span className="text-[12px] font-semibold text-[#888]">
              Notificações
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-[#555] transition-colors hover:text-[#888]"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[480px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <Bell size={24} strokeWidth={1} className="text-[#222]" />
                <p className="mt-3 text-[12px] text-[#444]">
                  Sem notificações
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon =
                  typeIcons[notification.type] ?? AlertCircle;
                const timeAgo = formatDistanceToNow(
                  new Date(notification.created_at),
                  { addSuffix: true, locale: ptBR }
                );

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.02] ${
                      !notification.read
                        ? "border-l-2 border-l-[#E24B4A] bg-[rgba(226,75,74,0.03)]"
                        : "border-l-2 border-l-transparent"
                    }`}
                  >
                    <Icon
                      size={14}
                      strokeWidth={1.5}
                      className="mt-0.5 shrink-0 text-[#444]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-[#ddd]">
                        {notification.title}
                      </p>
                      {notification.body && (
                        <p className="mt-0.5 truncate text-[11px] text-[#555]">
                          {notification.body}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-[#333]">
                        {timeAgo}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
