export const LEVELS = [
  { level: 1,  name: 'NOVATO SIN SEÑAL',         minScore: 0,     maxScore: 99,    color: '#44445a' },
  { level: 2,  name: 'RECEPTOR ACTIVO',           minScore: 100,   maxScore: 299,   color: '#00f5ff' },
  { level: 3,  name: 'EXPLORADOR DE FRECUENCIA',  minScore: 300,   maxScore: 599,   color: '#8b5cf6' },
  { level: 4,  name: 'OPERATIVO DE CAMPO',        minScore: 600,   maxScore: 999,   color: '#ffbe0b' },
  { level: 5,  name: 'AGENTE DE LA FRANJA',       minScore: 1000,  maxScore: 1999,  color: '#ff006e' },
  { level: 6,  name: 'ARQUITECTO DEL FLUJO',      minScore: 2000,  maxScore: Infinity, color: '#ffffff' },
];

export function getLevelInfo(score) {
  const lvl = LEVELS.find(l => score >= l.minScore && score <= l.maxScore) || LEVELS[0];
  const next = LEVELS.find(l => l.level === lvl.level + 1);
  const progress = next
    ? ((score - lvl.minScore) / (next.minScore - lvl.minScore)) * 100
    : 100;
  return { ...lvl, next, progress: Math.min(progress, 100) };
}

export function didLevelUp(oldScore, newScore) {
  const oldLvl = getLevelInfo(oldScore).level;
  const newLvl = getLevelInfo(newScore).level;
  return newLvl > oldLvl ? getLevelInfo(newScore) : null;
}
