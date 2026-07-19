import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Requirement } from "../data/prerequisites";

interface GuidedPopoverProps {
  open: boolean;
  onClose: () => void;
  requirement: Requirement;
  onCta: () => void;
  children: React.ReactNode;
}

export const GuidedPopover: React.FC<GuidedPopoverProps> = ({
  open,
  onClose,
  requirement,
  onCta,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positionAbove, setPositionAbove] = useState(false);
  const [popover, setPopover] = useState({ left: 0, arrowLeft: 130, width: 260 });

  useEffect(() => {
    if (!open) return;

    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const PAD = 8;
      const vw = window.innerWidth;
      const width = Math.min(260, vw - PAD * 2);
      setPositionAbove(window.innerHeight - rect.bottom < 240);
      const center = rect.left + rect.width / 2;
      let desiredLeft = center - width / 2;
      desiredLeft = Math.max(PAD, Math.min(desiredLeft, vw - width - PAD));
      setPopover({ left: desiredLeft - rect.left, arrowLeft: center - desiredLeft, width });
    };

    measure();
    window.addEventListener("resize", measure);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", measure);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {children}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: positionAbove ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: positionAbove ? -10 : 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-50 bg-brand-surface border border-brand-border rounded p-4 shadow-xl text-left ${
              positionAbove ? "bottom-full mb-3" : "top-full mt-3"
            }`}
            style={{ left: popover.left, width: popover.width }}
            id="guided-popover-panel"
          >
            {/* Arrow */}
            <div
              className={`absolute -translate-x-1/2 w-2.5 h-2.5 bg-brand-surface border-t border-l border-brand-border rotate-45 ${
                positionAbove ? "top-full -mt-1 border-t-0 border-l-0 border-b border-r" : "bottom-full -mb-1"
              }`}
              style={{ left: popover.arrowLeft }}
            />

            <div className="relative z-10 space-y-2.5">
              <h4 className="text-xs font-bold text-brand-accent uppercase font-mono tracking-wider">
                {requirement.title}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {requirement.message}
              </p>
              <button
                type="button"
                onClick={() => {
                  onCta();
                  onClose();
                }}
                className="w-full bg-brand-accent hover:bg-indigo-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider py-2 px-3 rounded transition-all duration-200 cursor-pointer text-center"
              >
                {requirement.ctaLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
