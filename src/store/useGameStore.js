import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { todayKey, daysBetween, shouldRecurToday } from '../utils/dates';
import { calcPoints }                              from '../utils/scoring';
import { getLevelInfo, didLevelUp }                from '../utils/levels';
import { checkNewBadges }                          from '../utils/badges';
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

/* ─── DEFAULT STATE ─── */
const defaultState = {
  /* Player */
  playerName:   'PILOTO',
  totalScore:   0,
  dayStreak:    0,
  maxStreak:    0,
  shields:      0,
  lastDay:      null,

  /* Stats */
  totalCompleted: 0,
  totalPomos:     0,
  perfectDays:    0,
  zonesUsed:      [],    // array of zoneIds that have been used
  zoneScores:     {},    // { zoneId: totalPoints }
  dailyScores:    {},    // { 'yyyy-MM-dd': totalPoints }
  dailyZoneScores:{},    // { 'yyyy-MM-dd': { zoneId: pts } }

  /* Missions */
  missions:        [],
  pendingMissions: [],

  /* Badges */
  earnedBadges: [],

  /* Bitácora — reflexiones desbloqueadas al colonizar zonas */
  bitacora: [], // [{ zoneId, unlockedAt, reflection }]

  /* Toast queue */
  toasts: [],

  /* Pomodoro */
  activePomo: null,

  /* Queues */
  levelUpQueue: [],
  badgeQueue:   [],
  zoneEventQueue: [], // { type:'discovered'|'colonized', zone }

  /* Audio */
  soundEnabled: true,
  soundVolume:  0.8,
};

/* ─── STORE ─── */
export const useGameStore = create(
  persist(
    (set, get) => ({
      ...defaultState,

      /* ── HYDRATE — sincroniza audio con valores persistidos ── */
      _hydrate() {
        const { soundEnabled, soundVolume } = get();
        setSoundEnabled(soundEnabled);
        setMasterVolume(soundVolume);
      },

      /* ── ROLLOVER DIARIO ── */
      checkDailyRollover() {
        const today = todayKey();
        const { lastDay, dayStreak, shields, missions, pendingMissions } = get();

        if (lastDay === today) return;
        if (!lastDay) { set({ lastDay: today }); return; }

        const daysDiff = daysBetween(lastDay, today);

        const yesterdayMissions = missions.filter(m => !m.recurrent || shouldRecurToday(m));
        const wasAllDone = yesterdayMissions.length > 0 && yesterdayMissions.every(m => m.completedToday);

        let newStreak = dayStreak;
        let usedShield = false;

        if (daysDiff === 1) {
          if (wasAllDone) {
            newStreak = dayStreak + 1;
          } else if (shields > 0) {
            newStreak = dayStreak; // escudo absorbe
            usedShield = true;
            SFX.shieldUsed();
          } else {
            newStreak = Math.max(dayStreak - 1, 0);
          }
        } else if (daysDiff > 1) {
          newStreak = 0;
        }

        // Streak milestones
        const milestones = [3, 7, 14, 30];
        const crossed = milestones.find(m => dayStreak < m && newStreak >= m);
        if (crossed) SFX.streak();

        const newShields = (Math.floor(newStreak / 7) > Math.floor(dayStreak / 7))
          ? shields + (usedShield ? 0 : 1)
          : shields - (usedShield ? 1 : 0);

        const overdue = missions
          .filter(m => !m.recurrent && !m.completedToday)
          .map(m => ({ ...m, overdue: true, completedToday: false }));

        const recurrent = missions
          .filter(m => m.recurrent && shouldRecurToday(m))
          .map(m => ({ ...m, completedToday: false, pomosToday: 0 }));

        const unique = missions
          .filter(m => !m.recurrent && m.completedToday)
          .map(m => ({ ...m, completedToday: false, pomosToday: 0 }));

        set(s => ({
          lastDay:     today,
          dayStreak:   newStreak,
          maxStreak:   Math.max(s.maxStreak, newStreak),
          shields:     Math.max(newShields, 0),
          perfectDays: s.perfectDays + (wasAllDone ? 1 : 0),
          missions:    [...recurrent, ...unique],
          pendingMissions: [...s.pendingMissions, ...overdue],
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
        const { missions, pendingMissions, dayStreak, totalScore, zoneScores } = get();
        const mission = [...missions, ...pendingMissions].find(m => m.id === id);
        if (!mission || mission.completedToday) return null;

        const zoneId = migrateZone(mission.zoneId || mission.rubroId || 'mision');
        const pts     = calcPoints(mission.minutes, zoneId, dayStreak, mission.pomosToday || 0);
        const oldScore = totalScore;
        const newScore = totalScore + pts;
        const today    = todayKey();

        // Actualizar zoneScores y detectar estado anterior
        const prevZonePts = (zoneScores[zoneId] || 0);
        const newZonePts  = prevZonePts + pts;
        const prevState   = getZoneState(prevZonePts);
        const newState    = getZoneState(newZonePts);

        set(s => ({
          missions: s.missions.map(m => m.id === id ? { ...m, completedToday: true } : m),
          pendingMissions: s.pendingMissions.map(m => m.id === id ? { ...m, completedToday: true } : m),
          totalScore:     newScore,
          totalCompleted: s.totalCompleted + 1,
          zoneScores: { ...s.zoneScores, [zoneId]: newZonePts },
          zonesUsed:  s.zonesUsed.includes(zoneId) ? s.zonesUsed : [...s.zonesUsed, zoneId],
          dailyScores: { ...s.dailyScores, [today]: (s.dailyScores[today] || 0) + pts },
          dailyZoneScores: {
            ...s.dailyZoneScores,
            [today]: { ...(s.dailyZoneScores[today] || {}), [zoneId]: ((s.dailyZoneScores[today] || {})[zoneId] || 0) + pts },
          },
        }));

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
          set(s => ({ levelUpQueue: [...s.levelUpQueue, lvlUp], shields: s.shields + 1 }));
        }

        // Badges
        const stats = {
          totalCompleted: get().totalCompleted,
          maxStreak:      get().maxStreak,
          perfectDays:    get().perfectDays,
          totalScore:     newScore,
          totalPomos:     get().totalPomos,
          zonesUsed:      get().zonesUsed,
          rubrosUsed:     get().zonesUsed, // compat
        };
        const newBadges = checkNewBadges(stats, get().earnedBadges);
        if (newBadges.length > 0) {
          SFX.badge();
          set(s => ({
            earnedBadges: [...s.earnedBadges, ...newBadges.map(b => b.id)],
            badgeQueue:   [...s.badgeQueue, ...newBadges],
          }));
        }

        // Perfect day check
        const updatedMissions = get().missions;
        const todayMissions   = updatedMissions.filter(m => !m.overdue);
        const allDone = todayMissions.length > 0 && todayMissions.every(m => m.completedToday);
        if (allDone) SFX.perfectDay();

        return { pts, allDone, lvlUp, zoneId };
      },

      /* ── POMODORO ── */
      incrementPomoCount(missionId) {
        set(s => ({
          missions: s.missions.map(m =>
            m.id === missionId ? { ...m, pomosToday: (m.pomosToday || 0) + 1 } : m
          ),
          totalPomos: s.totalPomos + 1,
        }));
      },

      setActivePomo(pomo) { set({ activePomo: pomo }); },

      /* ── TOASTS ── */
      addToast(msg) {
        const id = nanoid();
        set(s => ({ toasts: [...s.toasts.slice(-1), { ...msg, id }] })); // max 2
        if (msg.duration !== Infinity) {
          setTimeout(() => get().removeToast(id), msg.duration || 2500);
        }
      },

      removeToast(id) {
        set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
      },

      // Legacy compat
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
        const missions = get().missions.filter(m => !m.completedToday && !m.overdue);
        if (!missions.length) return null;
        return missions.reduce((best, m) => {
          const pts     = calcPoints(m.minutes, m.zoneId || m.rubroId, get().dayStreak, m.pomosToday);
          const bestPts = calcPoints(best.minutes, best.zoneId || best.rubroId, get().dayStreak, best.pomosToday);
          return pts > bestPts ? m : best;
        }, missions[0]);
      },

      getDailyProgress() {
        const missions = get().missions.filter(m => !m.overdue);
        if (!missions.length) return { done: 0, total: 0, pct: 0, pts: 0, totalPts: 0 };
        const done     = missions.filter(m => m.completedToday).length;
        const total    = missions.length;
        const pts      = (get().dailyScores[todayKey()] || 0);
        const totalPts = missions.reduce((a, m) =>
          a + calcPoints(m.minutes, m.zoneId || m.rubroId, get().dayStreak, m.pomosToday), 0);
        return { done, total, pct: Math.round((done / total) * 100), pts, totalPts };
      },
    }),
    {
      name: 'sh8done-v2',
      // Migrar clave vieja si existe
      migrate(persisted, version) {
        if (version === 0) {
          // primera migración: renombrar rubrosUsed → zonesUsed, etc.
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
