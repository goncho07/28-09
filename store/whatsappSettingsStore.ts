import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Provider = 'meta' | 'twilio' | '360dialog';

const defaultTemplates = {
    presente: "Hola {apoderado}, {alumno} registró ENTRADA a las {hora}. Estado: Presente. Aula: {gradoSeccion}. — {colegio}",
    tardanza: "Hola {apoderado}, {alumno} ingresó a las {hora}. Estado: Tardanza (límite 08:30). Aula: {gradoSeccion}. — {colegio}",
    falta: "Hola {apoderado}, hasta las 08:31 no se registró la ENTRADA de {alumno}. Estado: Falta injustificada. Si hay sustento, comuníquese con tutoría. — {colegio}",
    salida: "Hola {apoderado}, {alumno} registró SALIDA a las {hora}. — {colegio}"
};

interface WhatsappSettingsState {
  sendingNumber: string;
  provider: Provider;
  templates: {
      presente: string;
      tardanza: string;
      falta: string;
      salida: string;
  };
  setSendingNumber: (number: string) => void;
  setProvider: (provider: Provider) => void;
  setTemplate: (type: keyof WhatsappSettingsState['templates'], content: string) => void;
}

export const useWhatsappSettingsStore = create<WhatsappSettingsState>()(
  persist(
    (set) => ({
      sendingNumber: '+51987654321',
      provider: 'meta',
      templates: defaultTemplates,
      setSendingNumber: (number) => set({ sendingNumber: number }),
      setProvider: (provider) => set({ provider }),
      setTemplate: (type, content) => set((state) => ({
        templates: { ...state.templates, [type]: content }
      })),
    }),
    {
      name: 'sge-whatsapp-settings',
    }
  )
);