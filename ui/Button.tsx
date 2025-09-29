import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { LucideProps } from 'lucide-react';
import { tokens } from '../design/tokens';
import { getAriaProps } from '../design/a11y';

// FIX: Omit 'children' from HTMLMotionProps and redefine it as React.ReactNode to resolve type conflict.
interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'disabled' | 'children'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'md' | 'lg';
  icon?: React.ComponentType<LucideProps>;
  iconOnly?: boolean;
  'aria-label': string;
  disabled?: boolean;
  children?: React.ReactNode;
}

// FIX: Changed component definition from React.FC to a standard function component to avoid type conflicts with framer-motion's children prop.
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon: Icon, 
  iconOnly = false,
  className = '', 
  disabled = false,
  ...props 
// FIX: Removed explicit JSX.Element return type to fix "Cannot find namespace 'JSX'" error.
}: ButtonProps) => {
  const baseClasses = `inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:outline-[3px] focus-visible:outline-solid focus-visible:outline-[${tokens.color.focus}] focus-visible:outline-offset-2`;

  const sizeClasses = {
    md: `px-4 h-11 min-h-[44px] text-[${tokens.fontSize.sm}px]`,
    lg: `px-6 h-12 min-h-[44px] text-[${tokens.fontSize.md}px]`,
    iconMd: `w-11 h-11 min-h-[44px]`,
    iconLg: `w-12 h-12 min-h-[44px]`,
  };

  const variantClasses = {
    primary: `bg-[${tokens.color.primary}] text-white shadow-lg shadow-indigo-500/20 hover:bg-[${tokens.color.primaryHover}] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none`,
    secondary: `bg-white dark:bg-[${tokens.color.surface}] text-slate-700 dark:text-[${tokens.color.text}] border border-slate-200 dark:border-[${tokens.color.border}] shadow-sm hover:bg-slate-50 dark:hover:bg-[${tokens.color.surface2}] disabled:opacity-60 disabled:cursor-not-allowed`,
    tertiary: `bg-transparent text-slate-600 dark:text-[${tokens.color.textMuted}] hover:bg-slate-100 dark:hover:bg-[${tokens.color.surface2}] disabled:opacity-60 disabled:cursor-not-allowed`,
    danger: `bg-[${tokens.color.danger}] text-white shadow-lg shadow-rose-500/20 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`,
  };
  
  const currentSizeClass = iconOnly ? sizeClasses[`icon${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof sizeClasses] : sizeClasses[size];

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`${baseClasses} ${currentSizeClass} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      aria-disabled={disabled}
      {...getAriaProps(props['aria-label'])}
      {...props}
    >
      {Icon && <Icon size={iconOnly ? 22 : 18} />}
      {!iconOnly && children}
    </motion.button>
  );
};

export default Button;