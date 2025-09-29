import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BulkBarProps {
  selectedCount: number;
  onClear: () => void;
  children: React.ReactNode;
}

const BulkBar: React.FC<BulkBarProps> = ({ selectedCount, onClear, children }) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 w-auto bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-sm text-white rounded-xl shadow-2xl z-40 flex items-center gap-6 px-4 py-3 border border-slate-700"
        >
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500 text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full">
              {selectedCount}
            </span>
            <span className="font-semibold text-base">Seleccionados</span>
            <button
              onClick={onClear}
              aria-label="Limpiar selección"
              className="ml-2 text-slate-300 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          <div className="h-6 w-px bg-slate-600"></div>
          <div className="flex items-center gap-2">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkBar;
