import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, XCircle, Clock, UserCheck, CameraOff } from 'lucide-react';
import { AttendanceRecord, Student, ParentTutor } from '../types';
import { students as MOCK_STUDENTS_LIST } from '../data/students';
import { parents as MOCK_PARENTS_LIST } from '../data/parents';
import useWhatsappLogStore from '../store/whatsappLogStore';
import { useWhatsappSettingsStore } from '../store/whatsappSettingsStore';
import toast from 'react-hot-toast';

// Helper function moved outside component to be pure
const getStatusInfo = (status: AttendanceRecord['status']) => {
    switch(status) {
        case 'presente': return { text: 'Presente', Icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
        case 'tarde': return { text: 'Tardanza', Icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' };
        case 'salida': return { text: 'Salida', Icon: UserCheck, color: 'text-sky-400', bg: 'bg-sky-500/10' };
        default: return { text: 'Error', Icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' };
    }
};

// New component for displaying scan result to avoid IIFE and component-in-render anti-pattern
const ScanResultDisplay: React.FC<{result: { student: Student; status: AttendanceRecord['status'] }}> = ({ result }) => {
    const { Icon, text, color } = getStatusInfo(result.status);
    const borderColorClass = color.replace('text-', 'border-');
    return (
        <div className="flex items-center gap-4">
            <img src={result.student.avatarUrl} alt={result.student.fullName} className={`w-20 h-20 rounded-full border-4 ${borderColorClass}`}/>
            <div className="flex-1">
                <p className="text-2xl font-bold capitalize">{result.student.fullName.toLowerCase()}</p>
                <p className="text-base text-slate-300">{result.student.grade} "{result.student.section}"</p>
            </div>
            <div className={`flex items-center gap-2 text-2xl font-bold ${color}`}><Icon size={32} /><span>{text}</span></div>
        </div>
    );
};

const MOCK_STUDENTS: { [key: string]: Student } = MOCK_STUDENTS_LIST.reduce((acc, student) => {
    acc[student.documentNumber] = student;
    return acc;
}, {} as { [key: string]: Student });

const MOCK_PARENTS: { [key: string]: ParentTutor } = MOCK_PARENTS_LIST.reduce((acc, parent) => {
    acc[parent.dni] = parent;
    return acc;
}, {} as { [key: string]: ParentTutor });

// Business Rules: Time Windows
const getAttendanceStatus = (): { status: AttendanceRecord['status'] | 'fuera_de_horario', template: 'entrada_presente' | 'entrada_tardanza' | 'salida' | null } => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours + minutes / 60;

    const ENTRY_START = 8.0; // 08:00
    const ENTRY_TARDY = 8.5; // 08:30
    const EXIT_START = 14.83; // 14:50
    const EXIT_END = 16.0; // 16:00

    if (currentTime >= ENTRY_START && currentTime <= ENTRY_TARDY) {
        return { status: 'presente', template: 'entrada_presente' };
    }
    if (currentTime > ENTRY_TARDY && currentTime < EXIT_START) {
        return { status: 'tarde', template: 'entrada_tardanza' };
    }
    if (currentTime >= EXIT_START && currentTime <= EXIT_END) {
        return { status: 'salida', template: 'salida' };
    }
    return { status: 'fuera_de_horario', template: null };
};

const QRScannerPage: React.FC = () => {
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
    const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
    const [lastResult, setLastResult] = useState<{ student: Student; status: AttendanceRecord['status'] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const addMessage = useWhatsappLogStore(state => state.addMessage);
    const templates = useWhatsappSettingsStore(state => state.templates);
    const lastScanTime = useRef<number>(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReader = useRef(new BrowserMultiFormatReader());

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setVideoInputDevices(videoDevices);
                if (videoDevices.length > 0) {
                    setSelectedDeviceId(videoDevices[0].deviceId);
                    setIsCameraReady(true);
                } else {
                    setError("No se encontraron cámaras disponibles.");
                }
            })
            .catch(err => {
                setError("Error al enumerar dispositivos. Permita el acceso a la cámara.");
                console.error(err);
            });
        
        return () => {
            codeReader.current.reset();
        };
    }, []);
    
    const startScan = useCallback(() => {
        if (!selectedDeviceId || !videoRef.current) return;
        setIsScanning(true);
        setError(null);
        setLastResult(null);

        codeReader.current.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
            if (result) {
                const now = Date.now();
                if (now - lastScanTime.current < 3000) return; // Debounce duplicate scans
                lastScanTime.current = now;

                const studentId = result.getText();
                const student = MOCK_STUDENTS[studentId];
                const { status, template } = getAttendanceStatus();

                if (student && template) {
                    // FIX: Add check to narrow type of `status` for TypeScript.
                    if (status !== 'fuera_de_horario') {
                        setLastResult({ student, status });
                        setError(null);
                        
                        const parent = MOCK_PARENTS[student.tutorIds[0]];
                        if (parent && parent.phone) {
                            if (/^\+519\d{8}$/.test(parent.phone)) { // E.164 validation for Peru
                                addMessage({
                                    targetId: student.documentNumber,
                                    targetName: student.fullName,
                                    recipientName: parent.name,
                                    recipientPhone: parent.phone,
                                    template,
                                });
                                toast.success(`Notificación enviada para ${student.names}.`);
                            } else {
                                toast.error(`Número de apoderado inválido (${parent.phone}). No se envió notificación.`, { duration: 5000 });
                            }
                        } else {
                            toast.error(`Apoderado sin número de contacto. No se envió notificación.`, { duration: 5000 });
                        }
                    }

                } else if (!student) {
                    setLastResult(null);
                    setError(`Código QR no reconocido.`);
                } else if (!template) {
                     setLastResult(null);
                     setError('Escaneo fuera del horario de entrada o salida.');
                }
                 setTimeout(() => {
                    setLastResult(null);
                    setError(null);
                 }, 4000); // Clear result after 4 seconds
            }
            if (err && !(err instanceof NotFoundException)) {
                console.error(err);
                setError('Error al escanear. Intente de nuevo.');
                setIsScanning(false);
            }
        }).catch(err => {
            console.error(err);
            setError('No se pudo acceder a la cámara. Verifique los permisos y que no esté en uso.');
            setIsScanning(false);
        });
    }, [selectedDeviceId, addMessage, templates]);

    const stopScan = useCallback(() => {
        codeReader.current.reset();
        setIsScanning(false);
    }, []);

    const borderColorClass = lastResult ? getStatusInfo(lastResult.status).color.replace('text-', 'border-') : 'border-white/30';

    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white z-50">
            <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover transition-opacity ${isScanning ? 'opacity-100' : 'opacity-0'}`} />
            <div className="absolute inset-0 bg-black/60"></div>
            
            <AnimatePresence>
                {!isScanning && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative z-10 text-center p-8">
                        {isCameraReady ? (
                             <>
                                <Camera size={64} className="mx-auto mb-4 opacity-50"/>
                                <h2 className="text-3xl font-bold mb-2">Listo para Escanear Asistencia</h2>
                                <p className="text-slate-400 mb-6 max-w-lg">Presione "Iniciar Escaneo" para activar la cámara y registrar la entrada o salida. Se enviará una notificación por WhatsApp al apoderado.</p>
                                <button onClick={startScan} className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full text-lg font-semibold shadow-lg hover:bg-indigo-700 transition transform hover:scale-105">
                                    <Camera size={22} /> Iniciar Escaneo
                                </button>
                             </>
                        ) : (
                             <>
                                <CameraOff size={64} className="mx-auto mb-4 text-rose-400"/>
                                <h2 className="text-3xl font-bold mb-2 text-rose-300">Cámara no Disponible</h2>
                                <p className="text-slate-400">{error || "No se pudo acceder a la cámara. Verifique los permisos del navegador."}</p>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

             {isScanning && (
                <div className="relative z-10 w-full h-full flex flex-col">
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                        <select onChange={(e) => setSelectedDeviceId(e.target.value)} disabled={videoInputDevices.length <= 1}
                            className="bg-slate-800/80 text-white text-sm rounded-lg p-2 border border-slate-600 focus:ring-indigo-500 focus:border-indigo-500">
                            {videoInputDevices.map(device => <option key={device.deviceId} value={device.deviceId}>{device.label}</option>)}
                        </select>
                        <button onClick={stopScan} className="px-4 py-2 bg-rose-600/90 text-white rounded-full font-semibold hover:bg-rose-700 transition">Detener</button>
                    </div>

                    <div className="flex-grow flex items-center justify-center pointer-events-none">
                         <div className={`w-[80vw] max-w-md h-auto aspect-square rounded-3xl border-4 border-dashed transition-all ${borderColorClass}`}
                         ></div>
                    </div>

                    <div className="w-full p-4 bg-gradient-to-t from-black/50 to-transparent flex justify-center">
                        <AnimatePresence>
                        {(lastResult || error) && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                className={`relative w-full max-w-lg p-4 rounded-2xl border ${lastResult ? getStatusInfo(lastResult.status).bg + ' border-white/10' : 'bg-rose-500/10 border-white/10'}`}
                            >
                                {lastResult && <ScanResultDisplay result={lastResult} />}
                                {error && (
                                    <div className="flex items-center gap-3 text-center w-full justify-center">
                                        <XCircle size={24} className="text-rose-400" />
                                        <p className="font-semibold text-lg text-rose-300">{error}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRScannerPage;