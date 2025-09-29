import React from 'react';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const ToastContainer = () => {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        success: {
          iconTheme: {
            primary: '#10b981', // emerald-500
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#f43f5e', // rose-500
            secondary: 'white',
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <motion.div
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-sm"
            >
              <div className="shrink-0">
                {t.type === 'success' && <CheckCircle className="text-emerald-500" />}
                {t.type === 'error' && <AlertCircle className="text-rose-500" />}
                {t.type === 'loading' && icon}
                {t.type !== 'success' && t.type !== 'error' && t.type !== 'loading' && <Info className="text-sky-500" />}
              </div>
              <div className="flex-1 text-sm font-semibold">{message}</div>
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <X size={16} />
                </button>
              )}
            </motion.div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default ToastContainer;
