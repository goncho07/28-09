import React from 'react';
import { motion } from 'framer-motion';
import { Network, MessageSquare, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import { pageTransitionVariants, itemVariants } from '../design/animations';

const IntegrationsPage: React.FC = () => {
    const handleWhatsAppClick = () => {
        toast.success('La configuración de WhatsApp se gestiona de forma centralizada y no requiere ajustes manuales.', {
            duration: 4000,
        });
    };

    return (
        <motion.div
            variants={pageTransitionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Integraciones</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">Conecte y gestione servicios de terceros para ampliar la funcionalidad.</p>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <Card onClick={handleWhatsAppClick} className="h-full flex flex-col justify-between group cursor-pointer">
                    <div>
                        <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-xl w-fit mb-4">
                           <MessageSquare size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Notificaciones por WhatsApp</h3>
                        <p className="text-base text-slate-500 dark:text-slate-400 mt-2">Envío automático de mensajes de asistencia a apoderados y personal.</p>
                    </div>
                    <div className="flex items-center justify-end text-indigo-600 dark:text-indigo-400 font-semibold mt-6 text-lg">
                        <span>Ver Estado</span>
                        <ArrowRight size={22} className="ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default IntegrationsPage;