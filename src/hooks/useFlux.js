import { create } from 'zustand';
import { SFX } from '../utils/sounds';

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const WEEKLY_TIPS = [
  'La motivación enciende el motor. El sistema lo mantiene corriendo.',
  'Una misión al día mantiene al Abismo en su sector.',
  'El Qrón se forma en el balance. ¿Cuándo fue la última vez que descansaste con intención?',
  'Las Igniciones son escasas porque la motivación lo es. El sistema no lo es.',
  'El Abismo no ataca. Espera. Únicamente en los espacios que dejas vacíos.',
  'Un bloque de 25 minutos es más real que un plan de 3 horas.',
  'No se trata de terminar todo. Se trata de no perder la señal.',
];

const FLUX_MESSAGES = {
  firstCheckOfDay: () => randomFrom([
    'Señal confirmada. Continúa.',
    'La Franja lo vio.',
    'Un bloque más. Así se construye.',
  ]),
  levelUp: () => randomFrom([
    'Frecuencia elevada. Nuevas zonas en rango.',
    'El Abismo retrocedió un sector.',
    'Arquitectura del Operativo: actualizada.',
  ]),
  inactivity3Days: () => randomFrom([
    '3 ciclos sin señal. El Abismo no duerme, Operativo.',
    'Te detecté. Bienvenido de vuelta. ¿Empezamos con algo pequeño?',
    'La señal cayó. Ya regresó. Eso es lo que importa.',
  ]),
  zoneDiscovered: (zone) => `FRECUENCIA ${zone?.label || zone?.short || ''} DETECTADA. ACCESO PARCIAL.`,
  zoneColonized: (zone) => `SECTOR ${zone?.label || zone?.short || ''} COLONIZADO. TRANSMITIENDO CONOCIMIENTO.`,
  breakStart: () => 'Ventana de Recuperación activa. Esquiva o descansa.',
  weeklyTip: () => randomFrom(WEEKLY_TIPS),
  returnFromAbyss: () => 'Señal recuperada. El Abismo retrocede. Bien.',
  perfectDay: () => 'Día Perfecto. Todas las frecuencias activas. Raro. Valioso.',
  motivacion: () => randomFrom([
    'No necesitas motivación. Necesitas el siguiente paso.',
    'La constancia supera al talento. Siempre.',
    'Un operativo activo vale más que un plan perfecto en pausa.',
  ]),
  estrategia: () => randomFrom([
    'Empieza por la misión con mayor multiplicador. Eso es MISIÓN o CREACIÓN.',
    'Combina MISIÓN + DESCANSO hoy. Ganarás un Qrón.',
    'La Racha de Señal se construye día a día. No se recupera de golpe.',
  ]),
  estadoSistema: (state) => {
    const streak = state?.dayStreak || 0;
    const fluxo = state?.fluxo || 0;
    const igniciones = state?.igniciones || 0;
    return `RACHA: ${streak}d // FLX: ${fluxo} // IGNICIONES: ${igniciones}`;
  },
};

/* ── Estado global de Flux ── */
export const useFluxStore = create((set) => ({
  visible: false,
  message: '',
  animation: 'neutral',
  dismissTimer: null,

  show(message, animation = 'neutral', duration = 2500) {
    set(s => {
      if (s.dismissTimer) clearTimeout(s.dismissTimer);
      return { visible: true, message, animation, dismissTimer: null };
    });
    if (duration > 0) {
      const t = setTimeout(() => set({ visible: false, message: '', animation: 'neutral', dismissTimer: null }), duration);
      set({ dismissTimer: t });
    }
    SFX.fluxAppear?.();
  },

  hide() {
    set(s => {
      if (s.dismissTimer) clearTimeout(s.dismissTimer);
      return { visible: false, message: '', animation: 'neutral', dismissTimer: null };
    });
  },
}));

/* ── Hook público ── */
export function useFlux() {
  const { show, hide, visible, message, animation } = useFluxStore();

  const trigger = (type, payload) => {
    const msg = typeof FLUX_MESSAGES[type] === 'function'
      ? FLUX_MESSAGES[type](payload)
      : '';
    if (!msg) return;

    const configs = {
      firstCheckOfDay:  { animation: 'thumbsup',   duration: 1500 },
      levelUp:          { animation: 'celebrate',   duration: 3000 },
      inactivity3Days:  { animation: 'alert',       duration: 0 },
      zoneDiscovered:   { animation: 'thinking',    duration: 2500 },
      zoneColonized:    { animation: 'celebrate',   duration: 4000 },
      breakStart:       { animation: 'neutral',     duration: 2000 },
      weeklyTip:        { animation: 'thinking',    duration: 4000 },
      returnFromAbyss:  { animation: 'celebrate',   duration: 3000 },
      perfectDay:       { animation: 'celebrate',   duration: 3500 },
      motivacion:       { animation: 'thumbsup',    duration: 3000 },
      estrategia:       { animation: 'thinking',    duration: 3500 },
      estadoSistema:    { animation: 'neutral',     duration: 3000 },
    };

    const cfg = configs[type] || { animation: 'neutral', duration: 2500 };
    if (type === 'inactivity3Days') SFX.fluxAlert?.();
    show(msg, cfg.animation, cfg.duration);
  };

  return { trigger, hide, visible, message, animation };
}

export { WEEKLY_TIPS };
