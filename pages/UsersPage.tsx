
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  UsersRound, UserPlus, UploadCloud, KeyRound, Shield, GraduationCap, Users2, Search,
  ArrowRight, User, History, X, Save, Edit, MoreVertical, Check, Trash2, ArrowLeft,
  File as FileIcon, Upload, CheckCircle, AlertCircle
} from 'lucide-react';

import { staff as initialStaff } from '../data/users';
import { students as initialStudents } from '../data/students';
import { parents as initialParents } from '../data/parents';
import { activityLogs as initialActivityLogs } from '../data/activityLogs';

import { GenericUser, UserStatus, Student, Staff, ParentTutor, ActivityLog } from '../types';
import { track } from '../analytics/track';
import { useHotkey } from '../hooks/useHotkey';
import { useDebounce } from '../hooks/useDebounce';
import { tokens } from '../design/tokens';
import Button from '../ui/Button';

// --- TYPE GUARDS & HELPERS ---
const isStudent = (user: GenericUser): user is Student => 'studentCode' in user;
const getFullName = (user: GenericUser): string => isStudent(user) ? user.fullName : user.name;
const getIdentifier = (user: GenericUser): string => isStudent(user) ? user.documentNumber : user.dni;
const getRole = (user: GenericUser): string => {
  if (isStudent(user)) return 'Estudiante';
  if ('relation' in user) return 'Apoderado';
  if ('category' in user) return user.category;
  return 'N/A';
};

// --- DESIGN TOKENS (for self-containment) ---
const pageTokens = {
  card: `bg-white dark:bg-[${tokens.color.surface}] rounded-[${tokens.radius.lg}px] border border-slate-200/80 dark:border-[${tokens.color.border}] transition-shadow shadow-sm`,
  focusVisible: `focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[${tokens.color.bg}] focus-visible:ring-[${tokens.color.focus}]`,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};


// --- CHILD COMPONENTS ---

const KpiCard: React.FC<{ title: string; value: number; onClick: () => void; icon: React.ElementType }> = ({ title, value, onClick, icon: Icon }) => (
  <motion.div variants={itemVariants}>
    <button onClick={onClick} className={`text-left p-6 rounded-[${tokens.radius.lg}px] border transition-all duration-200 group relative overflow-hidden ${pageTokens.card} hover:shadow-md hover:-translate-y-1 ${pageTokens.focusVisible}`}>
      <div className="relative z-10">
        <p className="font-semibold text-lg text-slate-600 dark:text-slate-300">{title}</p>
        <p className="text-5xl font-bold mt-2 text-slate-800 dark:text-slate-100">{value}</p>
      </div>
      <Icon size={80} className="absolute -right-5 -bottom-5 text-slate-100 dark:text-slate-700/50 transition-transform group-hover:scale-110" />
    </button>
  </motion.div>
);

const ActionTile: React.FC<{ title: string; icon: React.ElementType; onClick: () => void }> = ({ title, icon: Icon, onClick }) => (
  <motion.div variants={itemVariants}>
    <button onClick={onClick} className={`group text-left h-full flex flex-col justify-between p-6 ${pageTokens.card} hover:shadow-md hover:-translate-y-1 ${pageTokens.focusVisible}`}>
      <div>
        <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-xl w-fit mb-4">
          <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <div className="flex items-center justify-end text-indigo-600 dark:text-indigo-400 font-semibold mt-4 text-base">
        <span>Ejecutar</span>
        <ArrowRight size={20} className="ml-1 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  </motion.div>
);

const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: (user: GenericUser) => void; allUsers: GenericUser[] }> = ({ isOpen, onClose, onSelect, allUsers }) => {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredUsers = useMemo(() => {
        if (!query) return [];
        return allUsers.filter(u => getFullName(u).toLowerCase().includes(query.toLowerCase()) || getIdentifier(u).includes(query)).slice(0, 7);
    }, [query, allUsers]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
        }
    }, [isOpen]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(i => (i + 1) % filteredUsers.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => (i - 1 + filteredUsers.length) % filteredUsers.length);
        } else if (e.key === 'Enter' && filteredUsers[activeIndex]) {
            handleSelect(filteredUsers[activeIndex]);
        }
    };
    
    const handleSelect = (user: GenericUser) => {
        track('users_search_natural_selected', { userId: getIdentifier(user) });
        onSelect(user);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 z-50 flex justify-center pt-20">
                    <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }}
                        onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"
                        className={`w-full max-w-2xl bg-white dark:bg-[${tokens.color.surface}] rounded-[${tokens.radius.lg}px] shadow-2xl h-fit`}>
                        <div className="relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
                                placeholder="Buscar por nombre, DNI o rol..."
                                className={`w-full h-14 pl-12 pr-4 bg-transparent text-lg focus:outline-none text-slate-800 dark:text-slate-100`} />
                        </div>
                        {filteredUsers.length > 0 && (
                            <ul className={`border-t border-slate-200 dark:border-[${tokens.color.border}] max-h-96 overflow-y-auto p-2`}>
                                {filteredUsers.map((user, idx) => (
                                    <li key={getIdentifier(user)}>
                                        <button onClick={() => handleSelect(user)} onMouseMove={() => setActiveIndex(idx)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-md text-left ${activeIndex === idx ? 'bg-indigo-100 dark:bg-indigo-500/10' : ''}`}>
                                            <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100 capitalize">{getFullName(user).toLowerCase()}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{getRole(user)}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- MODAL COMPONENTS (Self-contained for this page) ---
const UserImportModal: React.FC<{ isOpen: boolean; onClose: () => void; onImport: (newUsers: any[]) => void; }> = ({ isOpen, onClose, onImport }) => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [parsedData, setParsedData] = useState<{data: any[], errors: any[]}>({data: [], errors: []});

    const resetState = () => {
        setStep(1); setFile(null); setParsedData({data: [], errors: []}); setIsLoading(false);
    };

    const handleClose = () => { resetState(); onClose(); };

    const handleDownloadTemplate = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        track('user_import_template_downloaded');
        const csvHeaders = "nombre_completo,dni,email,rol,tags\n";
        const blob = new Blob([csvHeaders], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "plantilla_usuarios.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleParseAndValidate = () => {
        if (!file) return;
        setIsLoading(true);
        setTimeout(() => { // Simulate processing
            setParsedData({ data: [{ name: 'NUEVO USUARIO 1', dni: '99999991', role: 'Docente' }, { name: 'NUEVO USUARIO 2', dni: '99999992', role: 'Estudiante'}], errors: [] });
            setStep(2);
            setIsLoading(false);
        }, 1500);
    };

    const handleConfirmImport = () => {
        setIsLoading(true);
        setTimeout(() => { // Simulate import
            track('user_import_completed', { count: parsedData.data.length });
            onImport(parsedData.data);
            handleClose();
        }, 1000);
    };
    
    return (
         <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative bg-white dark:bg-slate-900 shadow-2xl rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <header className="p-6 border-b border-slate-200 dark:border-slate-700 shrink-0"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Importar Usuarios desde CSV</h2><Button variant="tertiary" iconOnly icon={X} aria-label="Cerrar modal" onClick={handleClose} /></div></header>
                    <main className="flex-1 overflow-y-auto p-6">
                        {step === 1 && (
                            <div>
                                <p className="mb-4 text-slate-600 dark:text-slate-300">Suba un archivo CSV con las columnas: <code>nombre_completo, dni, email, rol, tags</code>. <a href="#" onClick={handleDownloadTemplate} className="text-indigo-600 font-semibold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">Descargar plantilla</a>.</p>
                                <div className="mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <FileIcon size={48} className="mx-auto text-slate-400"/>
                                        <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-900 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                <span>Seleccione un archivo</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                                            </label>
                                            <p className="pl-1">o arrástrelo aquí</p>
                                        </div>
                                        {file && <p className="text-xs text-slate-500">{file.name}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {step === 2 && (
                            <div>
                                <p className="text-lg font-semibold">Validación de Datos</p>
                                <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg flex justify-around">
                                    <div className="text-center"><CheckCircle className="mx-auto text-emerald-500 mb-1" /><p><span className="font-bold text-emerald-600 dark:text-emerald-400">{parsedData.data.length}</span> registros listos</p></div>
                                    <div className="text-center"><AlertCircle className="mx-auto text-rose-500 mb-1" /><p><span className="font-bold text-rose-600 dark:text-rose-400">{parsedData.errors.length}</span> con errores</p></div>
                                </div>
                            </div>
                        )}
                    </main>
                    <footer className="p-6 border-t border-slate-200 dark:border-slate-700 shrink-0 flex justify-end items-center gap-2">
                        {step === 1 && <Button variant="primary" onClick={handleParseAndValidate} disabled={!file || isLoading} aria-label="Validar Archivo">{isLoading ? 'Validando...' : 'Validar Archivo'}</Button>}
                        {step === 2 && <>
                            <Button variant="secondary" onClick={() => setStep(1)} disabled={isLoading} aria-label="Volver atrás">Atrás</Button>
                            <Button variant="primary" onClick={handleConfirmImport} disabled={parsedData.data.length === 0 || isLoading} aria-label="Confirmar e Importar">{isLoading ? 'Importando...' : 'Confirmar e Importar'}</Button>
                        </>}
                    </footer>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
    );
};

// --- Mock Drawer Component ---
const UserDetailDrawer: React.FC<{ user: GenericUser | null; onClose: () => void; onSave: (data: any) => void }> = ({ user, onClose, onSave }) => {
    const isCreating = !user;
    const [formData, setFormData] = useState(user || {});

    useEffect(() => {
      setFormData(user || {});
    }, [user])

    if (!user && !isCreating) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={onClose}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute right-0 top-0 h-full w-full max-w-lg bg-slate-50 dark:bg-slate-900 shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
                <header className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
                     <div>
                        <h2 id="drawer-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">{isCreating ? "Crear Usuario" : getFullName(user).toLowerCase()}</h2>
                        {!isCreating && <p className="text-slate-500 dark:text-slate-400">{getRole(user)}</p>}
                    </div>
                    <Button variant="tertiary" iconOnly icon={X} aria-label="Cerrar panel" onClick={onClose}/>
                </header>
                <main className="flex-1 overflow-y-auto p-6 space-y-4">
                     <p>Formulario de {isCreating ? 'creación' : 'edición'} para <strong className="capitalize">{isCreating ? "un nuevo usuario" : getFullName(user).toLowerCase()}</strong> iría aquí.</p>
                     {/* Simplified form for demo */}
                     <div className="space-y-4">
                        <input type="text" placeholder="Nombre completo" defaultValue={user ? getFullName(user) : ''} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                        <select defaultValue={user ? getRole(user) : 'Estudiante'} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                          <option>Estudiante</option>
                          <option>Docente</option>
                          <option>Administrativo</option>
                          <option>Apoderado</option>
                        </select>
                     </div>
                </main>
                <footer className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center gap-2">
                    <Button variant="secondary" aria-label="Cancelar" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" aria-label={isCreating ? "Crear Usuario" : "Guardar Cambios"} onClick={() => onSave(formData)} icon={Save}>{isCreating ? "Crear Usuario" : "Guardar Cambios"}</Button>
                </footer>
            </motion.div>
        </motion.div>
    );
};


// --- MAIN PAGE COMPONENT ---
const UsersPage: React.FC = () => {
    const [staff, setStaff] = useState(initialStaff);
    const [students, setStudents] = useState(initialStudents);
    const [parents, setParents] = useState(initialParents);
    
    const allUsers = useMemo(() => [...staff, ...students, ...parents], [staff, students, parents]);

    const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
    const [listTitle, setListTitle] = useState('Todos los Usuarios');
    const [filteredUsers, setFilteredUsers] = useState<GenericUser[]>(allUsers);
    
    const [isPaletteOpen, setPaletteOpen] = useState(false);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [activeUser, setActiveUser] = useState<GenericUser | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

    useHotkey(() => setPaletteOpen(true));

    const counts = useMemo(() => ({
        staff: staff.length,
        students: students.length,
        parents: parents.length,
        total: allUsers.length,
    }), [staff, students, parents, allUsers]);
    
    const handleCollectionClick = (collection: 'staff' | 'students' | 'parents' | 'total') => {
        track('user_collection_viewed', { collection });
        switch(collection) {
            case 'staff': setListTitle('Personal'); setFilteredUsers(staff); break;
            case 'students': setListTitle('Estudiantes'); setFilteredUsers(students); break;
            case 'parents': setListTitle('Apoderados'); setFilteredUsers(parents); break;
            default: setListTitle('Todos los Usuarios'); setFilteredUsers(allUsers);
        }
        setView('list');
    };

    const openDrawer = (user: GenericUser | null) => {
        const event = user ? 'drawer_opened' : 'user_create_started';
        track(event, { userId: user ? getIdentifier(user) : undefined });
        setActiveUser(user);
        setDrawerOpen(true);
    };

    const handleBackToDashboard = () => {
        setView('dashboard');
        setSelectedUsers(new Set());
    };
    
    const handleSaveUser = (data: any) => {
        const isCreating = !activeUser;
        const name = data.name || 'Nuevo Usuario';
        if (isCreating) {
            // FIX: Explicitly type `newUser` as `Staff` to ensure it conforms to the interface
            // and TypeScript infers literal types correctly for properties like `category`.
            const newUser: Staff = {
                dni: `DNI-${Date.now()}`,
                name: name,
                avatarUrl: `https://ui-avatars.com/api/?name=${name.replace(/\s/g, '+')}`,
                status: 'Pendiente' as UserStatus,
                category: 'Docente',
                role: 'Docente',
                area: 'N/A',
                sede: 'Norte',
                tags: [],
            };
            setStaff(prev => [newUser, ...prev]);
            toast.success(`Usuario ${name} creado con éxito.`, { icon: '🎉' });
        } else {
            toast.success(`Datos de ${getFullName(activeUser!)} guardados.`, { icon: '💾' });
        }
        setDrawerOpen(false);
        setActiveUser(null);
    }
    
    const handleImportUsers = (newUsers: any[]) => {
        const createdUsers = newUsers.map(u => ({
            ...u,
            avatarUrl: `https://ui-avatars.com/api/?name=${u.name.replace(/\s/g, '+')}`,
            status: 'Pendiente' as UserStatus,
            category: 'Docente',
            area: 'N/A',
            sede: 'Norte',
            tags: [],
        }));
        setStaff(prev => [...createdUsers, ...prev]);
        toast.success(`${createdUsers.length} usuarios importados correctamente.`);
    };
    
    const renderDashboardView = () => (
        <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Panel de Usuarios</h1>
            </motion.div>
            
            <motion.section 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Personal" value={counts.staff} icon={Shield} onClick={() => handleCollectionClick('staff')} />
                <KpiCard title="Estudiantes" value={counts.students} icon={GraduationCap} onClick={() => handleCollectionClick('students')} />
                <KpiCard title="Apoderados" value={counts.parents} icon={Users2} onClick={() => handleCollectionClick('parents')} />
                <KpiCard title="Total" value={counts.total} icon={UsersRound} onClick={() => handleCollectionClick('total')} />
            </motion.section>

            <motion.section 
                 variants={{
                    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
                    hidden: { opacity: 0 }
                 }}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ActionTile title="Crear Nuevo Usuario" icon={UserPlus} onClick={() => openDrawer(null)} />
              <ActionTile title="Importar desde CSV" icon={UploadCloud} onClick={() => { track('user_import_started'); setImportModalOpen(true); }} />
              <ActionTile title="Restablecer Claves" icon={KeyRound} onClick={() => toast('Función de reseteo masivo no implementada.')} />
            </motion.section>

            <motion.div variants={itemVariants}>
                <button onClick={() => setPaletteOpen(true)} className={`w-full h-16 flex items-center pl-6 text-left text-lg text-slate-500 dark:text-slate-400 border rounded-[${tokens.radius.lg}px] ${pageTokens.card} hover:shadow-md ${pageTokens.focusVisible}`}>
                    <Search size={24} className="mr-4 text-slate-400"/>
                    Buscar por nombre, DNI o rol...
                    <span className="ml-auto mr-4 text-sm border px-2 py-0.5 rounded-md">Ctrl+K</span>
                </button>
            </motion.div>
        </motion.div>
    );
    
    const renderListView = () => (
      <div>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
                <Button variant="secondary" aria-label="Volver al panel" onClick={handleBackToDashboard} icon={ArrowLeft} />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{listTitle}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{filteredUsers.length} perfiles encontrados.</p>
                </div>
            </div>
            <Button variant="primary" aria-label="Crear Usuario" icon={UserPlus} onClick={() => openDrawer(null)}>Crear Usuario</Button>
        </div>
        
        <div className={`overflow-x-auto ${pageTokens.card} !p-0`}>
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                    <th className="p-4 w-12"><input type="checkbox" className={`h-5 w-5 rounded border-slate-300 text-indigo-600 ${pageTokens.focusVisible}`} /></th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Nombre</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Rol</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Estado</th>
                </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={getIdentifier(user)} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50" aria-selected={selectedUsers.has(getIdentifier(user))}>
                    <td className="p-4 w-12"><input type="checkbox" checked={selectedUsers.has(getIdentifier(user))} onChange={() => {
                        setSelectedUsers(p => { const n = new Set(p); n.has(getIdentifier(user)) ? n.delete(getIdentifier(user)) : n.add(getIdentifier(user)); return n; })
                    }} className={`h-5 w-5 rounded border-slate-300 text-indigo-600 ${pageTokens.focusVisible}`} /></td>
                    <td className="px-4 py-3">
                        <button onClick={() => openDrawer(user)} className={`flex items-center gap-3 text-left rounded ${pageTokens.focusVisible}`}>
                            <img src={user.avatarUrl} alt={getFullName(user)} className="w-11 h-11 rounded-full" />
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100 capitalize">{getFullName(user).toLowerCase()}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{getIdentifier(user)}</p>
                            </div>
                        </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{getRole(user)}</td>
                    <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${user.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{user.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    return (
        <div style={{ minHeight: 'calc(100vh - 10rem)' }}>
            <AnimatePresence mode="wait">
                <motion.div key={view} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    {view === 'dashboard' ? renderDashboardView() : renderListView()}
                </motion.div>
            </AnimatePresence>
            
            <CommandPalette isOpen={isPaletteOpen} onClose={() => setPaletteOpen(false)} onSelect={(user) => openDrawer(user)} allUsers={allUsers} />

            <AnimatePresence>
                {isDrawerOpen && <UserDetailDrawer user={activeUser} onClose={() => { setDrawerOpen(false); setActiveUser(null); }} onSave={handleSaveUser} />}
            </AnimatePresence>

            <UserImportModal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleImportUsers} />
            
            <AnimatePresence>
                {selectedUsers.size > 0 && view === 'list' && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto bg-slate-800/90 backdrop-blur-sm text-white rounded-xl shadow-2xl z-40 flex items-center gap-6 px-4 py-3 border border-slate-700">
                         <div className="flex items-center gap-2">
                            <span className="bg-indigo-500 text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full">{selectedUsers.size}</span>
                            <span className="font-semibold text-base">Seleccionados</span>
                            <button onClick={() => setSelectedUsers(new Set())} className="ml-2 text-slate-300 hover:text-white transition"><X size={20} /></button>
                         </div>
                         <div className="h-6 w-px bg-slate-600"></div>
                         <div className="flex items-center gap-2">
                            <Button variant="tertiary" onClick={() => { track('bulk_action_applied', { action: 'reset_keys', count: selectedUsers.size }); toast.success(`${selectedUsers.size} claves restablecidas.`); setSelectedUsers(new Set());}} aria-label="Restablecer Claves">Restablecer Claves</Button>
                            <Button variant="danger" onClick={() => { track('bulk_action_applied', { action: 'delete', count: selectedUsers.size }); toast.error(`${selectedUsers.size} usuarios eliminados.`); setSelectedUsers(new Set());}} aria-label="Eliminar Seleccionados">Eliminar</Button>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UsersPage;
