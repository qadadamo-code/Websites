"use client";
import { motion } from "motion/react";
import { waLink } from "@/lib/i18n";

export function WhatsAppFab({ text, label }: { text: string; label: string }) {
  return (
    <motion.a
      href={waLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring" }}
      className="fixed bottom-5 end-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] shadow-lg shadow-black/40 transition-transform hover:scale-110"
      data-track="whatsapp"
    >
      <svg viewBox="0 0 24 24" className="size-7 fill-[#05210f]" aria-hidden>
        <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8.2 8.2 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-1-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.5 13.5 0 0 0 5.2 4.6c3 1.2 3 .8 3.6.7a3 3 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.3-.6-.4M12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8m8.4-18.2A11.8 11.8 0 0 0 1.8 17.8L.1 24l6.4-1.7a11.8 11.8 0 0 0 5.6 1.4A11.8 11.8 0 0 0 20.4 3.6" />
      </svg>
    </motion.a>
  );
}
