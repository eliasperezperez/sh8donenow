import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { todayKey, daysBetween, shouldRecurToday } from '../utils/dates';
import { calcPoints }                              from '../utils/scoring';
import { getLevelInfo, didLevelUp }                from '../utils/levels';
import { checkNewTransmisores }                    from '../utils/transmisores';
import { migrateZone, getZoneState, ZONES }        from '../utils/zones';
import { setMasterVolume, setSoundEnabled, SFX }   from '../utils/sounds';

/* ─── NANOID INLINE ─── */
function nanoid(size = 21) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let id = '';
  for (const b of bytes) id += chars[b & 63];
  return id;
}

function getWeekKey() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

/* ─── DEFAULT STATE ─── */
const defaultState = {
  /* Player */
  playerName:   'PILOTO',
  totalScore:   0,
  fluxo:        0,
  dayStreak:    0,
  maxStreak:    0,
  shields:      0,        // amortiguadores (era shields)
  lastDay:      null,

  /* Recursos económicos */
  igniciones:           0,
  qron:                 0,
  amplificadores:       0,
  capsulasMemoria:      0,
  sintonizadores:       0,
  amortiguadores:       0,

  /* Control de recursos */
  amplificadorActivo:       false,
  modoEquilibrio:           false,
  modoEquilibrioExpiry:     null,
  capsulasUsadasEstaSemana: 0,
  ultimaCapsula:            null,
  weekKey:                  null,

  /* Stats */
  totalCompleted:   0,
  totalPomos:       0,
  perfectDays:      0,
  zonesUsed:        [],
  zoneScores:       {},
  dailyScores:      {},
  dailyZoneScores:  {},

  /* Stats para Transmisores */
  ignicionesUsadas:     0,
  qronObtenidos:        0,
  zonesDiscovered:      0,
  zonesColonized:       0,
  fluxInvokedAt3am:     false,
  zoneStatus: {
    mision:   'unexplored',
    cuerpo:   'unexplored',
    mente:    'unexplored',
    vinculos: 'unexplored',
    descanso: 'unexplored',
    creacion: 'unexplored',
    hogar:    'unexplored',
  },

  /* Missions */
  missions:        [],
  pendingMissions: [],

  /* Transmisores (reemplaza badges) */
  unlockedTransmisores: [],
  earnedBadges: [], // compat legacy

  /* Bitácora / Diario de Vuelo */
  bitacora:         [],
  fluxHistory:      [], // historial mensajes de Flux
  weeklyTipsShown:  [],

  /* Abismo */
  daysSinceActivity:   0,
  abyssLevel:          0,
  returningFromAbyss:  false,
  justCompletedPerfectDay: false,

  /* Toast queue */
  toasts: [],

  /* Pomodoro */
  activePomo: null,

  /* Queues */
  levelUpQueue:  [],
  badgeQueue:    [],
  zoneEventQueue: [],

  /* Audio */
  soundEnabled: true,
  soundVolume:  0.8,

  /* Flux */
  fluxLastWeeklyTip: null,
};

/* ─── ABISMO helpers ─── */
function calcAbyssLevel(daysSince) {
  if (daysSince <= 1) return 0;
  if (daysSince === 2) return 1;
  if (daysSince === 3) return 2;
  if (daysSince === 4) return 3;
  if (daysSince === 5) return 4;
  if (daysSince === 6) return 5;
  return 6;
}

/* ─── STORE ─── */
export const useGameStore = create(
  persist(
    (set, get) => ({
      ...defaultState,

      /* ── HYDRATE ── */
      _hydrate() {
        const { soundEnabled, soundVolume } = get();
        setSoundEnabled(soundEnabled);
        setMasterVolume(soundVolume);
      },

      /* ── ROLLOVER DIARIO ── */
      checkDailyRollover() {
        const today = todayKey();
        const { lastDay, dayStreak, shields, amortiguadores, missions, pendingMissions } = get();

        if (lastDay === today) return;
        if (!lastDay) { set({ lastDay: today, daysSinceActivity: 0, abyssLevel: 0 }); return; }

        const daysDiff = daysBetween(lastDay, today);
        const daysSince = daysDiff;

        const yesterdayMissions = missions.filter(m => !m.recurrent || shouldRecurToday(m));
        const wasAllDone = yesterdayMissions.length > 0 && yesterdayMissions.every(m => m.completedToday);

        // Use combined amortiguadores (old shields + new)
        const totalAmort = (amortiguadores || 0) + (shields || 0);
        let newStreak = dayStreak;
        let usedShield = false;

        if (daysDiff === 1) {
          if (wasAllDone) {
            newStreak = dayStreak + 1;
          } else if (totalAmort > 0) {
            newStreak = dayStreak;
            usedShield = true;
            SFX.shieldUsed();
          } else {
            newStreak = Math.max(dayStreak - 1, 0);
          }
        } else if (daysDiff > 1) {
          newStreak = 0;
        }

        const milestones = [3, 7, 14, 30];
        const crossed = milestones.find(m => dayStreak < m && newStreak >= m);
        if (crossed) SFX.streak();

        const newAmort = Math.max(
          (Math.floor(newStreak / 7) > Math.floor(dayStreak / 7))
            ? totalAmort + (usedShield ? 0 : 1)
            : totalAmort - (usedShield ? 1 : 0),
          0
        );

        // Amplificadores al lograr 10 días consecutivos de racha
        let ampBonus = 0;
        if (newStreak > 0 && newStreak % 10 === 0 && dayStreak % 10 !== 0) ampBonus = 1;

        const overdue = missions
          .filter(m => !m.recurrent && !m.completedToday)
          .map(m => ({ ...m, overdue: true, completedToday: false }));

        const recurrent = missions
          .filter(m => m.recurrent && shouldRecurToday(m))
          .map(m => ({ ...m, completedToday: false, pomosToday: 0 }));

        const unique = missions
          .filter(m => !m.recurrent && m.completedToday)
          .map(m => ({ ...m, completedToday: false, pomosToday: 0 }));

        // Cápsulas semanales reset
        const currentWeek = getWeekKey();
        const weekKey = get().weekKey;
        const capsulasReset = weekKey !== currentWeek ? { capsulasUsadasEstaSemana: 0, weekKey: currentWeek } : {};

        // Abismo
        const newAbyssLevel = calcAbyssLevel(daysSince);

        set(s => ({
          lastDay:       today,
          dayStreak:     newStreak,
          maxStreak:     Math.max(s.maxStreak, newStreak),
          shields:       0, // legacy
          amortiguadores: newAmort,
          amplificadores: s.amplificadores + ampBonus,
          perfectDays:   s.perfectDays + (wasAllDone ? 1 : 0),
          missions:      [...recurrent, ...unique],
          pendingMissions: [...s.pendingMissions, ...overdue],
          daysSinceActivity: daysSince,
          abyssLevel: newAbyssLevel,
          justCompletedPerfectDay: false,
          ...capsulasReset,
        }));
      },

      /* ── ZONE MIGRATION silenciosa ── */
      migrateOldZones() {
        set(s => ({
          missions: s.missions.map(m =>
            m.rubroId ? { ...m, zoneId: migrateZone(m.rubroId || m.zoneId), rubroId: undefined } : m
          ),
          pendingMissions: s.pendingMissions.map(m =>
            m.rubroId ? { ...m, zoneId: migrateZone(m.rubroId || m.zoneId), rubroId: undefined } : m
          ),
          zonesUsed: (s.zonesUsed || s.rubrosUsed || []).map(migrateZone),
          zoneScores: Object.fromEntries(
            Object.entries(s.zoneScores || {}).map(([k, v]) => [migrateZone(k), v])
          ),
          // Sync fluxo con totalScore si fluxo es 0 y totalScore tiene datos
          fluxo: s.fluxo || s.totalScore || 0,
          amortiguadores: s.amortiguadores || s.shields || 0,
        }));
      },

      /* ── MISSIONS CRUD ── */
      addMission(data) {
        const mission = {
          id:             nanoid(),
          title:          data.title,
          zoneId:         data.zoneId || migrateZone(data.rubroId) || 'mision',
          energia:        data.energia || 'media',
          minutes:        data.minutes || 30,
          recurrent:      data.recurrent || false,
          days:           data.days || [],
          completedToday: false,
          pomosToday:     0,
          createdAt:      todayKey(),
          overdue:        false,
        };
        set(s => ({ missions: [...s.missions, mission] }));
      },

      deleteMission(id) {
        set(s => ({
          missions:        s.missions.filter(m => m.id !== id),
          pendingMissions: s.pendingMissions.filter(m => m.id !== id),
        }));
      },

      editMission(id, updates) {
        set(s => ({
          missions: s.missions.map(m => m.id === id ? { ...m, ...updates } : m),
        }));
      },

      /* ── COMPLETE MISSION ── */
      completeMission(id) {
        const { missions, pendingMissions, dayStreak, totalScore, fluxo, zoneScores,
                amplificadorActivo, amplificadores, modoEquilibrio, modoEquilibrioExpiry,
                totalCompleted, zoneStatus } = get();
        const mission = [...missions, ...pendingMissions].find(m => m.id === id);
        if (!mission || mission.completedToday) return null;

        const zoneId  = migrateZone(mission.zoneId || mission.rubroId || 'mision');
        const MULT    = { mision: 3, cuerpo: 2, mente: 2.5, vinculos: 2, descanso: 1.5, creacion: 3, hogar: 1.5 };
        const base    = (mission.minutes / 10) * (MULT[zoneId] || 1);
        const streakBonus = Math.min(dayStreak * 0.05, 1.0);
        const pomoBonus   = Math.min((mission.pomosToday || 0) * 0.1, 0.5);
        let pts = Math.round(base * (1 + streakBonus + pomoBonus));

        // Amplificador: x2
        let consumedAmp = false;
        if (amplificadorActivo && amplificadores > 0) {
          pts = pts * 2;
          consumedAmp = true;
        }

        // Modo Equilibrio: +20%
        if (modoEquilibrio && modoEquilibrioExpiry && Date.now() < new Date(modoEquilibrioExpiry).getTime()) {
          pts = Math.round(pts * 1.2);
        }

        const oldScore = totalScore;
        const newScore = totalScore + pts;
        const newFluxo = (fluxo || 0) + pts;
        const today    = todayKey();

        const prevZonePts = (zoneScores[zoneId] || 0);
        const newZonePts  = prevZonePts + pts;
        const prevState   = getZoneState(prevZonePts);
        const newState    = getZoneState(newZonePts);

        // Calcular nuevos estados de zona
        const newZoneStatus = { ...zoneStatus };
        if (newState !== prevState) newZoneStatus[zoneId] = newState;

        // Stats for transmisores
        let newZonesDiscovered = get().zonesDiscovered;
        let newZonesColonized  = get().zonesColonized;
        if (prevState === 'unexplored' && newState !== 'unexplored') newZonesDiscovered++;
        if (prevState !== 'colonized'  && newState === 'colonized')  newZonesColonized++;

        // Ganar Ignición: primera misión del día
        const completedToday = [...missions, ...pendingMissions].filter(m => m.completedToday);
        let ignicBonus = 0;
        if (completedToday.length === 0) ignicBonus = 1; // primera del día

        // Ganar Qrón: completar misión de MISION + DESCANSO en el mismo día
        const todayZones = [...missions, ...pendingMissions]
          .filter(m => m.completedToday)
          .map(m => migrateZone(m.zoneId || m.rubroId || 'mision'));
        let qronBonus = 0;
        if (zoneId === 'mision' && todayZones.includes('descanso')) qronBonus = 1;
        if (zoneId === 'descanso' && todayZones.includes('mision')) qronBonus = 1;

        // Cápsula de memoria: al colonizar zona
        let capsulaBonus = 0;
        if (prevState !== 'colonized' && newState === 'colonized') capsulaBonus = 1;

        // Amplificadores bonus: primera colonización
        let ampBonus = 0;
        if (prevState !== 'colonized' && newState === 'colonized' && newZonesColonized === 1) ampBonus = 1;

        set(s => ({
          missions: s.missions.map(m => m.id === id ? { ...m, completedToday: true } : m),
          pendingMissions: s.pendingMissions.map(m => m.id === id ? { ...m, completedToday: true } : m),
          totalScore:     newScore,
          fluxo:          newFluxo,
          totalCompleted: s.totalCompleted + 1,
          zoneScores:     { ...s.zoneScores, [zoneId]: newZonePts },
          zonesUsed:      s.zonesUsed.includes(zoneId) ? s.zonesUsed : [...s.zonesUsed, zoneId],
          dailyScores:    { ...s.dailyScores, [today]: (s.dailyScores[today] || 0) + pts },
          dailyZoneScores: {
            ...s.dailyZoneScores,
            [today]: { ...(s.dailyZoneScores[today] || {}), [zoneId]: ((s.dailyZoneScores[today] || {})[zoneId] || 0) + pts },
          },
          zoneStatus:       newZoneStatus,
          zonesDiscovered:  newZonesDiscovered,
          zonesColonized:   newZonesColonized,
          igniciones:       Math.min((s.igniciones || 0) + ignicBonus, 3),
          qron:             (s.qron || 0) + qronBonus,
          qronObtenidos:    (s.qronObtenidos || 0) + qronBonus,
          capsulasMemoria:  (s.capsulasMemoria || 0) + capsulaBonus,
          amplificadores:   (s.amplificadores || 0) + ampBonus - (consumedAmp ? 1 : 0),
          amplificadorActivo: consumedAmp ? false : s.amplificadorActivo,
          daysSinceActivity: 0,
          abyssLevel: 0,
        }));

        // Sounds para recursos ganados
        if (ignicBonus > 0) setTimeout(() => SFX.ignicion?.(), 400);
        if (qronBonus > 0)  setTimeout(() => SFX.qron?.(), 600);

        // Zone state transitions
        if (prevState !== newState) {
          const zone = ZONES.find(z => z.id === zoneId);
          if (newState === 'discovered') {
            SFX.zoneDiscovered();
            set(s => ({ zoneEventQueue: [...s.zoneEventQueue, { type: 'discovered', zone }] }));
          } else if (newState === 'colonized') {
            SFX.zoneColonized();
            set(s => ({
              zoneEventQueue: [...s.zoneEventQueue, { type: 'colonized', zone }],
              bitacora: s.bitacora.find(b => b.zoneId === zoneId)
                ? s.bitacora
                : [...s.bitacora, { zoneId, unlockedAt: today, reflection: zone?.reflection || '' }],
            }));
          }
        }

        // Level up
        const lvlUp = didLevelUp(oldScore, newScore);
        if (lvlUp) {
          SFX.levelup();
          set(s => ({
            levelUpQueue: [...s.levelUpQueue, lvlUp],
            amortiguadores: (s.amortiguadores || 0) + 1,
          }));
        }

        // Perfect day check
        const updatedMissions = get().missions;
        const todayMissions = updatedMissions.filter(m => !m.overdue);
        const allDone = todayMissions.length > 0 && todayMissions.every(m => m.completedToday);
        if (allDone) {
          SFX.perfectDay();
          set(s => ({
            justCompletedPerfectDay: true,
            amplificadores: (s.amplificadores || 0) + (s.perfectDays === 0 ? 1 : 0), // primer día perfecto
          }));
        }

        // Amplificador al llegar a 50 misiones totales
        if (get().totalCompleted === 50) {
          set(s => ({ amplificadores: (s.amplificadores || 0) + 1 }));
        }

        // Transmisores
        const stats = get();
        const newTransmisores = checkNewTransmisores(stats, stats.unlockedTransmisores || []);
        if (newTransmisores.length > 0) {
          SFX.badge();
          set(s => ({
            unlockedTransmisores: [...(s.unlockedTransmisores || []), ...newTransmisores.map(t => t.id)],
            badgeQueue: [...s.badgeQueue, ...newTransmisores],
          }));
        }

        // Returno del Abismo: primera misión tras 7+ días sin actividad
        if (get().daysSinceActivity >= 7) {
          set({ returningFromAbyss: true });
          set(s => ({ igniciones: Math.min((s.igniciones || 0) + 1, 3) }));
        }

        return { pts, allDone, lvlUp, zoneId };
      },

      /* ── RECURSOS — Usar Amplificador ── */
      activarAmplificador() {
        const { amplificadores } = get();
        if (amplificadores < 1) return false;
        SFX.amplificatorActivate?.();
        set({ amplificadorActivo: true });
        return true;
      },

      /* ── RECURSOS — Usar Modo Equilibrio (2 Qrón) ── */
      activarModoEquilibrio() {
        const { qron } = get();
        if (qron < 2) return false;
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        set(s => ({ qron: s.qron - 2, modoEquilibrio: true, modoEquilibrioExpiry: expiry }));
        setTimeout(() => SFX.qron?.(), 100);
        return true;
      },

      /* ── RECURSOS — Usar Cápsula de Memoria ── */
      usarCapsula(missionId) {
        const { capsulasMemoria, capsulasUsadasEstaSemana } = get();
        if (capsulasMemoria < 1 || capsulasUsadasEstaSemana >= 1) return false;
        SFX.capsulaUsed?.();
        const today = todayKey();
        set(s => ({
          capsulasMemoria: s.capsulasMemoria - 1,
          capsulasUsadasEstaSemana: s.capsulasUsadasEstaSemana + 1,
          ultimaCapsula: today,
          pendingMissions: s.pendingMissions.map(m =>
            m.id === missionId ? { ...m, completedToday: true } : m
          ),
        }));
        return true;
      },

      /* ── RECURSOS — Usar Ignición ── */
      usarIgnicion() {
        const { igniciones } = get();
        if (igniciones < 1) return false;
        set(s => ({
          igniciones: s.igniciones - 1,
          ignicionesUsadas: (s.ignicionesUsadas || 0) + 1,
        }));
        return true;
      },

      /* ── FLUX — Invocar manualmente (gasta 1 Ignición) ── */
      invocarFlux() {
        const { igniciones } = get();
        if (igniciones < 1) return false;
        const hour = new Date().getHours();
        const minute = new Date().getMinutes();
        if (hour === 3 && minute < 5) {
          set({ fluxInvokedAt3am: true });
        }
        set(s => ({
          igniciones: s.igniciones - 1,
          ignicionesUsadas: (s.ignicionesUsadas || 0) + 1,
        }));
        return true;
      },

      /* ── FLUX — Guardar mensaje en historial ── */
      saveFluxMessage(message) {
        const today = todayKey();
        const entry = { date: today, message, ts: Date.now() };
        set(s => ({ fluxHistory: [...(s.fluxHistory || []).slice(-9), entry] }));
      },

      /* ── FLUX — Weekly tip control ── */
      markWeeklyTipShown() {
        const week = getWeekKey();
        set({ fluxLastWeeklyTip: week });
      },

      /* ── POMODORO ── */
      incrementPomoCount(missionId) {
        set(s => {
          // Ganar Qrón al completar pomodoro sin saltar break
          return {
            missions: s.missions.map(m =>
              m.id === missionId ? { ...m, pomosToday: (m.pomosToday || 0) + 1 } : m
            ),
            totalPomos: s.totalPomos + 1,
            qron: (s.qron || 0) + 1,
            qronObtenidos: (s.qronObtenidos || 0) + 1,
          };
        });
        setTimeout(() => SFX.qron?.(), 200);
      },

      setActivePomo(pomo) { set({ activePomo: pomo }); },

      /* ── TOASTS ── */
      addToast(msg) {
        const id = nanoid();
        set(s => ({ toasts: [...s.toasts.slice(-1), { ...msg, id }] }));
        if (msg.duration !== Infinity) {
          setTimeout(() => get().removeToast(id), msg.duration || 2500);
        }
      },

      removeToast(id) {
        set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
      },

      addFlash(msg) { get().addToast(msg); },
      removeFlash(id) { get().removeToast(id); },

      /* ── QUEUES ── */
      shiftLevelUp()    { set(s => ({ levelUpQueue: s.levelUpQueue.slice(1) })); },
      shiftBadge()      { set(s => ({ badgeQueue: s.badgeQueue.slice(1) })); },
      shiftZoneEvent()  { set(s => ({ zoneEventQueue: s.zoneEventQueue.slice(1) })); },

      /* ── AUDIO SETTINGS ── */
      setSoundEnabled(v) {
        setSoundEnabled(v);
        set({ soundEnabled: v });
      },
      setSoundVolume(v) {
        setMasterVolume(v);
        set({ soundVolume: v, soundEnabled: v > 0 });
      },

      /* ── PROFILE ── */
      setPlayerName(name) { set({ playerName: name }); },

      resetGame() {
        set({ ...defaultState, lastDay: todayKey() });
      },

      /* ── COMPUTED HELPERS ── */
      getTodayMissions() {
        return get().missions.filter(m => !m.overdue);
      },

      getPriorityMission() {
        const { missions, dayStreak } = get();
        const pending = missions.filter(m => !m.completedToday && !m.overdue);
        if (!pending.length) return null;
        const MULT = { mision: 3, cuerpo: 2, mente: 2.5, vinculos: 2, descanso: 1.5, creacion: 3, hogar: 1.5 };
        return pending.reduce((best, m) => {
          const pts     = calcPoints(m.minutes, m.zoneId || m.rubroId, dayStreak, m.pomosToday);
          const bestPts = calcPoints(best.minutes, best.zoneId || best.rubroId, dayStreak, best.pomosToday);
          return pts > bestPts ? m : best;
        }, pending[0]);
      },

      getDailyProgress() {
        const { missions, dailyScores, dayStreak } = get();
        const ms = missions.filter(m => !m.overdue);
        if (!ms.length) return { done: 0, total: 0, pct: 0, pts: 0, totalPts: 0 };
        const done     = ms.filter(m => m.completedToday).length;
        const total    = ms.length;
        const pts      = (dailyScores[todayKey()] || 0);
        const totalPts = ms.reduce((a, m) =>
          a + calcPoints(m.minutes, m.zoneId || m.rubroId, dayStreak, m.pomosToday), 0);
        return { done, total, pct: Math.round((done / total) * 100), pts, totalPts };
      },
    }),
    {
      name: 'sh8done-v2',
      migrate(persisted, version) {
        if (version === 0) {
          return { ...defaultState, ...persisted, _migrated: true };
        }
        return persisted;
      },
      version: 1,
      partialize: (s) => {
        const { toasts, levelUpQueue, badgeQueue, zoneEventQueue, ...rest } = s;
        return rest;
      },
    }
  )
);
