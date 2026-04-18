"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <motion.div
      className="flex min-h-[60vh] flex-col items-center justify-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[rgba(226,75,74,0.08)]">
        <AlertTriangle size={28} strokeWidth={1.5} className="text-[#E24B4A]" />
      </div>

      <h1 className="mt-5 font-display text-[20px] font-semibold text-[#eee]">
        Algo deu errado
      </h1>

      <p className="mt-2 max-w-sm text-center text-[13px] leading-relaxed text-[#666]">
        {error.message || "Ocorreu um erro inesperado. Tente novamente."}
      </p>

      {error.digest && (
        <p className="mt-2 font-mono text-[10px] text-[#333]">
          Código: {error.digest}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg bg-[#E24B4A] px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#D4403F] hover:[box-shadow:0_4px_20px_rgba(226,75,74,0.2)]"
        >
          <RotateCcw size={14} strokeWidth={1.5} />
          Tentar novamente
        </button>

        <Link
          href="/"
          className="rounded-lg px-5 py-2.5 text-[12px] text-[#555] transition-colors hover:text-[#888]"
        >
          Voltar ao dashboard
        </Link>
      </div>
    </motion.div>
  );
}
