import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { getLevelInfo, LEVELS } from '../utils/levels';
import { ZONES } from '../utils/zones';
import { SFX } from '../utils/sounds';

/* ── Bitácora sub-tab ── */
function Bitacora({ entries }) {
  const getZone = (id) => ZONES.find(z => z.id === id);

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '48px', opacity: 0.4 }}>📖</div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', lineHeight: 2, letterSpacing: '1px' }}>
          TU BITÁCORA ESTÁ VACÍA.<br />COLONIZA ZONAS PARA<br />DESBLOQUEAR SABIDURÍA.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {entries.map((entry, i) => {
        const zone = getZone(entry.zoneId);
        if (!zone) return null;
        return (
          <motion.div key={entry.zoneId}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              background: 'var(--bg2)',
              clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
              border: `1px solid ${zone.color}40`,
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{zone.emoji}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: zone.color }}>{zone.short}</div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)', marginTop: '2px' }}>
                  COLONIZADO {entry.unlockedAt}
                </div>
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text)',
              lineHeight: 1.7, borderLeft: `2px solid ${zone.color}60`, paddingLeft: '10px',
              fontStyle: 'italic',
            }}>
              "{entry.reflection}"
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Profile() {
  const {
    playerName, setPlayerName, totalScore, dayStreak, maxStreak,
    shields, totalCompleted, totalPomos, perfectDays, resetGame,
    earnedBadges, soundEnabled, soundVolume, setSoundEnabled, setSoundVolume,
    bitacora,
  } = useGameStore();

  const [tab, setTab]           = useState('stats'); // 'stats' | 'bitacora'
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [confirmReset, setConfirmReset] = useState(false);
  const lvl = getLevelInfo(totalScore);

  const handleSaveName = () => {
    if (nameInput.trim()) { setPlayerName(nameInput.trim().toUpperCase()); SFX.addMission(); }
    setEditName(false);
  };

  const handleVolumeSet = (v) => {
    SFX.click();
    setSoundVolume(v);
  };

  const volLabel = soundVolume === 0 ? 'OFF' : soundVolume <= 0.5 ? '50%' : '100%';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <header style={{ padding: '16px', borderBottom: '1px solid var(--dim)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '18px', color: 'var(--cyan)', letterSpacing: '3px', marginBottom: '10px' }}>
          PERFIL
        </div>
        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['stats', 'ESTADÍSTICAS'], ['bitacora', `BITÁCORA (${bitacora.length})`]].map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); SFX.click(); }}
              style={{
                background: tab === k ? 'var(--cyan)' : 'var(--dim)',
                border: 'none', color: tab === k ? 'var(--bg)' : 'var(--muted)',
                fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '6px 10px',
                clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                cursor: 'pointer',
              }}
            >{l}</button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <AnimatePresence mode="wait">
          {tab === 'bitacora' ? (
            <motion.div key="bitacora" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Bitacora entries={bitacora} />
            </motion.div>
          ) : (
            <motion.div key="stats" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Avatar + name */}
              <div style={{
                background: 'var(--bg2)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '20px', border: '1px solid var(--cyan)', textAlign: 'center',
                boxShadow: '0 0 20px rgba(0,245,255,0.12)',
              }}>
                <div style={{ fontSize: '56px', marginBottom: '8px', filter: 'drop-shadow(0 0 12px var(--cyan))' }}>🚀</div>
                {editName ? (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                    <input value={nameInput} onChange={e => setNameInput(e.target.value.slice(0, 16))}
                      onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                      style={{
                        background: 'var(--bg3)', border: '1px solid var(--cyan)', color: 'var(--cyan)',
                        fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '18px',
                        padding: '6px 12px', clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                        textAlign: 'center', width: '180px',
                      }}
                      autoFocus
                    />
                    <button onClick={handleSaveName}
                      style={{
                        background: 'var(--cyan)', border: 'none', color: 'var(--bg)',
                        fontFamily: 'var(--font-ui)', fontSize: '8px', padding: '6px 10px',
                        clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                        cursor: 'pointer',
                      }}
                    >✓</button>
                  </div>
                ) : (
                  <div onClick={() => setEditName(true)} style={{
                    fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '20px', color: 'var(--cyan)',
                    marginBottom: '4px', cursor: 'pointer', letterSpacing: '3px',
                  }}>
                    {playerName} <span style={{ fontSize: '14px', opacity: 0.5 }}>✎</span>
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'var(--gold)' }}>
                  NIV {lvl.level} — {lvl.name}
                </div>
                <div className="score-breathe" style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '28px', color: 'var(--cyan)', marginTop: '10px' }}>
                  {totalScore.toLocaleString()}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>PUNTOS TOTALES</div>
              </div>

              {/* Level ladder */}
              <div style={{
                background: 'var(--bg2)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '14px', border: '1px solid var(--dim)',
              }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '10px' }}>PROGRESIÓN</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {LEVELS.map(l => {
                    const isCurrent = l.level === lvl.level;
                    const isPassed  = totalScore >= l.minScore && !isCurrent;
                    const isLocked  = totalScore < l.minScore;
                    return (
                      <div key={l.level} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '6px 10px',
                        background: isCurrent ? 'var(--bg3)' : 'transparent',
                        border: isCurrent ? '1px solid var(--cyan)' : '1px solid transparent',
                        clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                        opacity: isLocked ? 0.3 : 1,
                      }}>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: isCurrent ? 'var(--cyan)' : isPassed ? 'var(--gold)' : 'var(--muted)', minWidth: '18px' }}>
                          {isPassed ? '★' : isCurrent ? '▶' : `${l.level}`}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '11px', color: isCurrent ? 'var(--cyan)' : 'var(--text)' }}>
                            {l.name}
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

              {/* Stats grid */}
              <div style={{
                background: 'var(--bg2)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '14px', border: '1px solid var(--dim)',
                display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px',
              }}>
                {[
                  { label: 'RACHA',      value: dayStreak,      icon: '🔥', color: 'var(--pink)'   },
                  { label: 'MÁX RACHA',  value: maxStreak,      icon: '⚡', color: 'var(--gold)'   },
                  { label: 'ESCUDOS',    value: shields,        icon: '🛡', color: 'var(--purple)' },
                  { label: 'MISIONES',   value: totalCompleted, icon: '✓',  color: 'var(--green)'  },
                  { label: 'POMODOROS',  value: totalPomos,     icon: '⏱', color: 'var(--cyan)'   },
                  { label: 'DÍAS PERF.', value: perfectDays,    icon: '⭐', color: 'var(--gold)'   },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', marginBottom: '3px' }}>{s.icon}</div>
                    <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '18px', color: s.color }}>{s.value}</div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Audio control */}
              <div style={{
                background: 'var(--bg2)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '14px', border: '1px solid var(--dim)', display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>AUDIO</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'var(--text)' }}>🔊 SONIDOS</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { label: 'OFF', vol: 0 },
                      { label: '50%', vol: 0.5 },
                      { label: '100%', vol: 1 },
                    ].map(v => (
                      <motion.button key={v.label} whileTap={{ scale: 0.9 }}
                        onClick={() => handleVolumeSet(v.vol)}
                        style={{
                          background: soundVolume === v.vol ? 'var(--cyan)' : 'var(--dim)',
                          border: 'none', color: soundVolume === v.vol ? 'var(--bg)' : 'var(--muted)',
                          fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '5px 10px',
                          clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                          cursor: 'pointer',
                        }}
                      >{v.label}</motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div style={{
                background: 'var(--bg2)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '14px', border: '1px solid var(--dim)',
              }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '10px' }}>ZONA DE PELIGRO</div>
                {!confirmReset ? (
                  <button onClick={() => { setConfirmReset(true); SFX.click(); }}
                    style={{
                      width: '100%', background: 'var(--dim)', border: '1px solid var(--pink)',
                      color: 'var(--pink)', fontFamily: 'var(--font-ui)', fontSize: '7px',
                      padding: '10px',
                      clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                      cursor: 'pointer',
                    }}
                  >⚠ RESETEAR PROGRESO</button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setConfirmReset(false)}
                      style={{
                        flex: 1, background: 'var(--dim)', border: 'none', color: 'var(--text)',
                        fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '8px',
                        clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                        cursor: 'pointer',
                      }}
                    >CANCELAR</button>
                    <button onClick={() => { resetGame(); setConfirmReset(false); SFX.close(); }}
                      style={{
                        flex: 1, background: 'var(--pink)', border: 'none', color: 'white',
                        fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '8px',
                        clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                        cursor: 'pointer',
                      }}
                    >¡CONFIRMAR!</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ height: '80px' }} />
      </div>
    </div>
  );
}
