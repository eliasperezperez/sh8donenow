import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { todayKey, daysBetween, shouldRecurToday } from '../utils/dates';
import { calcPoints } from '../utils/scoring';
import { getLevelInfo, didLevelUp } from '../utils/levels';
import { checkNewBadges } from '../utils/badges';
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
  rubrosUsed:     [],
  dailyScores:    {}, // { 'yyyy-MM-dd': number }

  /* Missions */
  missions:        [],  // all active missions
  pendingMissions: [],  // overdue from previous days

  /* Earned badges */
  earnedBadges: [],

  /* Flash messages queue */
  flashMessages: [],

  /* Pomodoro state — managed by usePomodoro hook, stored here for persistence */
  activePomo: null, // { missionId, startedAt, duration, completed }

  /* Level up event queue */
  levelUpQueue: [],
  badgeQueue:   [],
};

/* ─── STORE ─── */
export const useGameStore = create(
  persist(
    (set, get) => ({
      ...defaultState,

      /* ── ROLLOVER DIARIO ── */
      checkDailyRollover() {
        const today = todayKey();
        const { lastDay, dayStreak, shields, missions, pendingMissions } = get();

        if (lastDay === today) return; // already checked today

        if (!lastDay) {
          set({ lastDay: today });
          return;
        }

        const daysDiff = daysBetween(lastDay, today);

        // Check if yesterday was perfect
        const yesterdayMissions = missions.filter(m => !m.recurrent || shouldRecurToday(m));
        const wasAllDone = yesterdayMissions.length > 0 && yesterdayMissions.every(m => m.completedToday);

        // Update streak
        let newStreak = dayStreak;
        if (daysDiff === 1) {
          newStreak = wasAllDone ? dayStreak + 1 : Math.max(dayStreak - 1, 0);
          // Shield absorbs break
          if (!wasAllDone && dayStreak > 0 && shields > 0) {
            newStreak = dayStreak;
            set(s => ({ shields: s.shields - 1 }));
          }
        } else if (daysDiff > 1) {
          newStreak = 0;
        }

        // Perfect day bonus
        const perfectBonus = wasAllDone ? 1 : 0;

        // Shield every 7 streak days
        const newShields = Math.floor(newStreak / 7) > Math.floor(dayStreak / 7)
          ? shields + 1
          : shields;

        // Move uncompleted unique missions to pending
        const overdue = missions
          .filter(m => !m.recurrent && !m.completedToday)
          .map(m => ({ ...m, overdue: true, completedToday: false }));

        // Regenerate recurring missions for today
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
          shields:     newShields,
          perfectDays: s.perfectDays + perfectBonus,
          missions:    [...recurrent, ...unique],
          pendingMissions: [...pendingMissions, ...overdue],
        }));
      },

      /* ── MISSIONS CRUD ── */
      addMission(data) {
        const mission = {
          id:            nanoid(),
          title:         data.title,
          rubroId:       data.rubroId,
          energia:       data.energia || 'media',
          minutes:       data.minutes || 30,
          recurrent:     data.recurrent || false,
          days:          data.days || [],
          completedToday: false,
          pomosToday:    0,
          createdAt:     todayKey(),
          overdue:       false,
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
      completeMission(id, extraPomos = 0) {
        const { missions, pendingMissions, dayStreak, totalScore } = get();
        const mission = [...missions, ...pendingMissions].find(m => m.id === id);
        if (!mission || mission.completedToday) return null;

        const pts = calcPoints(mission.minutes, mission.rubroId, dayStreak, mission.pomosToday + extraPomos);
        const oldScore = totalScore;
        const newScore = totalScore + pts;

        // Mark completed
        set(s => ({
          missions: s.missions.map(m =>
            m.id === id ? { ...m, completedToday: true } : m
          ),
          pendingMissions: s.pendingMissions.map(m =>
            m.id === id ? { ...m, completedToday: true } : m
          ),
          totalScore:     newScore,
          totalCompleted: s.totalCompleted + 1,
          dailyScores: {
            ...s.dailyScores,
            [todayKey()]: (s.dailyScores[todayKey()] || 0) + pts,
          },
          rubrosUsed: s.rubrosUsed.includes(mission.rubroId)
            ? s.rubrosUsed
            : [...s.rubrosUsed, mission.rubroId],
        }));

        // Check level up
        const lvlUp = didLevelUp(oldScore, newScore);
        if (lvlUp) {
          set(s => ({ levelUpQueue: [...s.levelUpQueue, lvlUp] }));
          // +1 shield on level up
          set(s => ({ shields: s.shields + 1 }));
        }

        // Check perfect day
        const updatedMissions = get().missions;
        const todayMissions = updatedMissions.filter(m => !m.overdue);
        const allDone = todayMissions.length > 0 && todayMissions.every(m => m.completedToday);

        // Check new badges
        const stats = {
          totalCompleted: get().totalCompleted,
          maxStreak:      get().maxStreak,
          perfectDays:    get().perfectDays + (allDone ? 1 : 0),
          totalScore:     newScore,
          totalPomos:     get().totalPomos,
          rubrosUsed:     get().rubrosUsed,
        };
        const newBadges = checkNewBadges(stats, get().earnedBadges);
        if (newBadges.length > 0) {
          set(s => ({
            earnedBadges: [...s.earnedBadges, ...newBadges.map(b => b.id)],
            badgeQueue:   [...s.badgeQueue, ...newBadges],
          }));
        }

        return { pts, allDone, lvlUp };
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

      setActivePomo(pomo) {
        set({ activePomo: pomo });
      },

      /* ── FLASH MESSAGES ── */
      addFlash(msg) {
        const id = nanoid();
        set(s => ({ flashMessages: [...s.flashMessages, { ...msg, id }] }));
        setTimeout(() => get().removeFlash(id), msg.duration || 3000);
      },

      removeFlash(id) {
        set(s => ({ flashMessages: s.flashMessages.filter(m => m.id !== id) }));
      },

      /* ── QUEUES ── */
      shiftLevelUp() {
        set(s => ({ levelUpQueue: s.levelUpQueue.slice(1) }));
      },

      shiftBadge() {
        set(s => ({ badgeQueue: s.badgeQueue.slice(1) }));
      },

      /* ── PROFILE ── */
      setPlayerName(name) {
        set({ playerName: name });
      },

      resetGame() {
        set({ ...defaultState, lastDay: todayKey() });
      },

      /* ── COMPUTED HELPERS ── */
      getTodayMissions() {
        return get().missions.filter(m => !m.overdue);
      },

      getPriorityMission() {
        const missions = get().missions.filter(m => !m.completedToday && !m.overdue);
        if (missions.length === 0) return null;
        return missions.reduce((best, m) => {
          const pts = calcPoints(m.minutes, m.rubroId, get().dayStreak, m.pomosToday);
          const bestPts = calcPoints(best.minutes, best.rubroId, get().dayStreak, best.pomosToday);
          return pts > bestPts ? m : best;
        }, missions[0]);
      },

      getDailyProgress() {
        const missions = get().missions.filter(m => !m.overdue);
        if (missions.length === 0) return { done: 0, total: 0, pct: 0, pts: 0, totalPts: 0 };
        const done = missions.filter(m => m.completedToday).length;
        const total = missions.length;
        const pts = (get().dailyScores[todayKey()] || 0);
        const totalPts = missions.reduce((acc, m) =>
          acc + calcPoints(m.minutes, m.rubroId, get().dayStreak, m.pomosToday), 0);
        return { done, total, pct: Math.round((done / total) * 100), pts, totalPts };
      },
    }),
    {
      name: 'sh8done-v1',
      partialize: (state) => {
        const { flashMessages, levelUpQueue, badgeQueue, ...rest } = state;
        return rest;
      },
    }
  )
);

/* nanoid shim — inline to avoid extra dep */
function nanoid(size = 21) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (const b of bytes) id += chars[b & 63];
  return id;
}
