"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ActivityLiveToast({ message }: { message: string | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!message) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 3200);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <AnimatePresence>
      {show && message && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2"
        >
          <div className="rounded-full border border-line bg-canvas/95 px-4 py-2 shadow-lg backdrop-blur-md">
            <span className="font-display text-sm text-ink">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
