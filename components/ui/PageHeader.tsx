import React from 'react';
import { motion } from 'framer-motion';
import { LucideProps } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<LucideProps>;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon: Icon, actions }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-xl">
          <Icon size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400 max-w-2xl">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </motion.header>
  );
};

export default PageHeader;
