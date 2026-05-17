/**
 * sounds.js — Sintetizador 8-bit completo
 * Todos los sonidos generados programáticamente con Web Audio API.
 */

import { useCallback } from 'react';

let _ctx = null;

const getCtx = () => {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
};

export function initAudio() {
  try { getCtx(); } catch (e) {}
}

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

function arp(notes, noteDuration, type = 'square', volume = 0.12) {
  notes.forEach((freq, i) =>
    tone(freq, noteDuration, type, volume, i * noteDuration * 0.9)
  );
}

let _masterVolume = 0.8;
let _soundEnabled = true;

export function setMasterVolume(v) { _masterVolume = v; }
export function setSoundEnabled(v) { _soundEnabled = v; }

function guard(fn) {
  return (...args) => {
    if (!_soundEnabled) return;
    try { fn(...args); } catch (e) {}
  };
}

export const SFX = {
  nav: guard(() => {
    tone(220, 0.04, 'square', 0.08);
  }),

  click: guard(() => {
    tone(330, 0.05, 'square', 0.10);
    tone(440, 0.03, 'square', 0.05, 0.04);
  }),

  check: guard(() => {
    arp([523, 659, 784, 1047], 0.09, 'square', 0.13);
  }),

  levelup: guard(() => {
    arp([392, 494, 587, 698, 880, 1175], 0.10, 'sawtooth', 0.11);
    setTimeout(() => {
      tone(1175, 0.3, 'square', 0.08);
      tone(880,  0.3, 'square', 0.06);
    }, 600);
  }),

  badge: guard(() => {
    arp([659, 784, 1047, 784, 1047, 1319], 0.08, 'triangle', 0.12);
  }),

  perfectDay: guard(() => {
    const melody = [523, 659, 784, 1047, 784, 1047, 1319, 1047];
    melody.forEach((f, i) => tone(f, 0.12, 'square', 0.13, i * 0.11));
    setTimeout(() => {
      tone(1047, 0.4, 'square', 0.10);
      tone(1319, 0.4, 'square', 0.08);
      tone(1568, 0.4, 'square', 0.06);
    }, 950);
  }),

  streak: guard(() => {
    arp([440, 554, 659, 880], 0.08, 'square', 0.13);
    setTimeout(() => tone(880, 0.2, 'square', 0.10), 340);
  }),

  pomodoroStart: guard(() => {
    tone(440, 0.08, 'square', 0.12);
    tone(660, 0.10, 'square', 0.12, 0.10);
  }),

  pomodoroAlarm: guard(() => {
    [0, 0.22, 0.44].forEach(delay => tone(880, 0.15, 'square', 0.15, delay));
  }),

  breakStart: guard(() => {
    arp([784, 659, 523, 392], 0.10, 'triangle', 0.10);
  }),

  breakEnd: guard(() => {
    arp([392, 523, 659, 784], 0.08, 'square', 0.12);
  }),

  addMission: guard(() => {
    tone(440, 0.06, 'square', 0.10);
    tone(660, 0.08, 'square', 0.10, 0.08);
    tone(880, 0.10, 'square', 0.10, 0.18);
  }),

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

  close: guard(() => {
    tone(440, 0.05, 'square', 0.08);
    tone(330, 0.06, 'square', 0.06, 0.06);
  }),

  overdue: guard(() => {
    arp([220, 196, 165], 0.12, 'square', 0.12);
  }),

  shieldUsed: guard(() => {
    arp([523, 784, 523], 0.10, 'triangle', 0.12);
    setTimeout(() => tone(392, 0.2, 'square', 0.08), 320);
  }),

  zoneDiscovered: guard(() => {
    tone(1047, 0.05, 'sine', 0.08);
    tone(784,  0.15, 'triangle', 0.10, 0.06);
    tone(1047, 0.20, 'sine', 0.06, 0.22);
  }),

  zoneColonized: guard(() => {
    arp([523, 659, 784, 1047], 0.09, 'square', 0.12);
    setTimeout(() => arp([784, 1047, 1319], 0.12, 'sawtooth', 0.10), 380);
    setTimeout(() => {
      tone(1319, 0.4, 'square', 0.09);
      tone(1047, 0.4, 'square', 0.07);
    }, 740);
  }),

  jump: guard(() => {
    tone(300, 0.04, 'square', 0.08);
    tone(500, 0.06, 'square', 0.10, 0.04);
  }),

  gameover: guard(() => {
    arp([440, 349, 261, 196], 0.12, 'square', 0.12);
  }),

  gamePoint: guard(() => {
    tone(880, 0.04, 'square', 0.08);
  }),

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

  /* ── NUEVOS SONIDOS DEL LORE ── */

  ignicion: guard(() => {
    tone(150, 0.03, 'square', 0.12);
    tone(800, 0.08, 'sawtooth', 0.10, 0.03);
    tone(1200, 0.10, 'square', 0.08, 0.08);
  }),

  qron: guard(() => {
    tone(1047, 0.04, 'sine', 0.10);
    tone(1319, 0.08, 'sine', 0.08, 0.05);
    tone(1047, 0.12, 'triangle', 0.06, 0.14);
  }),

  fluxAppear: guard(() => {
    tone(440, 0.03, 'sawtooth', 0.08);
    tone(660, 0.04, 'sawtooth', 0.08, 0.03);
    tone(880, 0.06, 'square', 0.10, 0.06);
  }),

  fluxAlert: guard(() => {
    [0, 0.15, 0.30].forEach(d => tone(440, 0.10, 'square', 0.12, d));
  }),

  returnFromAbyss: guard(() => {
    try {
      const ctx = getCtx();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.10 * _masterVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc.start(); osc.stop(ctx.currentTime + 0.9);
    } catch (e) {}
    setTimeout(() => arp([523, 659, 784], 0.12, 'square', 0.10), 800);
  }),

  amplificatorActivate: guard(() => {
    arp([392, 523, 659, 784, 1047], 0.07, 'square', 0.11);
  }),

  capsulaUsed: guard(() => {
    arp([880, 659, 523, 392], 0.08, 'square', 0.10);
    setTimeout(() => tone(523, 0.15, 'square', 0.08), 340);
  }),
};

export function useSound() {
  const play = useCallback((soundName) => {
    if (SFX[soundName]) SFX[soundName]();
  }, []);
  return { play, SFX };
}
