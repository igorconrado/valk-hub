import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <p className="font-display text-[48px] font-semibold text-[#E24B4A]">
        404
      </p>

      <p className="mt-2 text-[14px] text-[#666]">Página não encontrada</p>

      <Link
        href="/"
        className="mt-6 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)]"
      >
        Voltar ao dashboard
      </Link>
    </div>
  );
}
