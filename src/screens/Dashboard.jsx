import { useGameStore } from '../store/useGameStore';
import { getLast7Days, formatWeekDay } from '../utils/dates';
import { BADGE_DEFS } from '../utils/badges';
import PlayerCard from '../components/PlayerCard';

/* SVG bar chart — no external library */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.score), 1);
  const W = 358, H = 100;
  const barW = 36, gap = 14;
  const totalW = data.length * (barW + gap) - gap;
  const offsetX = (W - totalW) / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 30}`} style={{ overflow: 'visible' }}>
      {data.map((d, i) => {
        const barH = Math.max((d.score / max) * H, d.score > 0 ? 4 : 2);
        const x = offsetX + i * (barW + gap);
        const y = H - barH;
        const isToday = i === data.length - 1;
        const color = isToday ? 'var(--cyan)' : d.score > 0 ? 'var(--purple)' : 'var(--dim)';

        return (
          <g key={d.date}>
            {/* Bar background */}
            <rect x={x} y={0} width={barW} height={H} fill="var(--dim)" opacity="0.3" />
            {/* Bar fill */}
            <rect x={x} y={y} width={barW} height={barH} fill={color}
              style={{ filter: isToday ? 'drop-shadow(0 0 6px var(--cyan))' : 'none' }}
            />
            {/* Score label */}
            {d.score > 0 && (
              <text
                x={x + barW / 2} y={y - 4}
                textAnchor="middle"
                fill={color}
                fontSize="9"
                fontFamily="Orbitron, monospace"
                fontWeight="700"
              >
                {d.score}
              </text>
            )}
            {/* Day label */}
            <text
              x={x + barW / 2} y={H + 16}
              textAnchor="middle"
              fill={isToday ? 'var(--cyan)' : 'var(--muted)'}
              fontSize="8"
              fontFamily="'Press Start 2P', monospace"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* Star map by rubro */
function StarMap({ rubrosUsed }) {
  const zones = [
    { id: 'creativo',     name: 'NEBULOSA CREATIVA',    x: 80,  y: 60,  r: 30, color: 'var(--rubro-creativo)'     },
    { id: 'conocimiento', name: 'SECTOR CONOCIMIENTO',  x: 200, y: 40,  r: 25, color: 'var(--rubro-conocimiento)' },
    { id: 'fisico',       name: 'PLANETA FÍSICO',       x: 300, y: 80,  r: 28, color: 'var(--rubro-fisico)'       },
    { id: 'rutina',       name: 'ESTACIÓN RUTINA',      x: 140, y: 120, r: 22, color: 'var(--rubro-rutina)'       },
    { id: 'social',       name: 'COLONIA SOCIAL',       x: 260, y: 130, r: 26, color: 'var(--rubro-social)'       },
  ];

  return (
    <svg width="100%" viewBox="0 0 370 170" style={{ overflow: 'visible' }}>
      {/* Connection lines */}
      {zones.filter(z => rubrosUsed.includes(z.id)).map((z, i) => {
        const others = zones.filter(o => rubrosUsed.includes(o.id) && o.id !== z.id);
        return others.map(o => (
          <line
            key={`${z.id}-${o.id}`}
            x1={z.x} y1={z.y} x2={o.x} y2={o.y}
            stroke={z.color} strokeWidth="1" opacity="0.2"
          />
        ));
      })}

      {zones.map(z => {
        const unlocked = rubrosUsed.includes(z.id);
        return (
          <g key={z.id}>
            <circle
              cx={z.x} cy={z.y} r={z.r}
              fill={unlocked ? `${z.color}30` : 'var(--bg2)'}
              stroke={unlocked ? z.color : 'var(--muted)'}
              strokeWidth={unlocked ? 2 : 1}
              style={{ filter: unlocked ? `drop-shadow(0 0 8px ${z.color})` : 'none' }}
            />
            <text
              x={z.x} y={z.y + 4}
              textAnchor="middle"
              fill={unlocked ? z.color : 'var(--muted)'}
              fontSize="7"
              fontFamily="'Press Start 2P', monospace"
            >
              {unlocked ? '★' : '?'}
            </text>
            <text
              x={z.x} y={z.y + z.r + 12}
              textAnchor="middle"
              fill={unlocked ? z.color : 'var(--muted)'}
              fontSize="6"
              fontFamily="'Press Start 2P', monospace"
            >
              {unlocked ? z.name.split(' ')[0] : '???'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Dashboard() {
  const { dailyScores, earnedBadges, rubrosUsed, totalCompleted, totalPomos, perfectDays } = useGameStore();

  const last7 = getLast7Days().map((date, i) => ({
    date,
    score: dailyScores[date] || 0,
    label: i === 6 ? 'HOY' : formatWeekDay(date).slice(0, 3),
  }));

  const earnedDefs = BADGE_DEFS.filter(b => earnedBadges.includes(b.id));
  const unearnedDefs = BADGE_DEFS.filter(b => !earnedBadges.includes(b.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <header style={{ padding: '16px', borderBottom: '1px solid var(--dim)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '18px', color: 'var(--cyan)', letterSpacing: '3px' }}>
          MAPA ESTELAR
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Player card */}
        <PlayerCard />

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { label: 'COMPLETADAS', value: totalCompleted, color: 'var(--green)' },
            { label: 'POMODOROS',   value: totalPomos,     color: 'var(--cyan)'  },
            { label: 'DÍAS PERF.',  value: perfectDays,    color: 'var(--gold)'  },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg2)',
              clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
              padding: '12px 8px', textAlign: 'center',
              border: `1px solid ${s.color}40`,
            }}>
              <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '20px', color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '16px',
          border: '1px solid var(--dim)',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '12px' }}>
            PUNTOS — ÚLTIMOS 7 DÍAS
          </div>
          <BarChart data={last7} />
        </div>

        {/* Star map */}
        <div style={{
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          padding: '16px',
          border: '1px solid var(--dim)',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '8px' }}>
            ZONAS DESBLOQUEADAS
          </div>
          <StarMap rubrosUsed={rubrosUsed} />
        </div>

        {/* Badges */}
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--gold)', marginBottom: '10px', letterSpacing: '2px' }}>
            ★ LOGROS ({earnedDefs.length}/{BADGE_DEFS.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {earnedDefs.map(b => (
              <div key={b.id} style={{
                background: 'var(--bg2)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '10px',
                border: '1px solid var(--gold)',
                boxShadow: '0 0 12px var(--gold)30',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '20px', animation: 'spin-once 400ms ease' }}>{b.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--gold)' }}>{b.name}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted)', marginTop: '2px' }}>{b.desc}</div>
                </div>
              </div>
            ))}
            {unearnedDefs.map(b => (
              <div key={b.id} style={{
                background: 'var(--bg2)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '10px',
                border: '1px solid var(--dim)',
                display: 'flex', alignItems: 'center', gap: '8px',
                opacity: 0.5,
              }}>
                <span style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>{b.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>{b.name}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted)', marginTop: '2px' }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: '80px' }} />
      </div>
    </div>
  );
}
