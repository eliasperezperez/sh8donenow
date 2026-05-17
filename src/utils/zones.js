/**
 * zones.js — Las 7 zonas psicológicas de SH8DONE
 * Basado en investigación de bienestar (Vanderweele/SAMHSA).
 * Reemplaza el sistema de "rubros" anterior.
 *
 * Migración silenciosa de datos:
 *   creativo    → creacion
 *   conocimiento → mente
 *   fisico      → cuerpo
 *   rutina      → hogar
 *   social      → vinculos
 *   (mision y descanso son zonas nuevas sin equivalente)
 */

export const ZONE_MIGRATION = {
  creativo:     'creacion',
  conocimiento: 'mente',
  fisico:       'cuerpo',
  rutina:       'hogar',
  social:       'vinculos',
};

export const ZONES = [
  {
    id:       'mision',
    name:     'TRABAJO/MISIÓN',
    short:    'MISIÓN',
    mult:     3,
    color:    '#ff006e',
    emoji:    '🎯',
    desc:     'Trabajo profundo, proyectos, metas',
    reflection: 'El trabajo profundo es raro. Cada bloque que proteges es una declaración de que tu obra importa.',
  },
  {
    id:       'cuerpo',
    name:     'CUERPO/MOVIMIENTO',
    short:    'CUERPO',
    mult:     2,
    color:    '#00f5ff',
    emoji:    '💪',
    desc:     'Ejercicio, salud, movimiento',
    reflection: 'El cuerpo en movimiento mantiene la mente en movimiento. Tus mejores ideas llegarán mientras caminas.',
  },
  {
    id:       'mente',
    name:     'MENTE/SABER',
    short:    'MENTE',
    mult:     2.5,
    color:    '#ffbe0b',
    emoji:    '🧠',
    desc:     'Lectura, aprendizaje, estudio',
    reflection: 'Leer una hora al día en tu campo te pondrá en el top 10% de tu industria en 5 años.',
  },
  {
    id:       'vinculos',
    name:     'VÍNCULOS/RELACIONES',
    short:    'VÍNCULOS',
    mult:     2,
    color:    '#c77dff',
    emoji:    '🤝',
    desc:     'Relaciones, comunidad, conexión',
    reflection: 'Al final, nadie recuerda cuántas horas trabajaste. Recuerdan cómo los hiciste sentir.',
  },
  {
    id:       'descanso',
    name:     'DESCANSO/RECARGA',
    short:    'DESCANSO',
    mult:     1.5,
    color:    '#39d353',
    emoji:    '🌙',
    desc:     'Sueño, recuperación, ocio',
    reflection: 'El descanso no es el premio al trabajo terminado. Es el combustible que hace posible el trabajo.',
  },
  {
    id:       'creacion',
    name:     'CREACIÓN/EXPRESIÓN',
    short:    'CREACIÓN',
    mult:     3,
    color:    '#ff8c42',
    emoji:    '🎨',
    desc:     'Arte, música, escritura, creación',
    reflection: 'La creatividad no es talento. Es un hábito de mostrarse aunque no tengas ganas. Tú ya lo estás haciendo.',
  },
  {
    id:       'hogar',
    name:     'HOGAR/ENTORNO',
    short:    'HOGAR',
    mult:     1.5,
    color:    '#8b5cf6',
    emoji:    '🏠',
    desc:     'Orden, limpieza, entorno personal',
    reflection: 'Un espacio ordenado es un pensamiento ordenado. Cuidar tu entorno es cuidarte a ti.',
  },
];

export const ZONE_MAP = Object.fromEntries(ZONES.map(z => [z.id, z]));

/** Multiplicador de puntos por zona (con fallback) */
export const ZONE_MULT = Object.fromEntries(ZONES.map(z => [z.id, z.mult]));

/** Migrar un rubroId viejo al nuevo zoneId */
export function migrateZone(id) {
  return ZONE_MIGRATION[id] || id;
}

/** Getters de estado de zona por puntos acumulados */
export function getZoneState(pts) {
  if (pts >= 50) return 'colonized';  // Colonizado
  if (pts >= 10) return 'discovered'; // Descubierto
  return 'unexplored';                // Inexplorado
}

export function getZoneLabel(state) {
  return { colonized: 'COLONIZADO', discovered: 'DESCUBIERTO', unexplored: 'INEXPLORADO' }[state];
}

export const ENERGIA = [
  { id: 'alta',  label: '🔴 ALTA',  value: 'alta'  },
  { id: 'media', label: '🟡 MEDIA', value: 'media' },
  { id: 'baja',  label: '🟢 BAJA',  value: 'baja'  },
];
