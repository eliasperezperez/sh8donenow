export const LEVELS = [
  { level: 1,  name: 'RECLUTA',       minScore: 0,     maxScore: 199   },
  { level: 2,  name: 'CADETE',        minScore: 200,   maxScore: 499   },
  { level: 3,  name: 'PILOTO',        minScore: 500,   maxScore: 999   },
  { level: 4,  name: 'AS ESPACIAL',   minScore: 1000,  maxScore: 1999  },
  { level: 5,  name: 'COMANDANTE',    minScore: 2000,  maxScore: 3999  },
  { level: 6,  name: 'CAPITAN',       minScore: 4000,  maxScore: 7499  },
  { level: 7,  name: 'ALMIRANTE',     minScore: 7500,  maxScore: 12999 },
  { level: 8,  name: 'GENERAL',       minScore: 13000, maxScore: 19999 },
  { level: 9,  name: 'GUARDIAN',      minScore: 20000, maxScore: 29999 },
  { level: 10, name: 'LEYENDA GALÁCTICA', minScore: 30000, maxScore: Infinity },
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
