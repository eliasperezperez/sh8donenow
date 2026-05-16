import { useRef, useCallback } from 'react';

/* Sound registry — loaded lazily to avoid blocking render */
let howlCache = {};

function getHowl(name) {
  if (!howlCache[name]) {
    /* Dynamic import of Howler to avoid SSR issues */
    import('howler').then(({ Howl }) => {
      howlCache[name] = new Howl({
        src: [`/sounds/${name}.mp3`],
        volume: 0.6,
        preload: true,
      });
    });
    return null;
  }
  return howlCache[name];
}

/* Preload all sounds eagerly after first interaction */
export function preloadSounds() {
  ['click', 'success', 'levelup', 'alarm', 'fail'].forEach(getHowl);
}

export function useAudio() {
  const mutedRef = useRef(false);

  const play = useCallback((name) => {
    if (mutedRef.current) return;
    const h = getHowl(name);
    if (h) {
      h.play();
    } else {
      /* First call — try again after a tick */
      setTimeout(() => {
        const h2 = getHowl(name);
        if (h2) h2.play();
      }, 200);
    }
  }, []);

  const setMuted = useCallback((val) => { mutedRef.current = val; }, []);

  return { play, setMuted };
}
