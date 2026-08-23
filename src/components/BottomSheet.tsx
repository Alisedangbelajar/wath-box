import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxHeightClass?: string;
  headerAction?: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxHeightClass = 'max-h-[88vh]',
  headerAction,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-auto">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-xs"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative w-full max-w-lg bg-neutral-950 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col ${maxHeightClass} z-10 overflow-hidden`}
          >
            {/* Grab Handle */}
            <div className="pt-2.5 pb-1 flex justify-center cursor-pointer select-none" onClick={onClose}>
              <div className="w-10 h-1 rounded-full bg-neutral-700/80 hover:bg-neutral-500 transition-colors" />
            </div>

            {/* Header */}
            {(title || icon) && (
              <div className="px-5 py-3 border-b border-neutral-800/80 flex items-center justify-between shrink-0 bg-neutral-900/60 backdrop-blur">
                <div className="flex items-center gap-2.5 min-w-0">
                  {icon && (
                    <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      {icon}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-serif-luxury text-sm font-bold text-neutral-100 truncate tracking-wide">
                      {title}
                    </h3>
                    {subtitle && (
                      <p className="text-[10px] text-neutral-400 font-mono-tech truncate mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {headerAction}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
