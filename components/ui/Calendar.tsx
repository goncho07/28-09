
import React from 'react';
import { Dot } from 'lucide-react';
import { format, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import startOfWeek from 'date-fns/startOfWeek';
import parseISO from 'date-fns/parseISO';
import { CalendarEvent } from '../../types';

interface CalendarProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const eventCategoryColors: Record<string, string> = {
    Examen: 'bg-amber-500',
    Feriado: 'bg-rose-500',
    Reunión: 'bg-indigo-500',
    Actividad: 'bg-emerald-500',
    UGEL: 'bg-violet-500',
    Cívico: 'bg-sky-500',
    Gestión: 'bg-slate-500',
};

const Calendar: React.FC<CalendarProps> = ({ currentDate, events, selectedDate, onSelectDate }) => {
  
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-b-2xl shadow-sm border border-t-0 border-slate-200/80 dark:border-slate-700/80">
      <div className="grid grid-cols-7 text-center text-sm font-bold text-slate-600 dark:text-slate-300 uppercase pb-2 border-b-2 border-slate-200 dark:border-slate-700">
        {daysOfWeek.map(day => <div key={day} className="py-3">{day}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = isSameDay(day, selectedDate);
          const isTodaysDate = isToday(day);
          
          const dayEvents = events.filter(e => isSameDay(parseISO(e.date), day));

          return (
            <button 
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={`relative h-36 p-3 border-b border-r border-slate-100 dark:border-slate-700 text-left transition-colors focus:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indigo-500 ${isCurrentMonth ? '' : 'bg-slate-50 dark:bg-slate-800/50'} ${!isSelected && isCurrentMonth ? 'hover:bg-slate-100 dark:hover:bg-slate-700/50' : ''} ${isSelected ? 'bg-indigo-100 dark:bg-indigo-500/20' : ''}`}
            >
              <div className={`flex items-center justify-center h-8 w-8 text-base font-medium rounded-full ${isTodaysDate ? 'bg-indigo-600 text-white font-bold' : isSelected ? 'bg-indigo-600 text-white font-bold' : ''} ${!isCurrentMonth ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
                {format(day, 'd')}
              </div>
              <div className="mt-2 space-y-1.5 overflow-y-auto max-h-20">
                {dayEvents.slice(0, 3).map(event => (
                  <div key={event.id} className="flex items-center gap-1.5 text-sm">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${eventCategoryColors[event.category] || 'bg-slate-400'}`}></div>
                    <span className="truncate font-medium text-slate-700 dark:text-slate-200">{event.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">+ {dayEvents.length - 3} más</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default Calendar;