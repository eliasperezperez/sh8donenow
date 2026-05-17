import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { getLast7Days, formatWeekDay, todayKey } from '../utils/dates';
import { getLevelInfo } from '../utils/levels';
import { BADGE_DEFS } from '../utils/badges';
import { ZONES, getZoneState, getZoneLabel } from '../utils/zones';
import { SFX } from '../utils/sounds';

/* ── Radar Chart SVG ──────────────────────────────────────────────────────── */
function RadarChart({ zoneScores, period = 'total', dailyZoneScores, last7 }) {
  const [hovered, setHovered] = useState(null);
  const cx = 150, cy = 140, R = 110;
  const N  = ZONES.length;

  // Compute values per zone for the selected period
  const getVal = (zoneId) => {
    if (period === 'total') return zoneScores[zoneId] || 0;
    const relevant = period === 'week' ? last7 : Object.keys(dailyZoneScores);
    return relevant.reduce((acc, date) => acc + ((dailyZoneScores[date] || {})[zoneId] || 0), 0);
  };

  const maxVal = Math.max(...ZONES.map(z => getVal(z.id)), 1);

  const getPoint = (index, value) => {
    const angle = (2 * Math.PI * index) / N - Math.PI / 2;
    const r     = R * (value / maxVal);
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const getLabelPoint = (index) => {
    const angle = (2 * Math.PI * index) / N - Math.PI / 2;
    return { x: cx + (R + 22) * Math.cos(angle), y: cy + (R + 22) * Math.sin(angle) };
  };

  const dataPoints = ZONES.map((z, i) => getPoint(i, getVal(z.id)));
  const polygon    = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg width="100%" viewBox="0 0 300 280" style={{ overflow: 'visible' }}>
      {/* Grid circles */}
      {gridLevels.map(lvl => {
        const pts = ZONES.map((_, i) => {
          const angle = (2 * Math.PI * i) / N - Math.PI / 2;
          return `${cx + R * lvl * Math.cos(angle)},${cy + R * lvl * Math.sin(angle)}`;
        }).join(' ');
        return (
          <polygon key={lvl} points={pts}
            fill="none" stroke="var(--dim)"
            strokeWidth="1" strokeDasharray="3,4" opacity="0.6"
          />
        );
      })}

      {/* Axis lines */}
      {ZONES.map((z, i) => {
        const angle = (2 * Math.PI * i) / N - Math.PI / 2;
        return (
          <line key={z.id}
            x1={cx} y1={cy}
            x2={cx + R * Math.cos(angle)} y2={cy + R * Math.sin(angle)}
            stroke="var(--dim)" strokeWidth="1" opacity="0.5"
          />
        );
      })}

      {/* Data polygon */}
      <motion.polygon
        key={period}
        points={polygon}
        fill="rgba(0,245,255,0.08)"
        stroke="var(--cyan)"
        strokeWidth="1.5"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Zone dots + labels */}
      {ZONES.map((z, i) => {
        const dp    = dataPoints[i];
        const lp    = getLabelPoint(i);
        const val   = getVal(z.id);
        const state = getZoneState(val);
        const dotColor = state === 'colonized' ? z.color : state === 'discovered' ? `${z.color}80` : 'var(--muted)';

        return (
          <g key={z.id} style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered(z.id)}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setHovered(h => h === z.id ? null : z.id)}
          >
            <circle cx={dp.x} cy={dp.y} r={hovered === z.id ? 7 : 4}
              fill={dotColor}
              style={{ filter: hovered === z.id ? `drop-shadow(0 0 6px ${z.color})` : 'none', transition: 'r 150ms' }}
            />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
              fill={hovered === z.id ? z.color : 'var(--muted)'}
              fontSize={hovered === z.id ? '10' : '9'}
              fontFamily="'Press Start 2P', monospace"
              style={{ transition: 'fill 150ms, font-size 150ms' }}
            >
              {z.emoji}
            </text>

            {/* Tooltip on hover */}
            {hovered === z.id && (
              <g>
                <rect x={lp.x - 36} y={lp.y + 10} width="72" height="28" rx="0"
                  fill="var(--bg2)" stroke={z.color} strokeWidth="1"
                />
                <text x={lp.x} y={lp.y + 22} textAnchor="middle"
                  fill={z.color} fontSize="7" fontFamily="'Press Start 2P', monospace">
                  {val} PTS
                </text>
                <text x={lp.x} y={lp.y + 33} textAnchor="middle"
                  fill="var(--muted)" fontSize="6" fontFamily="'Press Start 2P', monospace">
                  {getZoneLabel(state)}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Center label */}
      <text x={cx} y={cy - 4} textAnchor="middle"
        fill="var(--cyan)" fontSize="8" fontFamily="'Press Start 2P', monospace" opacity="0.5">
        ZONAS
      </text>
    </svg>
  );
}

/* ── Stacked bar chart 7 días ─────────────────────────────────────────────── */
function StackedBarChart({ dailyZoneScores, last7 }) {
  const W = 358, H = 90;
  const barW = 36, gap = 14;
  const totalW = last7.length * (barW + gap) - gap;
  const offsetX = (W - totalW) / 2;

  const maxDay = Math.max(...last7.map(d => {
    const ds = dailyZoneScores[d.date] || {};
    return Object.values(ds).reduce((a, b) => a + b, 0);
  }), 1);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 30}`} overflow="visible">
      {last7.map((d, i) => {
        const ds      = dailyZoneScores[d.date] || {};
        const total   = Object.values(ds).reduce((a, b) => a + b, 0);
        const x       = offsetX + i * (barW + gap);
        const isToday = i === last7.length - 1;
        let yOffset   = H;

        return (
          <g key={d.date}>
            {/* Background */}
            <rect x={x} y={0} width={barW} height={H} fill="var(--dim)" opacity="0.3" />
            {/* Stacked segments */}
            {ZONES.map(z => {
              const pts  = ds[z.id] || 0;
              if (!pts) return null;
              const barH = (pts / maxDay) * H;
              yOffset -= barH;
              return (
                <rect key={z.id} x={x} y={yOffset} width={barW} height={barH}
                  fill={z.color} opacity="0.85"
                />
              );
            })}
            {/* Total label */}
            {total > 0 && (
              <text x={x + barW / 2} y={H - (total / maxDay) * H - 4}
                textAnchor="middle" fill={isToday ? 'var(--cyan)' : 'var(--text)'}
                fontSize="8" fontFamily="Orbitron, monospace" fontWeight="700"
              >{total}</text>
            )}
            {/* Day label */}
            <text x={x + barW / 2} y={H + 16}
              textAnchor="middle" fill={isToday ? 'var(--cyan)' : 'var(--muted)'}
              fontSize="7" fontFamily="'Press Start 2P', monospace"
            >{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Planet in star map ───────────────────────────────────────────────────── */
function Planet({ zone, pts, onClick }) {
  const state = getZoneState(pts);
  const color = zone.color;

  return (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
      <motion.div
        whileTap={{ scale: 0.88 }}
        style={{
          width: '48px', height: '48px',
          borderRadius: '0',
          clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
          background: state === 'unexplored'
            ? 'var(--dim)'
            : state === 'discovered'
            ? `linear-gradient(135deg, ${color}50, ${color}20)`
            : `linear-gradient(135deg, ${color}, ${color}80)`,
          border: `2px solid ${state === 'unexplored' ? 'var(--muted)' : color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
          filter: state === 'colonized' ? `drop-shadow(0 0 8px ${color})` : 'none',
          opacity: state === 'unexplored' ? 0.4 : 1,
          position: 'relative',
        }}
      >
        {state === 'unexplored' ? '?' : zone.emoji}
        {/* Orbit dot for colonized */}
        {state === 'colonized' && (
          <div style={{
            position: 'absolute', width: '6px', height: '6px',
            background: color, borderRadius: '0',
            clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
            animation: 'orbit 3s linear infinite',
          }} />
        )}
      </motion.div>
      <div style={{
        fontFamily: 'var(--font-ui)', fontSize: '6px',
        color: state === 'unexplored' ? 'var(--muted)' : color,
        textAlign: 'center', maxWidth: '52px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {state === 'unexplored' ? '???' : zone.short}
      </div>
      {state !== 'unexplored' && (
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>
          {pts}pts
        </div>
      )}
    </div>
  );
}

/* ── Planet detail modal ──────────────────────────────────────────────────── */
function PlanetModal({ zone, pts, onClose }) {
  const state = getZoneState(pts);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,15,0.88)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 250 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg2)',
            clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
            border: `2px solid ${zone.color}`,
            padding: '24px', textAlign: 'center',
            width: '100%', maxWidth: '320px',
            boxShadow: `0 0 32px ${zone.color}30`,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>{state === 'unexplored' ? '🌑' : zone.emoji}</div>
          <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '14px', color: zone.color, marginBottom: '4px' }}>
            {state === 'unexplored' ? '???' : zone.name}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '12px' }}>
            {getZoneLabel(state)} — {pts} PTS
          </div>

          {state === 'colonized' && zone.reflection && (
            <>
              <div style={{ width: '40px', height: '1px', background: zone.color, margin: '0 auto 12px', opacity: 0.4 }} />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text)', lineHeight: 1.7, fontStyle: 'italic' }}>
                "{zone.reflection}"
              </div>
            </>
          )}

          {state === 'discovered' && (
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', lineHeight: 2 }}>
              NECESITAS {50 - pts} PTS MÁS<br />PARA COLONIZAR ESTA ZONA
            </div>
          )}

          {state === 'unexplored' && (
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', lineHeight: 2 }}>
              COMPLETA MISIONES DE<br />CUALQUIER ZONA PARA DESCUBRIR
            </div>
          )}

          <motion.button whileTap={{ scale: 0.94 }} onClick={onClose}
            style={{
              marginTop: '16px', background: zone.color, border: 'none', color: 'var(--bg)',
              fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '8px 20px',
              clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
              cursor: 'pointer',
            }}
          >CERRAR</motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Dashboard() {
  const { totalScore, dailyScores, dailyZoneScores, zoneScores, earnedBadges, totalCompleted, totalPomos, perfectDays, playerName, dayStreak, maxStreak } = useGameStore();
  const [radarPeriod, setRadarPeriod] = useState('total');
  const [selectedZone, setSelectedZone] = useState(null);

  const lvl    = getLevelInfo(totalScore);
  const last7  = getLast7Days().map((date, i) => ({
    date, score: dailyScores[date] || 0,
    label: i === 6 ? 'HOY' : formatWeekDay(date).slice(0, 3),
  }));

  const earnedDefs   = BADGE_DEFS.filter(b => earnedBadges.includes(b.id));
  const unearnedDefs = BADGE_DEFS.filter(b => !earnedBadges.includes(b.id));

  const favZone = Object.entries(zoneScores || {}).sort((a, b) => b[1] - a[1])[0];
  const favZoneData = favZone ? ZONES.find(z => z.id === favZone[0]) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <header style={{ padding: '16px', borderBottom: '1px solid var(--dim)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', letterSpacing: '2px', marginBottom: '4px' }}>
          PANEL DE PILOTO
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '16px', color: 'var(--cyan)' }}>
            COMANDANTE {playerName}
          </div>
          <motion.div
            key={totalScore}
            initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '20px', color: 'var(--cyan)', animation: 'breathe-glow 2s ease-in-out infinite' }}
          >
            {totalScore.toLocaleString()}
          </motion.div>
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--gold)', marginTop: '2px' }}>
          NIV {lvl.level} — {lvl.name}
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Radar chart */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '14px', border: '1px solid var(--dim)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>RADAR DE ZONAS</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[['total', 'TOTAL'], ['week', 'SEMANA']].map(([k, l]) => (
                <button key={k} onClick={() => { setRadarPeriod(k); SFX.click(); }}
                  style={{
                    background: radarPeriod === k ? 'var(--cyan)' : 'var(--dim)',
                    border: 'none', color: radarPeriod === k ? 'var(--bg)' : 'var(--muted)',
                    fontFamily: 'var(--font-ui)', fontSize: '6px', padding: '4px 8px',
                    clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                    cursor: 'pointer',
                  }}
                >{l}</button>
              ))}
            </div>
          </div>
          <RadarChart zoneScores={zoneScores || {}} period={radarPeriod} dailyZoneScores={dailyZoneScores || {}} last7={last7.map(d => d.date)} />
        </div>

        {/* Stacked bar chart */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '14px', border: '1px solid var(--dim)',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '10px' }}>
            PUNTOS POR ZONA — 7 DÍAS
          </div>
          <StackedBarChart dailyZoneScores={dailyZoneScores || {}} last7={last7} />
          {/* Zone legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {ZONES.map(z => (
              <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <div style={{ width: '8px', height: '8px', background: z.color, clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)' }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>{z.short}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Star map planets */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '14px', border: '1px solid var(--dim)',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '12px' }}>MAPA ESTELAR</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', justifyItems: 'center' }}>
            {ZONES.map(z => (
              <Planet key={z.id} zone={z} pts={zoneScores?.[z.id] || 0}
                onClick={() => { setSelectedZone(z); SFX.click(); }}
              />
            ))}
          </div>
        </div>

        {/* Records */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '14px', border: '1px solid var(--dim)',
          display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', gridColumn: '1/-1' }}>RÉCORDS</div>
          {[
            { label: 'MEJOR RACHA', value: `${maxStreak}d`, color: 'var(--pink)' },
            { label: 'MISIONES',    value: totalCompleted, color: 'var(--green)' },
            { label: 'POMODOROS',   value: totalPomos,     color: 'var(--cyan)'  },
            { label: 'DÍAS PERF.',  value: perfectDays,    color: 'var(--gold)'  },
            { label: 'ZONA FAVE',   value: favZoneData ? favZoneData.emoji : '—', color: favZoneData?.color || 'var(--muted)' },
            { label: 'LOGROS',      value: `${earnedBadges.length}/${BADGE_DEFS.length}`, color: 'var(--purple)' },
          ].map(r => (
            <div key={r.label} style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '18px', color: r.color }}>{r.value}</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)', marginTop: '3px' }}>{r.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--gold)', marginBottom: '10px', letterSpacing: '2px' }}>
            ★ LOGROS ({earnedDefs.length}/{BADGE_DEFS.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
            {[...earnedDefs, ...unearnedDefs].map(b => {
              const earned = earnedBadges.includes(b.id);
              return (
                <div key={b.id} style={{
                  background: 'var(--bg2)',
                  clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                  padding: '10px',
                  border: `1px solid ${earned ? 'var(--gold)' : 'var(--dim)'}`,
                  boxShadow: earned ? '0 0 10px rgba(255,190,11,0.2)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  opacity: earned ? 1 : 0.45,
                }}>
                  <span style={{ fontSize: '18px', filter: earned ? 'none' : 'grayscale(100%)' }}>{b.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: earned ? 'var(--gold)' : 'var(--muted)' }}>{b.name}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted)', marginTop: '2px' }}>{b.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: '80px' }} />
      </div>

      {/* Planet modal */}
      {selectedZone && (
        <PlanetModal
          zone={selectedZone}
          pts={zoneScores?.[selectedZone.id] || 0}
          onClose={() => setSelectedZone(null)}
        />
      )}
    </div>
  );
}
