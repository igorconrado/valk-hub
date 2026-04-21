"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const SHORTCUTS = [
  {
    category: "Geral",
    items: [
      { keys: ["\u2318", "K"], label: "Abrir busca rapida" },
      { keys: ["?"], label: "Mostrar atalhos" },
      { keys: ["Esc"], label: "Fechar painel/modal" },
    ],
  },
  {
    category: "Navegar",
    items: [
      { keys: ["\u2318", "K"], label: "Buscar e navegar" },
    ],
  },
  {
    category: "Task drawer",
    items: [
      { keys: ["Esc"], label: "Fechar painel" },
      { keys: ["\u2318", "\u21A9"], label: "Salvar edicao" },
    ],
  },
];

export function ShortcutsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 z-50 mx-auto w-[calc(100%-2rem)] sm:max-w-[420px]"
            style={{ top: "20vh" }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="overflow-hidden rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1F1F1F] px-5 py-4">
                <h2 className="font-display text-[16px] font-semibold text-white">
                  Atalhos
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Fechar"
                  className="rounded-md p-1 text-[#555] transition-colors hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-5 p-5">
                {SHORTCUTS.map((section) => (
                  <div key={section.category}>
                    <span className="eyebrow">{section.category}</span>
                    <div className="mt-2 space-y-2">
                      {section.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <span className="text-[13px] text-[#AAA]">
                            {item.label}
                          </span>
                          <div className="flex gap-1">
                            {item.keys.map((key) => (
                              <kbd
                                key={key}
                                className="rounded border border-[#2A2A2A] bg-[#141414] px-2 py-0.5 font-mono text-[11px] text-[#888]"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
