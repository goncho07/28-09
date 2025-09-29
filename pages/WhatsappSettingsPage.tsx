
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Save, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWhatsappSettingsStore } from '../store/whatsappSettingsStore';
import { track } from '../analytics/track';

// New Architecture Components
import ModulePage from '../layouts/ModulePage';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const WhatsappSettingsPage: React.FC = () => {
    const { settings, setSendingNumber, setProvider, setTemplate } = useWhatsappSettingsStore(state => ({
        settings: state,
        setSendingNumber: state.setSendingNumber,
        setProvider: state.setProvider,
        setTemplate: state.setTemplate
    }));
    
    const handleSave = () => {
        track('whatsapp_settings_saved');
        toast.success("Configuración de WhatsApp guardada.");
    };

    const handleSendTest = () => {
        track('whatsapp_test_sent');
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: 'Enviando mensaje de prueba...',
                success: '¡Mensaje de prueba enviado con éxito!',
                error: 'Error al enviar el mensaje.',
            }
        );
    };

    return (
        <ModulePage
            title="Ajustes de Integración: WhatsApp"
            description="Configure el número emisor, proveedor y plantillas para las notificaciones de asistencia."
            icon={MessageSquare}
            actionsRight={<Button variant="primary" aria-label="Guardar Configuración" icon={Save} onClick={handleSave}>Guardar Configuración</Button>}
            filters={<></>}
            content={
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Configuración del Proveedor</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                                label="Número Emisor (Bot del Colegio)"
                                aria-label="Número Emisor en formato E.164"
                                value={settings.sendingNumber}
                                onChange={(e) => setSendingNumber(e.target.value)}
                                placeholder="+519..."
                            />
                            <Select 
                                label="Proveedor de WhatsApp"
                                value={settings.provider}
                                onChange={(e) => setProvider(e.target.value as any)}
                            >
                                <option value="meta">Meta Cloud API</option>
                                <option value="twilio">Twilio</option>
                                <option value="360dialog">360dialog</option>
                            </Select>
                        </div>
                         <div className="mt-6 flex justify-end">
                            <Button variant="secondary" aria-label="Enviar Mensaje de Prueba" icon={Send} onClick={handleSendTest}>Enviar Mensaje de Prueba</Button>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Editor de Plantillas</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Placeholders disponibles: {`{alumno}, {gradoSeccion}, {hora}, {estado}, {fecha}, {apoderado}, {colegio}`}</p>
                        <div className="space-y-4">
                            <div>
                                <label className="font-semibold text-slate-600 dark:text-slate-300">Entrada (Presente)</label>
                                <textarea value={settings.templates.presente} onChange={e => setTemplate('presente', e.target.value)} rows={3} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                            </div>
                             <div>
                                <label className="font-semibold text-slate-600 dark:text-slate-300">Entrada (Tardanza)</label>
                                <textarea value={settings.templates.tardanza} onChange={e => setTemplate('tardanza', e.target.value)} rows={3} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                            </div>
                             <div>
                                <label className="font-semibold text-slate-600 dark:text-slate-300">Entrada (Falta Injustificada)</label>
                                <textarea value={settings.templates.falta} onChange={e => setTemplate('falta', e.target.value)} rows={3} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                            </div>
                             <div>
                                <label className="font-semibold text-slate-600 dark:text-slate-300">Salida</label>
                                <textarea value={settings.templates.salida} onChange={e => setTemplate('salida', e.target.value)} rows={3} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                            </div>
                        </div>
                    </Card>
                </div>
            }
        />
    );
};

export default WhatsappSettingsPage;