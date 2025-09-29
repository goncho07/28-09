
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { directorNavItems } from '../../data/nav';

const breadcrumbNameMap: { [key: string]: string } = {
  '/asistencia/scan': 'Escanear QR',
  '/integrations': 'Integraciones',
  '/integrations/whatsapp': 'Ajustes de WhatsApp',
};

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    
    const navItems = directorNavItems;

    const getBreadcrumbName = (to: string, value: string) => {
        if (breadcrumbNameMap[to]) {
            return breadcrumbNameMap[to];
        }
        const navItem = navItems.find(item => item.to === to);
        return navItem ? navItem.text : value.replace(/-/g, ' ');
    };

    if (pathnames.length === 0 || location.pathname === '/') {
        return null;
    }

    return (
        <nav aria-label="breadcrumb" className="flex items-center text-lg font-semibold text-slate-500 dark:text-slate-400 mb-4">
            <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
                <Home size={20} />
                Inicio
            </Link>
            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const name = getBreadcrumbName(to, value);

                return (
                    <span key={to} className="flex items-center capitalize">
                        <ChevronRight size={22} className="text-slate-400 dark:text-slate-500 mx-1" />
                        {last ? (
                            <span className="text-slate-700 dark:text-slate-200">{name}</span>
                        ) : (
                            <Link to={to} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{name}</Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;