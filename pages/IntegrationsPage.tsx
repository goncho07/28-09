
import React from 'react';
import { motion } from 'framer-motion';
import { Network, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModulePage from '../layouts/ModulePage';
import Card from '../ui/Card';

const IntegrationsPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <ModulePage
            title="Integraciones"
            description="Conecte y gestione servicios de terceros para ampliar la funcionalidad del sistema."
            icon={Network}
            // FIX: Added missing 'filters' prop required by ModulePageProps.
            filters={<></>}
            content={
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card onClick={() => navigate('/integrations/whatsapp')} className="h-full flex flex-col justify-between group">
                        <div>
                            <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-xl w-fit mb-4">
                               <MessageSquare size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Notificaciones por WhatsApp</h3>
                            <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Configure el envío automático de mensajes de asistencia.</p>
                        </div>
                        <div className="flex items-center justify-end text-indigo-600 dark:text-indigo-400 font-semibold mt-4 text-base">
                            <span>Configurar</span>
                            <ArrowRight size={20} className="ml-1 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Card>
                </motion.div>
            }
        />
    );
};

export default IntegrationsPage;
