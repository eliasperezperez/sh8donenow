export const TRANSMISOR_TYPES = {
  logro:     { color: '#ffbe0b', label: 'LOGRO' },
  frecuencia: { color: '#00f5ff', label: 'FRECUENCIA' },
  temporada:  { color: '#ff006e', label: 'TEMPORADA' },
};

export const TRANSMISORES = [
  { id: 'primera_senal',  type: 'logro',     name: 'PRIMERA SEÑAL',
    desc: 'Primera misión completada', secret: false,
    condition: s => (s.totalCompleted || 0) >= 1 },
  { id: 'ignicion_total', type: 'logro',     name: 'IGNICIÓN TOTAL',
    desc: 'Usar una Ignición por primera vez', secret: false,
    condition: s => (s.ignicionesUsadas || 0) >= 1 },
  { id: 'equilibrista',   type: 'logro',     name: 'EQUILIBRISTA',
    desc: 'Obtener tu primer Qrón', secret: false,
    condition: s => (s.qronObtenidos || 0) >= 1 },
  { id: 'septimo_sector', type: 'logro',     name: 'SÉPTIMO SECTOR',
    desc: 'Descubrir todas las frecuencias', secret: false,
    condition: s => (s.zonesDiscovered || 0) >= 7 },
  { id: 'sin_abismo',     type: 'logro',     name: 'SIN ABISMO',
    desc: '30 días consecutivos', secret: false,
    condition: s => (s.dayStreak || 0) >= 30 },
  { id: 'arquitecto',     type: 'logro',     name: 'ARQUITECTO',
    desc: 'Crear 10 misiones', secret: false,
    condition: s => (s.missions?.length || 0) >= 10 },
  { id: 'colono_total',   type: 'logro',     name: 'COLONO TOTAL',
    desc: 'Colonizar las 7 frecuencias', secret: false,
    condition: s => (s.zonesColonized || 0) >= 7 },
  { id: 'flux_confidencial', type: 'logro',  name: 'FLUX CONFIDENCIAL',
    desc: '???', secret: true,
    condition: s => s.fluxInvokedAt3am === true },
  // Frecuencias (por zona colonizada)
  { id: 'freq_mision',    type: 'frecuencia', name: 'SEÑAL ROJA',
    desc: 'Colonizar MISIÓN', secret: false,
    condition: s => s.zoneStatus?.mision === 'colonized' },
  { id: 'freq_cuerpo',    type: 'frecuencia', name: 'SEÑAL CYAN',
    desc: 'Colonizar CUERPO', secret: false,
    condition: s => s.zoneStatus?.cuerpo === 'colonized' },
  { id: 'freq_mente',     type: 'frecuencia', name: 'SEÑAL DORADA',
    desc: 'Colonizar MENTE', secret: false,
    condition: s => s.zoneStatus?.mente === 'colonized' },
  { id: 'freq_vinculos',  type: 'frecuencia', name: 'SEÑAL LAVANDA',
    desc: 'Colonizar VÍNCULOS', secret: false,
    condition: s => s.zoneStatus?.vinculos === 'colonized' },
  { id: 'freq_descanso',  type: 'frecuencia', name: 'SEÑAL VERDE',
    desc: 'Colonizar DESCANSO', secret: false,
    condition: s => s.zoneStatus?.descanso === 'colonized' },
  { id: 'freq_creacion',  type: 'frecuencia', name: 'SEÑAL NARANJA',
    desc: 'Colonizar CREACIÓN', secret: false,
    condition: s => s.zoneStatus?.creacion === 'colonized' },
  { id: 'freq_hogar',     type: 'frecuencia', name: 'SEÑAL PÚRPURA',
    desc: 'Colonizar HOGAR', secret: false,
    condition: s => s.zoneStatus?.hogar === 'colonized' },
  // Temporada
  { id: 'temporada1_2026', type: 'temporada', name: 'TEMPORADA I — 2026',
    desc: 'Presente en el origen de La Franja', secret: false,
    condition: () => {
      const now = new Date();
      return now.getFullYear() === 2026;
    }},
];

export function checkNewTransmisores(stats, unlocked = []) {
  return TRANSMISORES.filter(t => !unlocked.includes(t.id) && t.condition(stats));
}

/* SVGs pixel art para cada transmisor */
export function getTransmisorIcon(id, color = '#ffbe0b') {
  const c = color;
  const icons = {
    primera_senal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20" fill="none">
      <rect x="7" y="0" width="2" height="8" fill="${c}"/>
      <rect x="4" y="4" width="2" height="2" fill="${c}"/>
      <rect x="10" y="4" width="2" height="2" fill="${c}"/>
      <rect x="2" y="6" width="2" height="2" fill="${c}"/>
      <rect x="12" y="6" width="2" height="2" fill="${c}"/>
      <rect x="6" y="8" width="4" height="6" fill="${c}"/>
      <rect x="4" y="10" width="2" height="2" fill="${c}"/>
      <rect x="10" y="10" width="2" height="2" fill="${c}"/>
      <rect x="7" y="14" width="2" height="4" fill="${c}"/>
    </svg>`,
    ignicion_total: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 16" fill="none">
      <rect x="5" y="0" width="2" height="4" fill="${c}"/>
      <rect x="3" y="2" width="2" height="6" fill="${c}"/>
      <rect x="7" y="2" width="2" height="4" fill="${c}"/>
      <rect x="1" y="6" width="2" height="6" fill="${c}"/>
      <rect x="5" y="6" width="2" height="8" fill="${c}"/>
      <rect x="9" y="6" width="2" height="4" fill="${c}"/>
      <rect x="3" y="10" width="6" height="4" fill="${c}"/>
      <rect x="5" y="14" width="2" height="2" fill="${c}"/>
    </svg>`,
    equilibrista: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none">
      <rect x="6" y="0" width="2" height="4" fill="${c}"/>
      <rect x="4" y="2" width="6" height="2" fill="${c}"/>
      <rect x="2" y="4" width="10" height="2" fill="${c}"/>
      <rect x="0" y="6" width="14" height="2" fill="${c}"/>
      <rect x="2" y="8" width="10" height="2" fill="${c}"/>
      <rect x="4" y="10" width="6" height="2" fill="${c}"/>
      <rect x="6" y="12" width="2" height="2" fill="${c}"/>
    </svg>`,
    septimo_sector: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
      <rect x="7" y="0" width="2" height="2" fill="${c}"/>
      <rect x="12" y="2" width="2" height="2" fill="${c}"/>
      <rect x="2" y="2" width="2" height="2" fill="${c}"/>
      <rect x="14" y="7" width="2" height="2" fill="${c}"/>
      <rect x="0" y="7" width="2" height="2" fill="${c}"/>
      <rect x="11" y="12" width="2" height="2" fill="${c}"/>
      <rect x="3" y="12" width="2" height="2" fill="${c}"/>
      <rect x="7" y="7" width="2" height="2" fill="${c}"/>
      <rect x="8" y="1" width="4" height="1" fill="${c}" opacity="0.5"/>
      <rect x="8" y="8" width="3" height="1" fill="${c}" opacity="0.5"/>
    </svg>`,
    sin_abismo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
      <rect x="4" y="0" width="8" height="2" fill="${c}"/>
      <rect x="2" y="2" width="2" height="10" fill="${c}"/>
      <rect x="12" y="2" width="2" height="10" fill="${c}"/>
      <rect x="4" y="12" width="8" height="2" fill="${c}"/>
      <rect x="6" y="14" width="4" height="2" fill="${c}"/>
      <rect x="6" y="6" width="4" height="4" fill="${c}"/>
      <rect x="7" y="4" width="2" height="2" fill="${c}"/>
    </svg>`,
    arquitecto: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
      <rect x="0" y="14" width="16" height="2" fill="${c}"/>
      <rect x="0" y="12" width="2" height="2" fill="${c}"/>
      <rect x="0" y="0" width="2" height="12" fill="${c}"/>
      <rect x="2" y="0" width="12" height="2" fill="${c}"/>
      <rect x="6" y="2" width="2" height="6" fill="${c}"/>
      <rect x="8" y="4" width="6" height="2" fill="${c}"/>
      <rect x="8" y="6" width="2" height="6" fill="${c}"/>
    </svg>`,
    colono_total: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
      <rect x="7" y="6" width="2" height="4" fill="${c}"/>
      <rect x="6" y="7" width="4" height="2" fill="${c}"/>
      <rect x="7" y="0" width="2" height="2" fill="${c}"/>
      <rect x="13" y="3" width="2" height="2" fill="${c}"/>
      <rect x="14" y="8" width="2" height="2" fill="${c}"/>
      <rect x="12" y="13" width="2" height="2" fill="${c}"/>
      <rect x="7" y="14" width="2" height="2" fill="${c}"/>
      <rect x="2" y="13" width="2" height="2" fill="${c}"/>
      <rect x="0" y="8" width="2" height="2" fill="${c}"/>
      <rect x="1" y="3" width="2" height="2" fill="${c}"/>
    </svg>`,
    flux_confidencial: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 18" fill="none">
      <rect x="4" y="0" width="6" height="2" fill="${c}"/>
      <rect x="2" y="2" width="2" height="2" fill="${c}"/>
      <rect x="10" y="2" width="2" height="2" fill="${c}"/>
      <rect x="8" y="4" width="2" height="4" fill="${c}"/>
      <rect x="6" y="8" width="2" height="2" fill="${c}"/>
      <rect x="6" y="12" width="2" height="2" fill="${c}"/>
      <rect x="11" y="1" width="1" height="6" fill="${c}" opacity="0.7"/>
      <rect x="12" y="0" width="2" height="2" fill="${c}" opacity="0.7"/>
    </svg>`,
    // Frecuencias y temporada usan íconos genéricos con colores
    temporada1_2026: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 18" fill="none">
      <rect x="6" y="0" width="2" height="2" fill="${c}"/>
      <rect x="4" y="2" width="6" height="2" fill="${c}"/>
      <rect x="4" y="4" width="2" height="4" fill="${c}"/>
      <rect x="8" y="4" width="2" height="2" fill="${c}"/>
      <rect x="6" y="6" width="2" height="2" fill="${c}"/>
      <rect x="2" y="8" width="10" height="2" fill="${c}"/>
      <rect x="4" y="10" width="6" height="2" fill="${c}"/>
      <rect x="5" y="14" width="2" height="4" fill="${c}"/>
      <rect x="3" y="16" width="8" height="2" fill="${c}"/>
      <rect x="4" y="12" width="2" height="2" fill="${c}"/>
      <rect x="8" y="12" width="2" height="2" fill="${c}"/>
    </svg>`,
  };
  return icons[id] || icons['primera_senal'];
}

/* Compatibilidad con el sistema de badges viejo */
export const BADGE_DEFS = TRANSMISORES.map(t => ({
  id:   t.id,
  name: t.name,
  desc: t.desc,
  icon: '★',
  check: t.condition,
}));

export function checkNewBadges(stats, earned) {
  return checkNewTransmisores(stats, earned);
}
