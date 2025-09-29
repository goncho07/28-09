
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, QrCode, Download, TrendingUp, AlertTriangle, RefreshCw, Send, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { students } from '../data/students';
import { staff } from '../data/users';
import { parents } from '../data/parents';
import { track } from '../analytics/track';
import useWhatsappLogStore from '../store/whatsappLogStore';
import toast from 'react-hot-toast';

// New Architecture Components
import ModulePage from '../layouts/ModulePage';
import FilterBar from '../ui/FilterBar';
import KpiCard from '../components/ui/KpiCard';
import Table from '../ui/Table';
import Button from '../ui/Button';
import { WhatsappMessage } from '../types';

type AttendanceTab = 'dashboard' | 'estudiantes' | 'personal' | 'bandeja';

const LiveClock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    return (
        <div className="text-right">
            <p className="text-4xl font-bold text-slate-700 dark:text-slate-200">
                {time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                {time.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>
    );
};

const AsistenciaPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AttendanceTab>('dashboard');
  const { messages, addMessage, retryMessage } = useWhatsappLogStore();
  
  const dailyRecords = useMemo(() => {
    return messages
      .filter(m => m.template === 'entrada_presente' || m.template === 'entrada_tardanza')
      .map(m => ({
        id: m.targetId,
        name: m.targetName,
        avatarUrl: `https://ui-avatars.com/api/?name=${m.targetName.replace(/\s/g, '+')}&background=random`,
        status: m.template === 'entrada_presente' ? 'Presente' : 'Tarde',
        entryTime: new Date(m.timestamp).toLocaleTimeString('es-PE'),
      }));
  }, [messages]);

  const kpis = useMemo(() => {
    const sentCount = messages.filter(m => m.status === 'enviado' || m.status === 'entregado').length;
    const failedCount = messages.filter(m => m.status === 'fallido').length;
    return {
        studentAttendance: '92%',
        staffAttendance: '98%',
        latecomers: dailyRecords.filter(r => r.status === 'Tarde').length,
        absences: students.length - dailyRecords.length,
        notificationsSent: sentCount,
        notificationsFailed: failedCount,
    }
  }, [messages, dailyRecords]);

  const handleVerifyAbsences = () => {
    track('attendance_absences_verified');
    const presentStudentIds = new Set(dailyRecords.map(r => r.id));
    const absentStudents = students.filter(s => !presentStudentIds.has(s.documentNumber));
    
    if (absentStudents.length === 0) {
        toast.success("Todos los estudiantes han sido registrados.");
        return;
    }
    
    let notificationsTriggered = 0;
    absentStudents.forEach(student => {
        const parent = parents.find(p => student.tutorIds.includes(p.dni));
        if (parent && parent.phone) {
             addMessage({
                targetId: student.documentNumber,
                targetName: student.fullName,
                recipientName: parent.name,
                recipientPhone: parent.phone,
                template: 'entrada_falta',
            });
            notificationsTriggered++;
        }
    });
    toast.success(`Se enviaron ${notificationsTriggered} notificaciones de ausencia.`);
  };

  const getStatusChipClass = (status: string) => {
    switch (status) {
      case 'Presente': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300';
      case 'Tarde': return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300';
      case 'Ausente': return 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const attendanceColumns = [
      { key: 'name', header: 'Nombre', sortable: true, render: (item: any) => (
          <div className="flex items-center gap-3">
              <img src={item.avatarUrl} alt={item.name} className="w-10 h-10 rounded-full" />
              <span className="font-medium text-slate-800 dark:text-slate-100 capitalize">{item.name.toLowerCase()}</span>
          </div>
      )},
      { key: 'status', header: 'Estado', sortable: true, render: (item: any) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(item.status)}`}>{item.status}</span> },
      { key: 'entryTime', header: 'Hora de Ingreso', sortable: true, render: (item: any) => item.entryTime || 'N/A' },
  ];
  
  const getWhatsappStatusClass = (status: WhatsappMessage['status']) => {
    if (status === 'enviado' || status === 'entregado') return 'text-emerald-500';
    if (status === 'fallido') return 'text-rose-500';
    return 'text-slate-500';
  };

  const bandejaColumns = [
      { key: 'targetName', header: 'Destinatario', render: (msg: WhatsappMessage) => <span className="font-medium text-slate-800 dark:text-slate-100 capitalize">{msg.targetName.toLowerCase()}</span> },
      { key: 'recipientPhone', header: 'Número', render: (msg: WhatsappMessage) => msg.recipientPhone },
      { key: 'timestamp', header: 'Hora', sortable: true, render: (msg: WhatsappMessage) => new Date(msg.timestamp).toLocaleTimeString('es-PE') },
      { key: 'status', header: 'Estado', sortable: true, render: (msg: WhatsappMessage) => <span className={`font-semibold capitalize ${getWhatsappStatusClass(msg.status)}`}>{msg.status}</span> },
      { key: 'actions', header: 'Acciones', render: (msg: WhatsappMessage) => (
          msg.status === 'fallido' ? <Button variant="secondary" size="md" aria-label="Reintentar envío" onClick={() => retryMessage(msg.id)} icon={RefreshCw}>Reintentar</Button> : null
      )},
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }};


  return (
    <ModulePage
      title="Gestión de Asistencia"
      description="Monitoree la asistencia en tiempo real y gestione las notificaciones por WhatsApp."
      icon={ClipboardCheck}
      actionsRight={
          <>
              <Button variant="secondary" aria-label="Generar Reporte del Día" icon={Download} onClick={() => track('attendance_report_generated')}>Reporte del Día</Button>
              <Button variant="primary" aria-label="Escanear QR" icon={QrCode} onClick={() => navigate('/asistencia/scan')}>Escanear QR</Button>
          </>
      }
      filters={<></>}
      content={
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-6">
              <nav className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-4">
                  <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>Dashboard</button>
                  <button onClick={() => setActiveTab('estudiantes')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full ${activeTab === 'estudiantes' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>Asistencia del Día</button>
                  <button onClick={() => setActiveTab('bandeja')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full ${activeTab === 'bandeja' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>Bandeja de Salida</button>
              </nav>
              
                <AnimatePresence mode="wait">
                 <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {activeTab === 'dashboard' && (
                        <motion.div 
                            className="space-y-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                             <motion.div variants={itemVariants} className="flex justify-end"><LiveClock /></motion.div>
                             <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                             >
                                <motion.div variants={itemVariants} className="border-l-8 border-emerald-500 pl-4 rounded-r-lg"><KpiCard title="Asistencia Estudiantil" value={kpis.studentAttendance} icon={TrendingUp} /></motion.div>
                                <motion.div variants={itemVariants} className="border-l-8 border-amber-500 pl-4 rounded-r-lg"><KpiCard title="Tardanzas" value={kpis.latecomers} icon={Clock} /></motion.div>
                                <motion.div variants={itemVariants} className="border-l-8 border-rose-500 pl-4 rounded-r-lg"><KpiCard title="Ausencias" value={kpis.absences} icon={AlertTriangle} /></motion.div>
                                <motion.div variants={itemVariants} className="border-l-8 border-sky-500 pl-4 rounded-r-lg"><KpiCard title="Asistencia Personal" value={kpis.staffAttendance} icon={TrendingUp} /></motion.div>
                            </motion.div>
                            <motion.div variants={itemVariants} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Verificar Ausencias</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Envía notificaciones a los apoderados de alumnos sin registro de entrada.</p>
                                </div>
                                <Button variant="primary" aria-label="Verificar ausentes y notificar" onClick={handleVerifyAbsences} icon={Send}>Verificar y Notificar</Button>
                            </motion.div>
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                <motion.div variants={itemVariants}><KpiCard title="Notificaciones Enviadas" value={kpis.notificationsSent} icon={Send} /></motion.div>
                                <motion.div variants={itemVariants}><KpiCard title="Notificaciones Fallidas" value={kpis.notificationsFailed} icon={XCircle} /></motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                    {activeTab === 'estudiantes' && <Table columns={attendanceColumns} rows={dailyRecords} getRowId={(item: any) => item.id} sortConfig={null} onSort={() => {}} selectable={false} selectedRowIds={new Set()} onSelect={() => {}} onSelectAll={() => {}}/>}
                    {activeTab === 'bandeja' && <Table columns={bandejaColumns} rows={messages} getRowId={(item: any) => item.id} sortConfig={null} onSort={() => {}} selectable={false} selectedRowIds={new Set()} onSelect={() => {}} onSelectAll={() => {}}/>}
                 </motion.div>
                </AnimatePresence>
          </div>
      }
    />
  );
};

export default AsistenciaPage;
