import { ZONE_MULT, migrateZone } from './zones';

/**
 * Calcula los puntos de una misión completada.
 * Formula: base * (1 + streakBonus + pomoBonus)
 * Base: (minutes / 10) * multiplicador_de_zona
 */
export function calcPoints(minutes, zoneId, streak = 0, pomosCompleted = 0) {
  const id   = migrateZone(zoneId);
  const mult = ZONE_MULT[id] || 1;
  const base  = (minutes / 10) * mult;
  const streakBonus = Math.min(streak * 0.05, 1.0);
  const pomoBonus   = Math.min(pomosCompleted * 0.1, 0.5);
  return Math.round(base * (1 + streakBonus + pomoBonus));
}

export function pomoPartialPoints(zoneId) {
  const id   = migrateZone(zoneId);
  const mult = ZONE_MULT[id] || 1;
  return Math.round(2.5 * mult);
}

export function getMultiplier(zoneId) {
  return ZONE_MULT[migrateZone(zoneId)] || 1;
}

// Re-export para compatibilidad con imports anteriores
export { ZONES as RUBROS, ENERGIA } from './zones';
