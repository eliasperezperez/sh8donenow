import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getLevelInfo, LEVELS } from '../utils/levels';

export default function Profile() {
  const {
    playerName, setPlayerName, totalScore, dayStreak, maxStreak,
    shields, totalCompleted, totalPomos, perfectDays, resetGame,
    earnedBadges,
  } = useGameStore();

  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [confirmReset, setConfirmReset] = useState(false);
  const [muted, setMuted] = useState(false);

  const lvl = getLevelInfo(totalScore);

  const handleSaveName = () => {
    if (nameInput.trim()) setPlayerName(nameInput.trim().toUpperCase());
    setEditName(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <header style={{ padding: '16px', borderBottom: '1px solid var(--dim)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '18px', color: 'var(--cyan)', letterSpacing: '3px' }}>
          PERFIL
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Avatar + name */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '20px',
          border: '1px solid var(--cyan)',
          textAlign: 'center',
          boxShadow: '0 0 20px var(--cyan)20',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '8px', filter: 'drop-shadow(0 0 12px var(--cyan))' }}>🚀</div>

          {editName ? (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value.slice(0, 16))}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--cyan)',
                  color: 'var(--cyan)',
                  fontFamily: 'var(--font-title)',
                  fontWeight: 700,
                  fontSize: '18px',
                  padding: '6px 12px',
                  clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                  textAlign: 'center',
                  width: '180px',
                }}
                autoFocus
              />
              <button
                onClick={handleSaveName}
                style={{
                  background: 'var(--cyan)', border: 'none', color: 'var(--bg)',
                  fontFamily: 'var(--font-ui)', fontSize: '8px', padding: '6px 10px',
                  clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                  cursor: 'pointer',
                }}
              >✓</button>
            </div>
          ) : (
            <div
              onClick={() => setEditName(true)}
              style={{
                fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '22px',
                color: 'var(--cyan)', marginBottom: '4px', cursor: 'pointer',
                letterSpacing: '3px',
              }}
            >
              {playerName} ✎
            </div>
          )}

          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'var(--gold)' }}>
            NIV {lvl.level} — {lvl.name}
          </div>

          <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '28px', color: 'var(--cyan)', marginTop: '12px' }}
            className="score-breathe"
          >
            {totalScore.toLocaleString()}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>PUNTOS TOTALES</div>
        </div>

        {/* Level ladder */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '16px',
          border: '1px solid var(--dim)',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '12px' }}>PROGRESIÓN DE NIVELES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {LEVELS.map(l => {
              const isCurrent = l.level === lvl.level;
              const isPassed  = totalScore >= l.minScore && !isCurrent;
              const isLocked  = totalScore < l.minScore;
              return (
                <div
                  key={l.level}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px',
                    background: isCurrent ? 'var(--bg3)' : 'transparent',
                    border: isCurrent ? '1px solid var(--cyan)' : '1px solid transparent',
                    clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                    opacity: isLocked ? 0.35 : 1,
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--font-ui)', fontSize: '8px',
                    color: isCurrent ? 'var(--cyan)' : isPassed ? 'var(--gold)' : 'var(--muted)',
                    minWidth: '20px',
                  }}>
                    {isPassed ? '★' : isCurrent ? '▶' : `${l.level}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '11px', color: isCurrent ? 'var(--cyan)' : 'var(--text)' }}>
                      {l.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>
                      {l.minScore.toLocaleString()} PTS
                    </div>
                  </div>
                  {isCurrent && (
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--cyan)' }}>
                      {Math.round(lvl.progress)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '16px',
          border: '1px solid var(--dim)',
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px',
        }}>
          {[
            { label: 'RACHA ACTUAL',   value: dayStreak,       icon: '🔥', color: 'var(--pink)'   },
            { label: 'RACHA MÁXIMA',   value: maxStreak,       icon: '⚡', color: 'var(--gold)'   },
            { label: 'ESCUDOS',        value: shields,         icon: '🛡', color: 'var(--purple)' },
            { label: 'MISIONES',       value: totalCompleted,  icon: '✓',  color: 'var(--green)'  },
            { label: 'POMODOROS',      value: totalPomos,      icon: '⏱', color: 'var(--cyan)'   },
            { label: 'DÍAS PERFECTOS', value: perfectDays,     icon: '⭐', color: 'var(--gold)'   },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '20px', color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '16px',
          border: '1px solid var(--dim)',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>CONFIGURACIÓN</div>

          {/* Mute toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'var(--text)' }}>🔊 SONIDO</span>
            <button
              onClick={() => setMuted(m => !m)}
              style={{
                background: muted ? 'var(--dim)' : 'var(--cyan)',
                border: 'none',
                color: muted ? 'var(--muted)' : 'var(--bg)',
                fontFamily: 'var(--font-ui)',
                fontSize: '7px',
                padding: '5px 14px',
                clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                cursor: 'pointer',
              }}
            >
              {muted ? 'OFF' : 'ON'}
            </button>
          </div>

          {/* Reset */}
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              style={{
                background: 'var(--dim)', border: '1px solid var(--pink)',
                color: 'var(--pink)',
                fontFamily: 'var(--font-ui)', fontSize: '7px',
                padding: '10px',
                clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              ⚠ RESETEAR PROGRESO
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setConfirmReset(false)}
                style={{
                  flex: 1, background: 'var(--dim)', border: 'none', color: 'var(--text)',
                  fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '8px',
                  clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                  cursor: 'pointer',
                }}
              >CANCELAR</button>
              <button
                onClick={() => { resetGame(); setConfirmReset(false); }}
                style={{
                  flex: 1, background: 'var(--pink)', border: 'none', color: 'white',
                  fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '8px',
                  clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                  cursor: 'pointer',
                }}
              >¡CONFIRMAR RESET!</button>
            </div>
          )}
        </div>

        <div style={{ height: '80px' }} />
      </div>
    </div>
  );
}
