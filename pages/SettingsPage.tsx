import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette, ArrowRight } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import Card from '../ui/Card';
import { pageTransitionVariants, itemVariants } from '../design/animations';

const SettingsPage: React.FC = () => {
    const { theme, toggleTheme } = useUIStore();

    return (
        <motion.div
            variants={pageTransitionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Configuración del Sistema</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">Ajuste los parámetros del sistema y la apariencia.</p>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <Card onClick={toggleTheme} className="h-full flex flex-col justify-between group cursor-pointer">
                    <div>
                        <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-xl w-fit mb-4">
                           <Palette size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Apariencia</h3>
                        <p className="text-base text-slate-500 dark:text-slate-400 mt-2">Cambie entre el tema claro y oscuro para adaptar la interfaz a su preferencia.</p>
                    </div>
                    <div className="flex items-center justify-end text-indigo-600 dark:text-indigo-400 font-semibold mt-6 text-lg">
                        <span>Cambiar a tema {theme === 'light' ? 'oscuro' : 'claro'}</span>
                        <ArrowRight size={22} className="ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default SettingsPage;