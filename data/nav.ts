
import {
  UsersRound,
  ClipboardCheck,
  Home,
  Edit,
  BookCheck,
  MessageSquare,
  Cog,
  QrCode,
  Network
} from 'lucide-react';
import { NavItem } from '../types';

export const directorNavItems: NavItem[] = [
  { to: '/asistencia', text: 'Asistencia', icon: ClipboardCheck },
  { to: '/asistencia/scan', text: 'Escanear QR', icon: QrCode },
  { to: '/usuarios', text: 'Usuarios', icon: UsersRound },
  { to: '/comunicaciones', text: 'Comunicaciones', icon: MessageSquare },
  { to: '/integrations', text: 'Integraciones', icon: Network },
  { to: '/settings', text: 'Ajustes', icon: Cog },
];
