import { useRef, useState, useCallback, useEffect, createContext, useContext } from 'react';
import { useGameStore } from '../store/useGameStore';

const DEFAULT_DURATION = 25 * 60;

export const PomodoroContext = createContext(null);

export function usePomodoroProvider() {
  const { setActivePomo, incrementPomoCount, addFlash } = useGameStore();
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_DURATION);
  const [running, setRunning]         = useState(false);
  const [phase, setPhase]             = useState('work');
  const intervalRef = useRef(null);
  const missionRef  = useRef(null);

  const clear = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const start = useCallback((mission, durationMinutes = 25) => {
    clear();
    missionRef.current = mission;
    setSecondsLeft(durationMinutes * 60);
    setPhase('work');
    setRunning(true);
    setActivePomo({ missionId: mission.id, startedAt: Date.now(), duration: durationMinutes });
  }, [clear, setActivePomo]);

  const pause = useCallback(() => setRunning(r => !r), []);

  const stop = useCallback(() => {
    clear();
    setRunning(false);
    setSecondsLeft(DEFAULT_DURATION);
    setPhase('work');
    missionRef.current = null;
    setActivePomo(null);
  }, [clear, setActivePomo]);

  useEffect(() => {
    if (!running) { clear(); return; }
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          if (phase === 'work' && missionRef.current) {
            incrementPomoCount(missionRef.current.id);
            addFlash({ type: 'success', title: '¡POMODORO!', text: 'Toma un descanso.', duration: 3000 });
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
            setPhase('break');
            return 5 * 60;
          } else {
            setRunning(false);
            setActivePomo(null);
            addFlash({ type: 'info', title: 'DESCANSO TERMINADO', text: '¡Listo para otra ronda!', duration: 2000 });
            return DEFAULT_DURATION;
          }
        }
        return s - 1;
      });
    }, 1000);
    return clear;
  }, [running, phase, clear, incrementPomoCount, addFlash, setActivePomo]);

  useEffect(() => () => clear(), [clear]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return { running, phase, secondsLeft, timeStr: formatTime(secondsLeft), mission: missionRef.current, start, pause, stop };
}

export function usePomodoro() {
  return useContext(PomodoroContext);
}
