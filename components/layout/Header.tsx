import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Wifi, WifiOff, LogOut, User, Settings, ChevronsLeft, ChevronsRight, CheckCheck, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';
import { useNotificationStore } from '../../store/notificationStore';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import es from 'date-fns/locale/es';
import { useNavigate } from 'react-router-dom';

const NotificationsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
    const navigate = useNavigate();

    const handleNotificationClick = (notification: any) => {
        markAsRead(notification.id);
        if (notification.action) {
            navigate(notification.action.path);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-16 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                >
                    <header className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Notificaciones</h3>
                        {notifications.some(n => !n.read) && (
                            <button onClick={markAllAsRead} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1">
                                <CheckCheck size={14} /> Marcar todas como leídas
                            </button>
                        )}
                    </header>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <button key={n.id} onClick={() => handleNotificationClick(n)} className={`w-full text-left p-4 transition-colors ${!n.read ? 'bg-indigo-50 dark:bg-slate-700/50 hover:bg-indigo-100 dark:hover:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                    <div className="flex items-start gap-3">
                                        {!n.read && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></div>}
                                        <div className="flex-1">
                                            <p className={`text-sm ${!n.read ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>{n.message}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatDistanceToNow(n.timestamp, { addSuffix: true, locale: es })}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                <p>No tienes notificaciones nuevas.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const Header: React.FC = () => {
  const { toggleSidebar, isSidebarCollapsed, theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const isOnline = useOfflineStatus();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 shadow-sm sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500">
          {isSidebarCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative">
            <button onClick={() => setNotificationsOpen(p => !p)} className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500">
                <Bell />
                 {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                    </span>
                )}
            </button>
            <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        </div>
        
        <button onClick={toggleTheme} className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500">
            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <span className={`flex items-center gap-2 text-sm font-semibold ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span className="hidden sm:inline">{isOnline ? 'En Línea' : 'Sin Conexión'}</span>
        </span>
        
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 p-1 pr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500">
            <img className="h-10 w-10 rounded-full" src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="Avatar del usuario" />
            <div className="hidden md:block text-left">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span>
            </div>
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 dark:ring-slate-700 z-50"
              >
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
