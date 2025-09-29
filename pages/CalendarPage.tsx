

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addMonths, isSameDay } from 'date-fns';
import subMonths from 'date-fns/subMonths';
import parseISO from 'date-fns/parseISO';
import startOfToday from 'date-fns/startOfToday';
import es from 'date-fns/locale/es';
import PageHeader from '../components/ui/PageHeader';
import Calendar from '../components/ui/Calendar';
import Button from '../components/ui/Button';
import { mockEvents } from '../data/events';
import { CalendarEvent } from '../types';

const eventCategoryColors: Record<string, string> = {
    Examen: 'border-amber-500',
    Feriado: 'border-rose-500',
    Reunión: 'border-indigo-500',
    Actividad: 'border-emerald-500',
    UGEL: 'border-violet-500',
    Cívico: 'border-sky-500',
    Gestión: 'border-slate-500',
};

const AddEventModal: React.FC<{ isOpen: boolean, onClose: () => void, onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void, selectedDate: Date }> = ({ isOpen, onClose, onAddEvent, selectedDate }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<CalendarEvent['category']>('Actividad');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;
        onAddEvent({ title, category, date: format(selectedDate, 'yyyy-MM-dd') });
        setTitle('');
        setCategory('Actividad');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit}>
                             <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <h2 className="text-lg font-bold">Añadir Evento para {format(selectedDate, 'PPP', { locale: es })}</h2>
                                <button type="button" onClick={onClose}><X size={20}/></button>
                             </header>
                             <main className="p-6 space-y-4">
                                <div>
                                    <label htmlFor="title" className="text-sm font-semibold">Título</label>
                                    <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                                </div>
                                <div>
                                    <label htmlFor="category" className="text-sm font-semibold">Categoría</label>
                                    <select id="category" value={category} onChange={e => setCategory(e.target.value as CalendarEvent['category'])} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                                        <option>Actividad</option><option>Examen</option><option>Reunión</option><option>Feriado</option><option>UGEL</option><option>Cívico</option><option>Gestión</option>
                                    </select>
                                </div>
                             </main>
                             <footer className="p-4 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                                <Button type="submit">Guardar Evento</Button>
                             </footer>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const CalendarPage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1));
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    
    const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
        const newEvent = { ...event, id: Date.now().toString() };
        setEvents(prev => [...prev, newEvent].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    };

    const selectedDayEvents = useMemo(() => {
        return events
            .filter(e => isSameDay(parseISO(e.date), selectedDate))
            .sort((a, b) => a.title.localeCompare(b.title));
    }, [events, selectedDate]);
    
    return (
        <div className="space-y-6">
            <PageHeader
                title="Calendario Académico"
                subtitle="Organice y visualice todos los eventos importantes de la institución."
                icon={CalendarIcon}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-t-2xl border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeft size={20} /></button>
                           <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRight size={20} /></button>
                           <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 ml-2 capitalize">
                               {format(currentDate, 'MMMM yyyy', { locale: es })}
                           </h2>
                        </div>
                        <Button onClick={() => setCurrentDate(new Date())}>Hoy</Button>
                    </div>
                    <Calendar
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        events={events}
                    />
                </div>
                
                <aside className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 sticky top-24">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                           Eventos para {format(selectedDate, 'PPP', { locale: es })}
                        </h3>
                        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                            {selectedDayEvents.length > 0 ? (
                                selectedDayEvents.map(event => (
                                    <div key={event.id} className={`p-3 border-l-4 rounded-r-lg bg-slate-50 dark:bg-slate-700/50 ${eventCategoryColors[event.category] || 'border-slate-400'}`}>
                                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{event.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{event.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No hay eventos para esta fecha.</p>
                            )}
                        </div>
                         <Button onClick={() => setIsModalOpen(true)} icon={Plus} className="w-full !justify-center mt-4">Añadir Evento</Button>
                    </div>
                </aside>
            </div>
            
            <AddEventModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAddEvent={handleAddEvent}
                selectedDate={selectedDate}
            />

        </div>
    );
};

export default CalendarPage;