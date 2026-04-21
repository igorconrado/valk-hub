import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-8 text-white">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="font-mono text-[96px] font-bold leading-none text-[#E24B4A]">
            404
          </div>
          <h1 className="text-2xl font-semibold">Página não encontrada</h1>
          <p className="text-sm text-[#9CA3AF]">
            A página que você procura não existe ou foi movida.
          </p>
          <Link
            href="/"
            className="inline-block rounded-md bg-[#E24B4A] px-4 py-2 text-sm text-white transition-colors hover:bg-[#C93B3A]"
          >
            Voltar ao início
          </Link>
        </div>
      </body>
    </html>
  );
}
