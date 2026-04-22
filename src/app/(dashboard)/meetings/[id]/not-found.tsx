import Link from "next/link";

export default function MeetingNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="font-mono text-[48px] font-bold text-[#E24B4A]">404</p>
      <h1 className="mt-2 text-lg font-semibold text-white">
        Reunião não encontrada
      </h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Essa reunião pode ter sido removida ou você não tem permissão para
        vê-la.
      </p>
      <Link
        href="/meetings"
        className="mt-6 inline-block rounded-lg bg-[#E24B4A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#D4403F]"
      >
        Voltar para reuniões
      </Link>
    </div>
  );
}
