"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type State = "idle" | "loading" | "success";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setState("loading");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/auth/callback",
      },
    });

    if (error) {
      toast.error(error.message);
      setState("idle");
      return;
    }

    setState("success");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(226, 75, 74, 0.03) 0%, transparent 70%)",
        }}
      />

      <AnimatePresence mode="wait">
        {state !== "success" ? (
          <motion.div
            key="form"
            className="relative z-10 flex flex-col items-center"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
          >
            {/* Logo */}
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <h1 className="font-sans text-3xl font-bold tracking-[0.3em] text-white">
                VALK
              </h1>
              <div className="mt-3 h-[2px] w-8 bg-[#E24B4A]" />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="mt-4 text-sm font-normal uppercase tracking-widest text-[#666]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Sistema de Gestão
            </motion.p>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="mt-12 flex w-[320px] flex-col gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={state === "loading"}
                className="w-full rounded-lg border border-[#1F1F1F] bg-[#111] px-4 py-3 text-white placeholder-[#555] transition-colors duration-150 hover:border-[#2A2A2A] focus:border-[#E24B4A] focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E24B4A] px-4 py-3 font-semibold text-white transition-all duration-150 hover:bg-[#C73E3D] active:scale-[0.98] disabled:opacity-70"
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </motion.form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E24B4A]/10">
              <Mail className="h-7 w-7 text-[#E24B4A]" />
            </div>
            <p className="mt-6 text-lg font-semibold text-white">
              Link de acesso enviado para
            </p>
            <p className="mt-1 text-sm font-medium text-[#E24B4A]">{email}</p>
            <p className="mt-3 text-sm text-[#666]">
              Verifique sua caixa de entrada
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <p className="absolute bottom-8 text-xs text-[#333]">
        powered by VALK
      </p>
    </div>
  );
}
