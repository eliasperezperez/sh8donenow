import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { SFX, initAudio } from '../utils/sounds';

export default function Splash() {
  const navigate = useNavigate();
  const { checkDailyRollover, totalScore, playerName } = useGameStore();
  const [launching, setLaunching] = useState(false);
  const isFirstTime = totalScore === 0 || playerName === 'PILOTO';

  useEffect(() => {
    checkDailyRollover();
  }, [checkDailyRollover]);

  const handleLaunch = () => {
    initAudio();
    SFX.launch();
    setLaunching(true);
    setTimeout(() => navigate('/home'), 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 10, gap: '0',
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '36px',
          color: 'var(--cyan)', letterSpacing: '6px',
          textShadow: '0 0 30px var(--cyan), 0 0 60px var(--cyan)',
          animation: 'breathe-glow 2s ease-in-out infinite',
          marginBottom: '8px',
        }}
      >SH8DONE</motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'var(--muted)', letterSpacing: '4px', marginBottom: '48px' }}
      >GAMIFICA TU VIDA</motion.div>

      {/* Rocket */}
      <motion.div
        animate={launching
          ? { y: '-100vh', scale: 0.8, opacity: 0 }
          : { y: [0, -8, 0] }
        }
        transition={launching
          ? { duration: 0.55, ease: 'easeIn' }
          : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{ fontSize: '64px', lineHeight: 1, marginBottom: '48px', filter: 'drop-shadow(0 0 12px var(--cyan))' }}
      >🚀</motion.div>

      {/* CTA */}
      <AnimatePresence>
        {!launching && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleLaunch}
            style={{
              background: 'var(--cyan)', border: 'none', color: 'var(--bg)',
              fontFamily: 'var(--font-ui)', fontSize: '10px',
              padding: '14px 36px',
              clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
              cursor: 'pointer', letterSpacing: '3px',
              boxShadow: '0 0 24px rgba(0,245,255,0.5)', fontWeight: 700,
            }}
          >{isFirstTime ? '⬆ DESPEGAR' : '▶ CONTINUAR'}</motion.button>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        style={{ marginTop: '16px', fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}
      >v{import.meta.env.VITE_VERSION || '1.0.0'}</motion.div>
    </motion.div>
  );
}
