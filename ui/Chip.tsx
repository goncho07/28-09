import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { X } from 'lucide-react';
import { tokens } from '../design/tokens';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onRemove?: () => void;
  isPressed?: boolean;
}

const Chip: React.FC<ChipProps> = ({ children, onRemove, isPressed, ...props }) => {
  const baseClasses = `inline-flex items-center gap-1.5 h-8 pl-3 text-sm font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[${tokens.color.bg}] focus-visible:ring-[${tokens.color.focus}]`;
  const colorClasses = isPressed
    ? `bg-[${tokens.color.primary}] text-white`
    : `bg-slate-200 dark:bg-[${tokens.color.surface2}] text-slate-700 dark:text-[${tokens.color.text}] hover:bg-slate-300 dark:hover:bg-[${tokens.color.border}]`;
  
  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <button {...props} aria-pressed={isPressed}>
        {children}
      </button>
      {onRemove && (
        <>
          <span className={`w-px h-4 ${isPressed ? 'bg-white/30' : 'bg-slate-300 dark:bg-slate-500'}`} />
          <button
            onClick={onRemove}
            aria-label={`Quitar filtro ${children}`}
            className={`p-1 rounded-full ${isPressed ? 'hover:bg-white/20' : 'hover:bg-slate-300/80 dark:hover:bg-slate-600'}`}
          >
            <X size={14} />
          </button>
        </>
      )}
    </div>
  );
};

export default Chip;
