"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Avatar, EmptyState } from "@/components/ds";
import { EmptyMeetingsIllustration } from "@/components/ds/illustrations/EmptyMeetings";

type Participant = {
  user_id: string;
  user: { name: string } | { name: string }[] | null;
};

type Meeting = {
  id: string;
  title: string;
  type: string;
  status: string;
  date: string;
  project: { name: string } | { name: string }[] | null;
  meeting_participants: Participant[];
};

const typeConfig: Record<string, { label: string; color: string }> = {
  daily_ops: { label: "Daily", color: "#3B82F6" },
  biweekly: { label: "Quinzenal", color: "#8B5CF6" },
  monthly: { label: "Mensal", color: "#E24B4A" },
  adhoc: { label: "Avulsa", color: "#888" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Agendada", color: "#444" },
  in_progress: { label: "Em andamento", color: "#3B82F6" },
  completed: { label: "Concluída", color: "#10B981" },
  cancelled: { label: "Cancelada", color: "#666" },
};

function TypeBadge({ type }: { type: string }) {
  const config = typeConfig[type] ?? typeConfig.adhoc;

  return (
    <span
      className="inline-flex shrink-0 rounded px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: `${config.color}10`,
        color: config.color,
        border: `1px solid ${config.color}20`,
      }}
    >
      {config.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.scheduled;

  return (
    <span
      className="inline-flex shrink-0 rounded px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: `${config.color}10`,
        color: config.color,
        border: `1px solid ${config.color}20`,
      }}
    >
      {config.label}
    </span>
  );
}

function ParticipantAvatar({ name, index }: { name: string; index: number }) {
  return (
    <div style={{ marginLeft: index === 0 ? 0 : -8, zIndex: 10 - index }}>
      <Avatar
        user={{
          name,
          initials: name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
          color: "#555",
        }}
        size={24}
        className="border-2 border-[#0A0A0A]"
      />
    </div>
  );
}

function ParticipantAvatars({ participants }: { participants: Participant[] }) {
  const visible = participants.slice(0, 4);
  const remaining = participants.length - 4;

  return (
    <div className="flex items-center">
      {visible.map((p, i) => {
        const user = resolveRelation(p.user);
        return (
          <ParticipantAvatar
            key={p.user_id}
            name={user?.name ?? "?"}
            index={i}
          />
        );
      })}
      {remaining > 0 && (
        <div style={{ marginLeft: -8, zIndex: 5 }}>
          <Avatar
            user={{
              name: `+${remaining}`,
              initials: `+${remaining}`,
              color: "#555",
            }}
            size={24}
            className="border-2 border-[#0A0A0A]"
          />
        </div>
      )}
    </div>
  );
}

function ProductBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex rounded border border-[#1A1A1A] bg-[#0F0F0F] px-2 py-0.5 text-[10px] font-medium text-[#555]">
      {name}
    </span>
  );
}

function resolveRelation<T>(val: T | T[] | null): T | null {
  if (val == null) return null;
  if (Array.isArray(val)) return val[0] ?? null;
  return val;
}

function MeetingCard({ meeting, index }: { meeting: Meeting; index: number }) {
  const dateStr = format(
    new Date(meeting.date),
    "EEEE, d MMM yyyy · HH:mm",
    { locale: ptBR }
  );

  const project = resolveRelation(meeting.project);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: "easeOut",
      }}
    >
      <Link
        href={`/meetings/${meeting.id}`}
        className="group block rounded-xl border border-[#141414] bg-[#0A0A0A] p-5 transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-px hover:border-[#1F1F1F] hover:[box-shadow:0_8px_32px_rgba(0,0,0,0.4)]"
      >
        {/* Row 1: Type badge + Title */}
        <div className="flex items-center gap-2.5">
          <TypeBadge type={meeting.type} />
          <h3 className="truncate font-display text-[15px] font-medium text-[#ddd] transition-colors duration-[250ms] group-hover:text-white">
            {meeting.title}
          </h3>
        </div>

        {/* Row 2: Date + Status */}
        <div className="mt-2.5 flex items-center gap-2.5">
          <span suppressHydrationWarning className="text-[12px] text-[#555]">{dateStr}</span>
          <StatusBadge status={meeting.status} />
        </div>

        {/* Row 3: Participants + Product */}
        {(meeting.meeting_participants.length > 0 || project) && (
          <div className="mt-3 flex items-center gap-3">
            {meeting.meeting_participants.length > 0 && (
              <ParticipantAvatars
                participants={meeting.meeting_participants}
              />
            )}
            {project && <ProductBadge name={project.name} />}
          </div>
        )}
      </Link>
    </motion.div>
  );
}

function MeetingsEmptyState() {
  return (
    <EmptyState
      illustration={<EmptyMeetingsIllustration />}
      title="Nenhuma reunião registrada"
      description="Comitê semanal, 1:1s, decisões de produto — todas ficam aqui com action items."
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#333]">
      {children}
    </span>
  );
}

export function MeetingsList({
  upcoming,
  past,
}: {
  upcoming: Meeting[];
  past: Meeting[];
}) {
  if (upcoming.length === 0 && past.length === 0) return <MeetingsEmptyState />;

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <div>
          <SectionLabel>Próximas</SectionLabel>
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {upcoming.map((m, i) => (
              <MeetingCard key={m.id} meeting={m} index={i} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <SectionLabel>Anteriores</SectionLabel>
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {past.map((m, i) => (
              <MeetingCard key={m.id} meeting={m} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
