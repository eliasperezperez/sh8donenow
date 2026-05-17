import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { getLast7Days, formatWeekDay, todayKey } from '../utils/dates';
import { getLevelInfo } from '../utils/levels';
import { TRANSMISORES, TRANSMISOR_TYPES } from '../utils/transmisores';
import { ZONES, getZoneState, getZoneLabel } from '../utils/zones';
import { SFX } from '../utils/sounds';

/* ── Radar Chart SVG ── */
function RadarChart({ zoneScores, period = 'total', dailyZoneScores, last7 }) {
  const [hovered, setHovered] = useState(null);
  const cx = 150, cy = 140, R = 110;
  const N  = ZONES.length;

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
      {gridLevels.map(lvl => {
        const pts = ZONES.map((_, i) => {
          const angle = (2 * Math.PI * i) / N - Math.PI / 2;
          return `${cx + R * lvl * Math.cos(angle)},${cy + R * lvl * Math.sin(angle)}`;
        }).join(' ');
        return <polygon key={lvl} points={pts} fill="none" stroke="var(--dim)" strokeWidth="1" strokeDasharray="3,4" opacity="0.6" />;
      })}
      {ZONES.map((z, i) => {
        const angle = (2 * Math.PI * i) / N - Math.PI / 2;
        return <line key={z.id} x1={cx} y1={cy} x2={cx + R * Math.cos(angle)} y2={cy + R * Math.sin(angle)} stroke="var(--dim)" strokeWidth="1" opacity="0.5" />;
      })}
      <motion.polygon key={period} points={polygon} fill="rgba(0,245,255,0.08)" stroke="var(--cyan)" strokeWidth="1.5"
        initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {ZONES.map((z, i) => {
        const dp    = dataPoints[i];
        const lp    = getLabelPoint(i);
        const val   = getVal(z.id);
        const state = getZoneState(val);
        const dotColor = state === 'colonized' ? z.color : state === 'discovered' ? `${z.color}80` : 'var(--muted)';
        return (
          <g key={z.id} style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered(z.id)} onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setHovered(h => h === z.id ? null : z.id)}
          >
            <circle cx={dp.x} cy={dp.y} r={hovered === z.id ? 7 : 4} fill={dotColor}
              style={{ filter: hovered === z.id ? `drop-shadow(0 0 6px ${z.color})` : 'none', transition: 'r 150ms' }}
            />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
              fill={hovered === z.id ? z.color : 'var(--muted)'}
              fontSize={hovered === z.id ? '10' : '9'} fontFamily="'Press Start 2P', monospace"
              style={{ transition: 'fill 150ms' }}
            >{z.emoji}</text>
            {hovered === z.id && (
              <g>
                <rect x={lp.x - 36} y={lp.y + 10} width="72" height="28" fill="var(--bg2)" stroke={z.color} strokeWidth="1"/>
                <text x={lp.x} y={lp.y + 22} textAnchor="middle" fill={z.color} fontSize="7" fontFamily="'Press Start 2P', monospace">{val} FLX</text>
                <text x={lp.x} y={lp.y + 33} textAnchor="middle" fill="var(--muted)" fontSize="6" fontFamily="'Press Start 2P', monospace">{getZoneLabel(state)}</text>
              </g>
            )}
          </g>
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--cyan)" fontSize="8" fontFamily="'Press Start 2P', monospace" opacity="0.5">FRECUENCIAS</text>
    </svg>
  );
}

/* ── Stacked bar chart 7 días ── */
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
            <rect x={x} y={0} width={barW} height={H} fill="var(--dim)" opacity="0.3" />
            {ZONES.map(z => {
              const pts = ds[z.id] || 0;
              if (!pts) return null;
              const barH = (pts / maxDay) * H;
              yOffset -= barH;
              return <rect key={z.id} x={x} y={yOffset} width={barW} height={barH} fill={z.color} opacity="0.85" />;
            })}
            {total > 0 && (
              <text x={x + barW / 2} y={H - (total / maxDay) * H - 4}
                textAnchor="middle" fill={isToday ? 'var(--cyan)' : 'var(--text)'}
                fontSize="8" fontFamily="Orbitron, monospace" fontWeight="700"
              >{total}</text>
            )}
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

/* ── Planet en mapa estelar ── */
function Planet({ zone, pts, onClick }) {
  const state = getZoneState(pts);
  const color = zone.color;

  return (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
      <motion.div whileTap={{ scale: 0.88 }} style={{
        width: '48px', height: '48px',
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
      }}>
        {state === 'unexplored' ? '?' : zone.emoji}
        {state === 'colonized' && (
          <div style={{
            position: 'absolute', width: '6px', height: '6px',
            background: color,
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
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>{pts}flx</div>
      )}
    </div>
  );
}

/* ── Planet detail modal ── */
function PlanetModal({ zone, pts, onClose }) {
  const state = getZoneState(pts);
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,15,0.88)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      >
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 250 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg2)',
            clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
            border: `2px solid ${zone.color}`, padding: '24px', textAlign: 'center',
            width: '100%', maxWidth: '320px', boxShadow: `0 0 32px ${zone.color}30`,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>{state === 'unexplored' ? '🌑' : zone.emoji}</div>
          <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '14px', color: zone.color, marginBottom: '4px' }}>
            {state === 'unexplored' ? '???' : zone.name}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '12px' }}>
            {getZoneLabel(state)} — {pts} FLX
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
              NECESITAS {50 - pts} FLX MÁS<br />PARA COLONIZAR ESTE SECTOR
            </div>
          )}
          {state === 'unexplored' && (
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', lineHeight: 2 }}>
              COMPLETA MISIONES EN<br />ESTA FRECUENCIA
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

/* ── Transmisor SVG icono pixel art ── */
function TransmisorIcon({ id, color, size = 24 }) {
  const c = color;
  const icons = {
    primera_senal: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <rect x="7" y="0" width="2" height="6" fill={c}/>
        <rect x="4" y="3" width="2" height="2" fill={c}/>
        <rect x="10" y="3" width="2" height="2" fill={c}/>
        <rect x="2" y="5" width="2" height="2" fill={c}/>
        <rect x="12" y="5" width="2" height="2" fill={c}/>
        <rect x="6" y="8" width="4" height="4" fill={c}/>
        <rect x="7" y="12" width="2" height="4" fill={c}/>
      </svg>
    ),
    ignicion_total: (
      <svg width={size} height={size} viewBox="0 0 12 16" fill="none">
        <rect x="5" y="0" width="2" height="3" fill={c}/>
        <rect x="3" y="2" width="2" height="6" fill={c}/>
        <rect x="7" y="2" width="2" height="4" fill={c}/>
        <rect x="1" y="6" width="2" height="6" fill={c}/>
        <rect x="5" y="6" width="2" height="8" fill={c}/>
        <rect x="9" y="6" width="2" height="4" fill={c}/>
        <rect x="3" y="10" width="6" height="4" fill={c}/>
      </svg>
    ),
    equilibrista: (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <rect x="6" y="0" width="2" height="4" fill={c}/>
        <rect x="4" y="2" width="6" height="2" fill={c}/>
        <rect x="2" y="4" width="10" height="2" fill={c}/>
        <rect x="0" y="6" width="14" height="2" fill={c}/>
        <rect x="2" y="8" width="10" height="2" fill={c}/>
        <rect x="4" y="10" width="6" height="2" fill={c}/>
        <rect x="6" y="12" width="2" height="2" fill={c}/>
      </svg>
    ),
    septimo_sector: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <rect x="7" y="0" width="2" height="2" fill={c}/>
        <rect x="12" y="2" width="2" height="2" fill={c}/>
        <rect x="2" y="2" width="2" height="2" fill={c}/>
        <rect x="14" y="7" width="2" height="2" fill={c}/>
        <rect x="0" y="7" width="2" height="2" fill={c}/>
        <rect x="11" y="12" width="2" height="2" fill={c}/>
        <rect x="3" y="12" width="2" height="2" fill={c}/>
        <rect x="7" y="7" width="2" height="2" fill={c}/>
      </svg>
    ),
    sin_abismo: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <rect x="4" y="0" width="8" height="2" fill={c}/>
        <rect x="2" y="2" width="2" height="10" fill={c}/>
        <rect x="12" y="2" width="2" height="10" fill={c}/>
        <rect x="4" y="12" width="8" height="2" fill={c}/>
        <rect x="6" y="14" width="4" height="2" fill={c}/>
        <rect x="6" y="6" width="4" height="4" fill={c}/>
        <rect x="7" y="4" width="2" height="2" fill={c}/>
      </svg>
    ),
    arquitecto: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <rect x="0" y="14" width="16" height="2" fill={c}/>
        <rect x="0" y="12" width="2" height="2" fill={c}/>
        <rect x="0" y="0" width="2" height="12" fill={c}/>
        <rect x="2" y="0" width="12" height="2" fill={c}/>
        <rect x="6" y="2" width="2" height="6" fill={c}/>
        <rect x="8" y="4" width="6" height="2" fill={c}/>
        <rect x="8" y="6" width="2" height="6" fill={c}/>
      </svg>
    ),
    colono_total: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <rect x="7" y="6" width="2" height="4" fill={c}/>
        <rect x="6" y="7" width="4" height="2" fill={c}/>
        <rect x="7" y="0" width="2" height="2" fill={c}/>
        <rect x="13" y="3" width="2" height="2" fill={c}/>
        <rect x="14" y="8" width="2" height="2" fill={c}/>
        <rect x="12" y="13" width="2" height="2" fill={c}/>
        <rect x="7" y="14" width="2" height="2" fill={c}/>
        <rect x="2" y="13" width="2" height="2" fill={c}/>
        <rect x="0" y="8" width="2" height="2" fill={c}/>
        <rect x="1" y="3" width="2" height="2" fill={c}/>
      </svg>
    ),
    flux_confidencial: (
      <svg width={size} height={size} viewBox="0 0 14 18" fill="none">
        <rect x="4" y="0" width="6" height="2" fill={c}/>
        <rect x="2" y="2" width="2" height="2" fill={c}/>
        <rect x="10" y="2" width="2" height="2" fill={c}/>
        <rect x="8" y="4" width="2" height="4" fill={c}/>
        <rect x="6" y="8" width="2" height="2" fill={c}/>
        <rect x="6" y="12" width="2" height="2" fill={c}/>
        <rect x="11" y="1" width="1" height="6" fill={c} opacity="0.7"/>
        <rect x="12" y="0" width="2" height="2" fill={c} opacity="0.7"/>
      </svg>
    ),
    temporada1_2026: (
      <svg width={size} height={size} viewBox="0 0 14 18" fill="none">
        <rect x="6" y="0" width="2" height="2" fill={c}/>
        <rect x="4" y="2" width="6" height="2" fill={c}/>
        <rect x="4" y="4" width="2" height="4" fill={c}/>
        <rect x="8" y="4" width="2" height="2" fill={c}/>
        <rect x="6" y="6" width="2" height="2" fill={c}/>
        <rect x="2" y="8" width="10" height="2" fill={c}/>
        <rect x="4" y="10" width="6" height="2" fill={c}/>
        <rect x="5" y="14" width="2" height="4" fill={c}/>
        <rect x="3" y="16" width="8" height="2" fill={c}/>
      </svg>
    ),
  };

  const FreqIcon = (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="7" y="0" width="2" height="4" fill={c}/>
      <rect x="4" y="2" width="2" height="2" fill={c}/>
      <rect x="10" y="2" width="2" height="2" fill={c}/>
      <rect x="2" y="4" width="2" height="2" fill={c}/>
      <rect x="12" y="4" width="2" height="2" fill={c}/>
      <rect x="0" y="6" width="16" height="4" fill={c} opacity="0.4"/>
      <rect x="6" y="12" width="4" height="4" fill={c}/>
    </svg>
  );

  return icons[id] || FreqIcon;
}

/* ── Grid de Transmisores ── */
function TransmisoresGrid({ unlockedTransmisores }) {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--gold)', marginBottom: '10px', letterSpacing: '2px' }}>
        ★ TRANSMISORES ({unlockedTransmisores.length}/{TRANSMISORES.length})
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
        {TRANSMISORES.map(t => {
          const earned    = unlockedTransmisores.includes(t.id);
          const typeInfo  = TRANSMISOR_TYPES[t.type] || TRANSMISOR_TYPES.logro;
          const iconColor = earned ? typeInfo.color : 'var(--dim)';
          const isSecret  = t.secret && !earned;

          return (
            <motion.div
              key={t.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => earned && setSelected(t.id === selected ? null : t.id)}
              style={{
                background: 'var(--bg2)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '10px',
                border: `1px solid ${earned ? typeInfo.color : 'var(--dim)'}`,
                boxShadow: earned && t.type === 'temporada' ? `0 0 12px ${typeInfo.color}40` : earned ? `0 0 6px ${typeInfo.color}20` : 'none',
                display: 'flex', alignItems: 'center', gap: '8px',
                opacity: earned ? 1 : 0.4,
                cursor: earned ? 'pointer' : 'default',
                transition: 'opacity 0.3s, border-color 0.3s',
              }}
            >
              <div style={{ filter: isSecret ? 'blur(4px)' : 'none', transition: 'filter 0.3s', flexShrink: 0 }}>
                <TransmisorIcon id={t.id} color={iconColor} size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: earned ? typeInfo.color : 'var(--muted)', marginBottom: '2px' }}>
                  {typeInfo.label}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: earned ? 'var(--text)' : 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isSecret ? '???' : t.name}
                </div>
                {earned && selected === t.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted)', marginTop: '3px', lineHeight: 1.5 }}>
                    {t.desc}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Dashboard principal ── */
export default function Dashboard() {
  const {
    totalScore, fluxo, dailyScores, dailyZoneScores, zoneScores,
    unlockedTransmisores, earnedBadges,
    totalCompleted, totalPomos, perfectDays, playerName, dayStreak, maxStreak,
  } = useGameStore();

  const [radarPeriod, setRadarPeriod] = useState('total');
  const [selectedZone, setSelectedZone] = useState(null);

  const scoreToUse = fluxo || totalScore || 0;
  const lvl  = getLevelInfo(scoreToUse);
  const last7 = getLast7Days().map((date, i) => ({
    date, score: dailyScores[date] || 0,
    label: i === 6 ? 'HOY' : formatWeekDay(date).slice(0, 3),
  }));

  const unlocked = unlockedTransmisores || earnedBadges || [];
  const favZone  = Object.entries(zoneScores || {}).sort((a, b) => b[1] - a[1])[0];
  const favZoneData = favZone ? ZONES.find(z => z.id === favZone[0]) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <header style={{ padding: '16px', borderBottom: '1px solid var(--dim)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', letterSpacing: '2px', marginBottom: '4px' }}>
          CABINA DE MANDO
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '16px', color: lvl.color || 'var(--cyan)' }}>
            {playerName}
          </div>
          <motion.div key={scoreToUse} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '20px', color: 'var(--pink)', animation: 'breathe-glow 2s ease-in-out infinite' }}
          >
            {scoreToUse.toLocaleString()} FLX
          </motion.div>
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: lvl.color || 'var(--gold)', marginTop: '2px' }}>
          {lvl.name}
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Radar de frecuencias */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '14px', border: '1px solid var(--dim)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>RADAR DE FRECUENCIAS</div>
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

        {/* Gráfico de barras 7 días */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '14px', border: '1px solid var(--dim)',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '10px' }}>
            FLUXO POR FRECUENCIA — 7 DÍAS
          </div>
          <StackedBarChart dailyZoneScores={dailyZoneScores || {}} last7={last7} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {ZONES.map(z => (
              <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <div style={{ width: '8px', height: '8px', background: z.color, clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)' }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>{z.short}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mapa estelar de sectores */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '14px', border: '1px solid var(--dim)',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '12px' }}>MAPA DE SECTORES</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', justifyItems: 'center' }}>
            {ZONES.map(z => (
              <Planet key={z.id} zone={z} pts={zoneScores?.[z.id] || 0}
                onClick={() => { setSelectedZone(z); SFX.click(); }}
              />
            ))}
          </div>
        </div>

        {/* Récords */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '14px', border: '1px solid var(--dim)',
          display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', gridColumn: '1/-1' }}>RÉCORDS</div>
          {[
            { label: 'RACHA DE SEÑAL', value: `${maxStreak}d`,     color: 'var(--pink)'   },
            { label: 'SEÑALES',        value: totalCompleted,       color: 'var(--green)'  },
            { label: 'POMODOROS',      value: totalPomos,           color: 'var(--cyan)'   },
            { label: 'DÍAS PERF.',     value: perfectDays,          color: 'var(--gold)'   },
            { label: 'FRECUENCIA FAV', value: favZoneData?.emoji || '—', color: favZoneData?.color || 'var(--muted)' },
            { label: 'TRANSMISORES',   value: `${unlocked.length}/${TRANSMISORES.length}`, color: 'var(--purple)' },
          ].map(r => (
            <div key={r.label} style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '18px', color: r.color }}>{r.value}</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)', marginTop: '3px' }}>{r.label}</div>
            </div>
          ))}
        </div>

        {/* Transmisores */}
        <TransmisoresGrid unlockedTransmisores={unlocked} />

        <div style={{ height: '80px' }} />
      </div>

      {selectedZone && (
        <PlanetModal zone={selectedZone} pts={zoneScores?.[selectedZone.id] || 0} onClose={() => setSelectedZone(null)} />
      )}
    </div>
  );
}
