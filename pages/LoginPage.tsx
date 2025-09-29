import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock validation
    if (username === 'admin' && password === 'admin') {
      login();
      navigate('/');
      toast.success('¡Bienvenido!');
    } else {
      toast.error('Credenciales incorrectas. Intente de nuevo.');
    }
  };
  
  const logoUrl = 'https://cdn-icons-png.flaticon.com/512/2602/2602414.png';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
            <img src={logoUrl} alt="Logo" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
                <LogIn className="text-indigo-600" />
                Iniciar Sesión
            </h1>
            <p className="text-slate-500 dark:text-slate-400">IEE 6049 Ricardo Palma</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700">
            <form onSubmit={handleLogin} className="space-y-6">
                 <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Usuario</label>
                    <input 
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Usuario: admin"
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition focus:outline-none"
                        required
                        autoComplete="username"
                    />
                </div>
                 <div>
                    <label htmlFor="password"className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Contraseña</label>
                    <input 
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña: admin"
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition focus:outline-none"
                        required
                        autoComplete="current-password"
                    />
                </div>
                
                <motion.button 
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-full text-base font-semibold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                >
                    <LogIn size={18} />
                    <span>Ingresar</span>
                </motion.button>
            </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;