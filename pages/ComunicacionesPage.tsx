import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { track } from '../analytics/track';
import useWhatsappLogStore from '../store/whatsappLogStore';
import { WhatsappMessage } from '../types';
import Table from '../ui/Table';
import Button from '../ui/Button';
import { pageTransitionVariants, itemVariants } from '../design/animations';
import { formatInPeru } from '../utils/time';

const ComunicacionesPage: React.FC = () => {
    const { messages, retryMessage } = useWhatsappLogStore();
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredMessages = useMemo(() => {
        if (statusFilter === 'all') return messages;
        return messages.filter(m => m.status === statusFilter);
    }, [messages, statusFilter]);

    const getStatusInfo = (status: WhatsappMessage['status']) => {
        switch (status) {
            case 'enviado':
            case 'entregado':
                return { icon: CheckCircle, color: 'text-emerald-500' };
            case 'fallido':
                return { icon: XCircle, color: 'text-rose-500' };
            case 'en cola':
            default:
                return { icon: Clock, color: 'text-slate-500' };
        }
    };
    
    const columns = [
        {
            key: 'status',
            header: 'Estado',
            sortable: true,
            render: (msg: WhatsappMessage) => {
                const { icon: Icon, color } = getStatusInfo(msg.status);
                return <div className="flex justify-center"><Icon size={24} className={color} /></div>;
            }
        },
        {
            key: 'targetName',
            header: 'Estudiante/Personal',
            sortable: true,
            render: (msg: WhatsappMessage) => (
                <div>
                    <p className="font-semibold text-lg text-slate-800 dark:text-slate-100 capitalize">{msg.targetName.toLowerCase()}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Apoderado: {msg.recipientName}</p>
                </div>
            )
        },
        {
            key: 'recipientPhone',
            header: 'Número de Contacto',
            render: (msg: WhatsappMessage) => <p className="text-base">{msg.recipientPhone}</p>
        },
        {
            key: 'timestamp',
            header: 'Fecha y Hora',
            sortable: true,
            render: (msg: WhatsappMessage) => <p className="text-base">{formatInPeru(new Date(msg.timestamp), 'dd/MM/yy HH:mm:ss')}</p>
        },
        {
            key: 'statusMessage',
            header: 'Detalle',
            render: (msg: WhatsappMessage) => <p className="text-sm text-slate-500 italic">{msg.statusMessage || '-'}</p>
        },
        {
            key: 'actions',
            header: 'Acciones',
            render: (msg: WhatsappMessage) => (
                msg.status === 'fallido' &&
                <Button
                    variant="secondary"
                    size="md"
                    aria-label="Reintentar envío"
                    icon={RefreshCw}
                    onClick={() => {
                        track('whatsapp_retry_manual', { messageId: msg.id });
                        retryMessage(msg.id);
                    }}
                >
                    Reintentar
                </Button>
            )
        },
    ];

    return (
        <motion.div
            variants={pageTransitionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Bandeja de Notificaciones</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">Registro de todos los mensajes de asistencia enviados a apoderados y personal.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                <div className="flex items-center gap-4 mb-4">
                    <label htmlFor="status-filter" className="text-base font-semibold text-slate-600 dark:text-slate-300">Filtrar por estado:</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="p-2 text-base border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition focus:outline-none"
                    >
                        <option value="all">Todos</option>
                        <option value="enviado">Enviado</option>
                        <option value="fallido">Fallido</option>
                        <option value="en cola">En Cola</option>
                    </select>
                </div>

                <Table 
                    columns={columns}
                    rows={filteredMessages}
                    getRowId={(msg) => msg.id}
                    sortConfig={null}
                    onSort={() => {}}
                    selectable={false}
                    selectedRowIds={new Set()}
                    onSelect={() => {}}
                    onSelectAll={() => {}}
                />
            </motion.div>
        </motion.div>
    );
};

export default ComunicacionesPage;