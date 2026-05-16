import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';

export default function Splash() {
  const navigate = useNavigate();
  const { checkDailyRollover, playerName, totalScore } = useGameStore();
  const [launching, setLaunching] = useState(false);
  const isFirstTime = totalScore === 0 && !playerName || playerName === 'PILOTO';

  useEffect(() => {
    checkDailyRollover();
  }, [checkDailyRollover]);

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => navigate('/home'), 700);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 10,
        gap: '0',
      }}
    >
      {/* Logo */}
      <div style={{
        fontFamily: 'var(--font-title)',
        fontWeight: 900,
        fontSize: '36px',
        color: 'var(--cyan)',
        letterSpacing: '6px',
        textShadow: '0 0 30px var(--cyan), 0 0 60px var(--cyan)',
        animation: 'breathe-glow 2s ease-in-out infinite',
        marginBottom: '8px',
      }}>
        SH8DONE
      </div>

      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '8px',
        color: 'var(--muted)',
        letterSpacing: '4px',
        marginBottom: '48px',
      }}>
        GAMIFICA TU VIDA
      </div>

      {/* Rocket */}
      <div
        style={{
          fontSize: '64px',
          lineHeight: 1,
          animation: launching
            ? 'rocket-launch 600ms ease-in forwards'
            : 'rocket-float 3s ease-in-out infinite',
          marginBottom: '48px',
          filter: 'drop-shadow(0 0 12px var(--cyan))',
        }}
      >
        🚀
      </div>

      {/* CTA */}
      <button
        onClick={handleLaunch}
        className="pressable"
        style={{
          background: 'var(--cyan)',
          border: 'none',
          color: 'var(--bg)',
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          padding: '14px 36px',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          cursor: 'pointer',
          letterSpacing: '3px',
          boxShadow: '0 0 24px var(--cyan)',
          fontWeight: 700,
        }}
      >
        {isFirstTime ? '⬆ DESPEGAR' : '▶ CONTINUAR'}
      </button>

      <div style={{
        marginTop: '16px',
        fontFamily: 'var(--font-ui)',
        fontSize: '7px',
        color: 'var(--muted)',
      }}>
        v{import.meta.env.VITE_VERSION || '1.0.0'}
      </div>
    </div>
  );
}
