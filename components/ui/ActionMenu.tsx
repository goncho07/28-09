import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionMenuItem {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
}

interface ActionMenuProps {
    isOpen: boolean;
    onClose: () => void;
    items: ActionMenuItem[];
}

const ActionMenu: React.FC<ActionMenuProps> = ({ isOpen, onClose, items }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.1 }}
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 dark:ring-slate-700 z-30"
                    onClick={onClose}
                >
                    <div className="py-1">
                        {items.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.onClick}
                                className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ActionMenu;
