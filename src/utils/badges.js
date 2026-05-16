export const BADGE_DEFS = [
  { id: 'first_mission',    name: 'PRIMER DESPEGUE',    desc: 'Completa tu primera misión',           icon: '🚀', check: (s) => s.totalCompleted >= 1  },
  { id: 'streak_3',         name: 'RACHA x3',           desc: '3 días seguidos',                     icon: '🔥', check: (s) => s.maxStreak >= 3       },
  { id: 'streak_7',         name: 'SEMANA ÉPICA',       desc: '7 días seguidos',                     icon: '⚡', check: (s) => s.maxStreak >= 7       },
  { id: 'streak_14',        name: 'FORTALEZA',          desc: '14 días seguidos',                    icon: '🛡', check: (s) => s.maxStreak >= 14      },
  { id: 'streak_30',        name: 'LEYENDA',            desc: '30 días seguidos',                    icon: '👑', check: (s) => s.maxStreak >= 30      },
  { id: 'perfect_day',      name: 'DÍA PERFECTO',       desc: 'Completa todas las misiones del día', icon: '⭐', check: (s) => s.perfectDays >= 1     },
  { id: 'perfect_5',        name: 'MAESTRO',            desc: '5 días perfectos',                    icon: '💫', check: (s) => s.perfectDays >= 5     },
  { id: 'score_1000',       name: 'MILLENIUM',          desc: 'Alcanza 1000 puntos',                 icon: '🌟', check: (s) => s.totalScore >= 1000   },
  { id: 'score_5000',       name: 'SUPERNOVA',          desc: 'Alcanza 5000 puntos',                 icon: '💥', check: (s) => s.totalScore >= 5000   },
  { id: 'pomodoro_master',  name: 'CRONONAUTA',         desc: 'Completa 10 pomodoros',               icon: '⏱', check: (s) => s.totalPomos >= 10     },
  { id: 'all_rubros',       name: 'POLÍMATA',           desc: 'Completa misiones de todos los rubros',icon: '🧬', check: (s) => s.rubrosUsed?.length >= 5 },
];

export function checkNewBadges(stats, earned) {
  return BADGE_DEFS.filter(b => !earned.includes(b.id) && b.check(stats));
}
