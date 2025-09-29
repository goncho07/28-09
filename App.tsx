
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import UsersPage from './pages/UsersPage';
import AsistenciaPage from './pages/AsistenciaPage';
import QRScannerPage from './pages/QRScannerPage';
import LoginPage from './pages/LoginPage';
import ComunicacionesPage from './pages/ComunicacionesPage';
import SettingsPage from './pages/SettingsPage';
import WhatsappSettingsPage from './pages/WhatsappSettingsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import ToastProvider from './ui/ToastProvider';


const App: React.FC = () => {
    const { isAuthenticated } = useAuthStore();
    const { setTheme } = useUIStore();
    const location = useLocation();

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    }, [setTheme]);

    let appContent;
    if (!isAuthenticated) {
        appContent = (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        );
    } else {
        appContent = (
            <Layout>
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/asistencia" element={<AsistenciaPage />} />
                        <Route path="/asistencia/scan" element={<QRScannerPage />} />
                        <Route path="/usuarios" element={<UsersPage />} />
                        <Route path="/comunicaciones" element={<ComunicacionesPage />} />
                        <Route path="/integrations" element={<IntegrationsPage />} />
                        <Route path="/integrations/whatsapp" element={<WhatsappSettingsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="*" element={<Navigate to="/asistencia" />} />
                    </Routes>
                </AnimatePresence>
            </Layout>
        );
    }

    return (
        <>
            {appContent}
            <ToastProvider />
        </>
    );
};

export default App;