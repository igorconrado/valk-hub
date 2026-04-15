"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type State = "idle" | "loading" | "success";

const embers = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${12 + Math.random() * 58}%`,
  bottom: `${10 + Math.random() * 20}%`,
  size: 2 + Math.random() * 2,
  duration: `${3 + Math.random() * 3}s`,
  delay: `${Math.random() * 3}s`,
}));

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  }),
};

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
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0A0A]">
      {/* ── LEFT SIDE (brand) ── */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-[#050505] md:flex">
        {/* Forge glow background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 90%, rgba(226,75,74,0.03) 0%, transparent 60%)",
          }}
        />

        {/* Glow orb */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: 300,
            height: 200,
            background:
              "radial-gradient(ellipse at center, rgba(226,75,74,0.13) 0%, transparent 70%)",
          }}
        />

        {/* Glow core */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: 120,
            height: 60,
            background:
              "radial-gradient(ellipse at center, rgba(226,75,74,0.20) 0%, transparent 70%)",
          }}
        />

        {/* Ember particles */}
        {embers.map((ember) => (
          <div
            key={ember.id}
            className="absolute animate-ember rounded-full bg-[#E24B4A]"
            style={{
              left: ember.left,
              bottom: ember.bottom,
              width: ember.size,
              height: ember.size,
              animationDuration: ember.duration,
              animationDelay: ember.delay,
            }}
          />
        ))}

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.h1
            className="font-display text-[42px] font-bold tracking-[0.35em] text-white"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            VALK
          </motion.h1>
          <motion.div
            className="mt-4 h-[2px] w-10 bg-[#E24B4A]"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
          />
          <motion.span
            className="mt-3 text-xs uppercase tracking-[0.2em] text-[#555]"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.4}
          >
            software
          </motion.span>
        </div>

        {/* Corner: top-left */}
        <motion.span
          className="absolute left-6 top-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#E24B4A]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          venture builder
        </motion.span>

        {/* Corner: bottom-right */}
        <motion.span
          className="absolute bottom-6 right-8 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#E24B4A]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          est. 2026
        </motion.span>

      </div>

      {/* ── CENTER DIVIDER ── */}
      <div
        className="hidden w-px self-stretch md:block"
        style={{
          background:
            "linear-gradient(to bottom, transparent, #1F1F1F 15%, #1F1F1F 85%, transparent)",
        }}
      />

      {/* ── RIGHT SIDE (form) ── */}
      <div className="relative flex w-full flex-col items-center justify-center md:w-1/2">
        {/* Mobile background glow */}
        <div
          className="pointer-events-none absolute inset-0 md:hidden"
          style={{
            background:
              "radial-gradient(ellipse at 50% 90%, rgba(226,75,74,0.03) 0%, transparent 60%)",
          }}
        />

        {/* Version badge */}
        <span className="absolute right-4 top-4 font-mono text-[9px] uppercase tracking-[0.12em] text-[#222]">
          v1.0
        </span>

        <AnimatePresence mode="wait">
          {state !== "success" ? (
            <motion.div
              key="form"
              className="relative z-10 w-[280px]"
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            >
              {/* Mobile logo */}
              <div className="mb-10 flex flex-col items-center md:hidden">
                <motion.h1
                  className="font-display text-[42px] font-bold tracking-[0.35em] text-white"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                >
                  VALK
                </motion.h1>
                <motion.div
                  className="mt-4 h-[2px] w-10 bg-[#E24B4A]"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.1}
                />
                <motion.span
                  className="mt-3 text-xs uppercase tracking-[0.2em] text-[#555]"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.2}
                >
                  software
                </motion.span>
              </div>

              {/* Brand mark */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.1}
              >
                <div className="flex items-center">
                  <span className="font-display text-base font-bold tracking-[0.18em] text-white">
                    VALK
                  </span>
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[#E24B4A]" />
                </div>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-[#444]">
                  hub
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-10">
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.2}
                >
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#444]">
                    Email corporativo
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@valkbr.com"
                    required
                    disabled={state === "loading"}
                    className="w-full rounded-lg border border-[#1A1A1A] bg-[#0F0F0F] px-4 py-[13px] text-sm text-white placeholder-[#333] transition-all duration-250 focus:border-[#E24B4A] focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(226,75,74,0.07)] disabled:opacity-50"
                  />
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.3}
                >
                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#E24B4A] px-4 py-[13px] text-[13px] font-semibold uppercase tracking-[0.04em] text-white transition-all duration-[180ms] hover:bg-[#D4403F] hover:[box-shadow:0_4px_24px_rgba(226,75,74,0.15)] active:scale-[0.98] disabled:opacity-70"
                  >
                    {state === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        ENVIANDO...
                      </>
                    ) : (
                      "ENTRAR COM MAGIC LINK"
                    )}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E24B4A]/10">
                <Mail className="h-8 w-8 text-[#E24B4A]" />
              </div>
              <p className="mt-5 text-sm font-medium text-white">
                Link enviado para
              </p>
              <p className="mt-1 text-sm text-[#E24B4A]">{email}</p>
              <p className="mt-3 text-xs text-[#666]">
                Verifique sua caixa de entrada
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <span className="absolute bottom-6 text-[10px] tracking-[0.08em] text-[#222]">
          powered by VALK
        </span>
      </div>

      {/* Ember animation keyframes */}
      <style jsx global>{`
        @keyframes ember {
          0% {
            opacity: 0;
            transform: translateY(0) scale(1);
          }
          10% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 0;
            transform: translateY(-320px) scale(0.2);
          }
        }
        .animate-ember {
          animation-name: ember;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}
