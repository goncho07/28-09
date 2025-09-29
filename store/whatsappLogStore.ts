import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WhatsappMessage } from '../types';
import toast from 'react-hot-toast';
import { getPeruTime } from '../utils/time';

interface WhatsappLogState {
  messages: WhatsappMessage[];
  addMessage: (message: Omit<WhatsappMessage, 'id' | 'timestamp' | 'status'>) => void;
  updateMessageStatus: (id: string, status: WhatsappMessage['status'], statusMessage?: string) => void;
  retryMessage: (id: string) => void;
}

const useWhatsappLogStore = create<WhatsappLogState>()(
  persist(
    (set, get) => ({
      messages: [],
      addMessage: (message) => {
        const newMessage: WhatsappMessage = {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: getPeruTime().toISOString(),
          status: 'en cola',
        };
        set((state) => ({ messages: [newMessage, ...state.messages] }));
        
        // Simulate API call
        setTimeout(() => {
            // Simulate a 5% failure rate
            const isSuccess = Math.random() > 0.05;
            if (isSuccess) {
                get().updateMessageStatus(newMessage.id, 'enviado');
            } else {
                get().updateMessageStatus(newMessage.id, 'fallido', 'Error de proveedor: Conexión rechazada.');
            }
        }, 1500 + Math.random() * 1000);
      },
      updateMessageStatus: (id, status, statusMessage) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, status, statusMessage: statusMessage || msg.statusMessage } : msg
          ),
        }));
      },
      retryMessage: (id) => {
        const message = get().messages.find(m => m.id === id);
        if (message && message.status === 'fallido') {
          toast.success(`Reintentando envío para ${message.targetName}...`);
          get().updateMessageStatus(id, 'en cola');
           setTimeout(() => {
            const isSuccess = Math.random() > 0.2; // Higher success rate on retry
            if (isSuccess) {
                get().updateMessageStatus(id, 'enviado');
            } else {
                get().updateMessageStatus(id, 'fallido', 'Error de proveedor: Timeout en reintento.');
            }
        }, 2000);
        }
      },
    }),
    {
      name: 'sge-whatsapp-log',
    }
  )
);

export default useWhatsappLogStore;