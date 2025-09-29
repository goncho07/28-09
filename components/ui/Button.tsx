import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { LucideProps } from 'lucide-react';
import { tokens } from '../../design/tokens';

// FIX: Omit 'children' from HTMLMotionProps and redefine it as React.ReactNode to resolve type conflict.
interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  icon?: React.ComponentType<LucideProps>;
  children?: React.ReactNode;
}

// FIX: Changed component definition from React.FC to a standard function component to avoid type conflicts with framer-motion's children prop.
// FIX: Removed explicit JSX.Element return type to fix "Cannot find namespace 'JSX'" error.
const Button = ({ children, variant = 'primary', icon: Icon, className = '', ...props }: ButtonProps) => {
  const baseClasses = `inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[${tokens.color.bg}] focus-visible:ring-[${tokens.color.focus}] disabled:opacity-50 disabled:cursor-not-allowed`;

  const variantClasses = {
    primary: `bg-[${tokens.color.primary}] text-white shadow-lg shadow-indigo-500/20 hover:bg-[${tokens.color.primaryHover}]`,
    secondary: `bg-white dark:bg-[${tokens.color.surface}] text-slate-700 dark:text-[${tokens.color.text}] border border-slate-200 dark:border-[${tokens.color.border}] shadow-sm hover:bg-slate-50 dark:hover:bg-[${tokens.color.surface2}]`,
    tertiary: `bg-transparent text-slate-600 dark:text-[${tokens.color.textMuted}] hover:bg-slate-100 dark:hover:bg-[${tokens.color.surface2}]`,
    danger: `bg-[${tokens.color.danger}] text-white shadow-lg shadow-rose-500/20 hover:opacity-90`,
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </motion.button>
  );
};

export default Button;