import { useGameStore } from '../store/useGameStore';
import { getLevelInfo } from '../utils/levels';

export default function PlayerCard({ compact = false }) {
  const { playerName, totalScore, dayStreak, shields } = useGameStore();
  const lvl = getLevelInfo(totalScore);

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="score-breathe" style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '16px', color: 'var(--cyan)' }}>
          {totalScore.toLocaleString()}
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--gold)' }}>PTS</div>
        {dayStreak > 0 && (
          <div className="streak-pulse" style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--pink)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            🔥 {dayStreak}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg2)',
        clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
        padding: '16px',
        border: '1px solid var(--dim)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '18px', color: 'var(--cyan)' }}>
            {playerName}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'var(--gold)', marginTop: '4px' }}>
            NIV {lvl.level} — {lvl.name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="score-breathe" style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '22px', color: 'var(--cyan)' }}>
            {totalScore.toLocaleString()}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>PUNTOS TOTALES</div>
        </div>
      </div>

      {/* Level progress bar */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>
            PROGRESO AL NIV {lvl.level + 1}
          </span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--cyan)' }}>
            {Math.round(lvl.progress)}%
          </span>
        </div>
        <div style={{ height: '6px', background: 'var(--dim)', clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)' }}>
          <div style={{
            height: '100%',
            width: `${lvl.progress}%`,
            background: 'var(--cyan)',
            transition: 'width 600ms cubic-bezier(.34,1.56,.64,1)',
          }} />
        </div>
      </div>

      {/* Streak & shields */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        <div className="streak-pulse" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>🔥</span>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '16px', color: 'var(--pink)' }}>
              {dayStreak}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>RACHA</div>
          </div>
        </div>
        {shields > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>🛡</span>
            <div>
              <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '16px', color: 'var(--purple)' }}>
                {shields}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>ESCUDOS</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
