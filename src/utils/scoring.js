const MULT = {
  creativo:     3,
  conocimiento: 2.5,
  fisico:       2,
  rutina:       1.5,
  social:       2,
};

export function calcPoints(minutes, rubroId, streak = 0, pomosCompleted = 0) {
  const base = (minutes / 10) * (MULT[rubroId] || 1);
  const streakBonus = Math.min(streak * 0.05, 1.0);
  const pomoBonus   = Math.min(pomosCompleted * 0.1, 0.5);
  return Math.round(base * (1 + streakBonus + pomoBonus));
}

export function pomoPartialPoints(rubroId) {
  return Math.round(2.5 * (MULT[rubroId] || 1));
}

export function getMultiplier(rubroId) {
  return MULT[rubroId] || 1;
}

export const RUBROS = [
  { id: 'creativo',     label: 'CREATIVO',     color: 'var(--rubro-creativo)',     emoji: '🎨' },
  { id: 'conocimiento', label: 'CONOCIMIENTO',  color: 'var(--rubro-conocimiento)', emoji: '🧠' },
  { id: 'fisico',       label: 'FÍSICO',        color: 'var(--rubro-fisico)',        emoji: '💪' },
  { id: 'rutina',       label: 'RUTINA',        color: 'var(--rubro-rutina)',        emoji: '⚡' },
  { id: 'social',       label: 'SOCIAL',        color: 'var(--rubro-social)',        emoji: '🤝' },
];

export const ENERGIA = [
  { id: 'alta',  label: '🔴 ALTA',  value: 'alta'  },
  { id: 'media', label: '🟡 MEDIA', value: 'media' },
  { id: 'baja',  label: '🟢 BAJA',  value: 'baja'  },
];
