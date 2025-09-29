import React, { useState, useMemo } from 'react';
import { MessageSquare, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { track } from '../analytics/track';
import useWhatsappLogStore from '../store/whatsappLogStore';
import { WhatsappMessage } from '../types';

// New Architecture Components
import ModulePage from '../layouts/ModulePage';
import FilterBar from '../ui/FilterBar';
import Table from '../ui/Table';
import Button from '../ui/Button';

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
        { key: 'status', header: 'Estado', sortable: true, render: (msg: WhatsappMessage) => {
            const { icon: Icon, color } = getStatusInfo(msg.status);
            return <div className="flex justify-center"><Icon size={20} className={color} /></div>;
        }},
        { key: 'targetName', header: 'Estudiante/Personal', sortable: true, render: (msg: WhatsappMessage) => (
            <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100 capitalize">{msg.targetName.toLowerCase()}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Apoderado: {msg.recipientName}</p>
            </div>
        )},
        { key: 'recipientPhone', header: 'Número de Contacto', render: (msg: WhatsappMessage) => msg.recipientPhone },
        { key: 'timestamp', header: 'Fecha y Hora', sortable: true, render: (msg: WhatsappMessage) => new Date(msg.timestamp).toLocaleString('es-PE') },
        { key: 'statusMessage', header: 'Detalle', render: (msg: WhatsappMessage) => <p className="text-xs text-slate-500 italic">{msg.statusMessage || '-'}</p> },
        { key: 'actions', header: 'Acciones', render: (msg: WhatsappMessage) => (
            msg.status === 'fallido' && <Button variant="secondary" aria-label="Reintentar envío" icon={RefreshCw} onClick={() => {
                track('whatsapp_retry_manual', { messageId: msg.id });
                retryMessage(msg.id);
            }}>Reintentar</Button>
        )},
    ];

    return (
        <ModulePage
            title="Bandeja de Notificaciones por WhatsApp"
            description="Registro en tiempo real de todos los mensajes de asistencia enviados a apoderados y personal."
            icon={MessageSquare}
            filters={
                <FilterBar
                    activeFilters={statusFilter !== 'all' ? [{id: 'status', label: `Estado: ${statusFilter}`}] : []}
                    onRemoveFilter={() => setStatusFilter('all')}
                    onClearAll={() => setStatusFilter('all')}
                >
                    <div className="flex items-center gap-2">
                        <label htmlFor="status-filter" className="text-sm font-semibold text-slate-500 dark:text-slate-400">Filtrar por estado:</label>
                        <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
                            <option value="all">Todos</option>
                            <option value="enviado">Enviado</option>
                            <option value="fallido">Fallido</option>
                            <option value="en cola">En Cola</option>
                        </select>
                    </div>
                </FilterBar>
            }
            content={
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
            }
        />
    );
};

export default ComunicacionesPage;