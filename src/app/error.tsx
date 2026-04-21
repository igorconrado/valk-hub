"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[root-error]", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-8 text-white">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="text-[64px] font-bold leading-none text-[#E24B4A]">
            !
          </div>
          <h1 className="text-2xl font-semibold">Algo deu errado</h1>
          <p className="text-sm text-[#9CA3AF]">
            Ocorreu um erro inesperado. Você pode tentar novamente ou voltar
            para a tela inicial.
          </p>
          {error.digest && (
            <p className="font-mono text-[10px] text-[#555]">
              ID: {error.digest}
            </p>
          )}
          <div className="flex justify-center gap-3">
            <button
              onClick={reset}
              className="rounded-md bg-[#E24B4A] px-4 py-2 text-sm text-white transition-colors hover:bg-[#C93B3A]"
            >
              Tentar novamente
            </button>
            <Link
              href="/"
              className="rounded-md bg-[#1A1A1A] px-4 py-2 text-sm text-white transition-colors hover:bg-[#242424]"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
