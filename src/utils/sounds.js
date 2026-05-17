/**
 * sounds.js — Sintetizador 8-bit completo
 * Todos los sonidos generados programáticamente con Web Audio API.
 * Sin archivos .mp3, sin dependencias externas.
 *
 * Filosofía: feedback inmediato que cierra el loop dopaminérgico.
 * Sonidos cortos (<500ms la mayoría), distintivos, nunca intrusivos.
 */

import { useCallback } from 'react';

// ── AudioContext singleton (lazy init — REQUIERE gesto del usuario) ──────────
let _ctx = null;

const getCtx = () => {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  // iOS Safari suspende el contexto tras inactividad — resume() lo reactiva
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
};

/** Inicializar el contexto tras la primera interacción del usuario */
export function initAudio() {
  try { getCtx(); } catch (e) {}
}

// ── Generador base ───────────────────────────────────────────────────────────

/**
 * Genera un tono simple con envelope de volumen
 * @param {number} freq       Frecuencia en Hz
 * @param {number} duration   Duración en segundos
 * @param {string} type       Tipo de onda: 'square'|'sawtooth'|'triangle'|'sine'
 * @param {number} volume     Volumen base (0-1), multiplicado por soundVolume global
 * @param {number} delay      Retardo antes de iniciar (segundos)
 */
function tone(freq, duration, type = 'square', volume = 0.15, delay = 0) {
  try {
    const ctx = getCtx();
    const vol = volume * _masterVolume;
    if (vol <= 0) return;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.value = freq;

    const t = ctx.currentTime + delay;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  } catch (e) {}
}

/**
 * Genera un arpegio: serie de tonos con delay entre sí
 * @param {number[]} notes      Array de frecuencias
 * @param {number}  noteDuration Duración de cada nota
 * @param {string}  type        Tipo de onda
 * @param {number}  volume      Volumen
 */
function arp(notes, noteDuration, type = 'square', volume = 0.12) {
  notes.forEach((freq, i) =>
    tone(freq, noteDuration, type, volume, i * noteDuration * 0.9)
  );
}

// ── Volumen maestro (controlado desde Zustand) ───────────────────────────────
let _masterVolume = 0.8;
let _soundEnabled = true;

export function setMasterVolume(v) { _masterVolume = v; }
export function setSoundEnabled(v) { _soundEnabled = v; }

// ── Guard para todos los SFX ─────────────────────────────────────────────────
function guard(fn) {
  return (...args) => {
    if (!_soundEnabled) return;
    try { fn(...args); } catch (e) {}
  };
}

// ── CATÁLOGO DE SONIDOS ──────────────────────────────────────────────────────
export const SFX = {
  /**
   * NAV — tap en botones de navegación inferior
   * Corto, sutil. Un click de baja frecuencia.
   */
  nav: guard(() => {
    tone(220, 0.04, 'square', 0.08);
  }),

  /**
   * CLICK — interacción genérica (toggle, abrir menú, etc.)
   * Ligeramente más alto que nav, con micro-eco.
   */
  click: guard(() => {
    tone(330, 0.05, 'square', 0.10);
    tone(440, 0.03, 'square', 0.05, 0.04);
  }),

  /**
   * CHECK — completar una misión ★ EL MÁS IMPORTANTE ★
   * Acorde ascendente de 4 notas tipo "¡lograste algo!"
   * Inspirado en coins de Mario pero más ciberpunk.
   */
  check: guard(() => {
    arp([523, 659, 784, 1047], 0.09, 'square', 0.13);
  }),

  /**
   * LEVEL UP — subir de nivel
   * La melodía más elaborada. 6 notas ascendentes sawtooth para textura.
   * Acorde final de celebración tras 600ms.
   */
  levelup: guard(() => {
    arp([392, 494, 587, 698, 880, 1175], 0.10, 'sawtooth', 0.11);
    setTimeout(() => {
      tone(1175, 0.3, 'square', 0.08);
      tone(880,  0.3, 'square', 0.06);
    }, 600);
  }),

  /**
   * BADGE — desbloquear un logro
   * Ping diferente al level up. Más misterioso con triangle.
   */
  badge: guard(() => {
    arp([659, 784, 1047, 784, 1047, 1319], 0.08, 'triangle', 0.12);
  }),

  /**
   * PERFECT DAY — todas las misiones completadas
   * La más elaborada. 8 notas + acorde final triunfal.
   */
  perfectDay: guard(() => {
    const melody = [523, 659, 784, 1047, 784, 1047, 1319, 1047];
    melody.forEach((f, i) => tone(f, 0.12, 'square', 0.13, i * 0.11));
    setTimeout(() => {
      tone(1047, 0.4, 'square', 0.10);
      tone(1319, 0.4, 'square', 0.08);
      tone(1568, 0.4, 'square', 0.06);
    }, 950);
  }),

  /**
   * STREAK MILESTONE — rachas de 3, 7, 14, 30 días
   * Retro arcade bonus. Distinto al level up.
   */
  streak: guard(() => {
    arp([440, 554, 659, 880], 0.08, 'square', 0.13);
    setTimeout(() => tone(880, 0.2, 'square', 0.10), 340);
  }),

  /**
   * POMODORO START — inicio del timer de trabajo
   * Dos tonos cortos: "listo, a trabajar"
   */
  pomodoroStart: guard(() => {
    tone(440, 0.08, 'square', 0.12);
    tone(660, 0.10, 'square', 0.12, 0.10);
  }),

  /**
   * POMODORO ALARM — timer de trabajo terminado
   * Tres pulsos urgentes pero no molestos.
   */
  pomodoroAlarm: guard(() => {
    [0, 0.22, 0.44].forEach(delay => tone(880, 0.15, 'square', 0.15, delay));
  }),

  /**
   * BREAK START — inicio del descanso / mini-juego
   * Más suave y relajado. Notas descendentes con triangle.
   */
  breakStart: guard(() => {
    arp([784, 659, 523, 392], 0.10, 'triangle', 0.10);
  }),

  /**
   * BREAK END — fin del descanso, regreso al trabajo
   * Ascendente, energizante.
   */
  breakEnd: guard(() => {
    arp([392, 523, 659, 784], 0.08, 'square', 0.12);
  }),

  /**
   * ADD MISSION — confirmar nueva misión agregada
   * Positivo y corto. "Misión registrada."
   */
  addMission: guard(() => {
    tone(440, 0.06, 'square', 0.10);
    tone(660, 0.08, 'square', 0.10, 0.08);
    tone(880, 0.10, 'square', 0.10, 0.18);
  }),

  /**
   * OPEN FORM — abrir el panel de nueva misión
   * Sweep ascendente electrónico (sawtooth glide).
   */
  openForm: guard(() => {
    try {
      const ctx = getCtx();
      const vol = 0.08 * _masterVolume;
      if (vol <= 0) return;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.20);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch (e) {}
  }),

  /**
   * CLOSE / CANCEL — cerrar panel, cancelar acción
   * Descendente sutil.
   */
  close: guard(() => {
    tone(440, 0.05, 'square', 0.08);
    tone(330, 0.06, 'square', 0.06, 0.06);
  }),

  /**
   * OVERDUE ALERT — misiones en deuda detectadas al montar app
   * Tres tonos bajos de advertencia.
   */
  overdue: guard(() => {
    arp([220, 196, 165], 0.12, 'square', 0.12);
  }),

  /**
   * SHIELD USED — escudo de racha consumido
   * "Protección activada."
   */
  shieldUsed: guard(() => {
    arp([523, 784, 523], 0.10, 'triangle', 0.12);
    setTimeout(() => tone(392, 0.2, 'square', 0.08), 320);
  }),

  /**
   * ZONE DISCOVERED — zona alcanzó 10 pts (Descubierto)
   * Ping espacial misterioso.
   */
  zoneDiscovered: guard(() => {
    tone(1047, 0.05, 'sine', 0.08);
    tone(784,  0.15, 'triangle', 0.10, 0.06);
    tone(1047, 0.20, 'sine', 0.06, 0.22);
  }),

  /**
   * ZONE COLONIZED — zona alcanzó 50 pts (Colonizado)
   * Fanfarria espacial. El segundo más elaborado después de perfectDay.
   */
  zoneColonized: guard(() => {
    arp([523, 659, 784, 1047], 0.09, 'square', 0.12);
    setTimeout(() => arp([784, 1047, 1319], 0.12, 'sawtooth', 0.10), 380);
    setTimeout(() => {
      tone(1319, 0.4, 'square', 0.09);
      tone(1047, 0.4, 'square', 0.07);
    }, 740);
  }),

  // ── SPACE GAME ─────────────────────────────────────────────────────────────
  /** Jump — nave esquivando */
  jump: guard(() => {
    tone(300, 0.04, 'square', 0.08);
    tone(500, 0.06, 'square', 0.10, 0.04);
  }),

  /** Game Over */
  gameover: guard(() => {
    arp([440, 349, 261, 196], 0.12, 'square', 0.12);
  }),

  /** Punto conseguido */
  gamePoint: guard(() => {
    tone(880, 0.04, 'square', 0.08);
  }),

  // ── SPLASH ─────────────────────────────────────────────────────────────────
  /**
   * LAUNCH — animación de despegar en Splash
   * Rumble ascendente de motor de cohete.
   */
  launch: guard(() => {
    try {
      const ctx = getCtx();
      const vol = 0.12 * _masterVolume;
      if (vol <= 0) return;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.62);
    } catch (e) {}
  }),
};

// ── React hook ───────────────────────────────────────────────────────────────
export function useSound() {
  const play = useCallback((soundName) => {
    if (SFX[soundName]) SFX[soundName]();
  }, []);
  return { play, SFX };
}
