import { useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import MissionCard from '../components/MissionCard';
import { formatDateLabel, todayKey } from '../utils/dates';

export default function Home({ particleRef }) {
  const {
    missions, pendingMissions, getDailyProgress,
    getPriorityMission, dayStreak,
  } = useGameStore();

  const progress    = getDailyProgress();
  const priority    = getPriorityMission();
  const today       = todayKey();
  const todayLabel  = formatDateLabel(today);

  const pending  = missions.filter(m => !m.completedToday && !m.overdue);
  const done     = missions.filter(m => m.completedToday);
  const overdue  = pendingMissions.filter(m => !m.completedToday);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{
        padding: '16px 16px 8px',
        flexShrink: 0,
        borderBottom: '1px solid var(--dim)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '22px', color: 'var(--cyan)', letterSpacing: '3px' }}>
              SH8DONE
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginTop: '2px' }}>
              {todayLabel}
            </div>
          </div>

          {/* Streak pill */}
          {dayStreak > 0 && (
            <div
              className="streak-pulse"
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--pink)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '6px 12px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <span style={{ fontSize: '14px' }}>🔥</span>
              <div>
                <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '16px', color: 'var(--pink)', lineHeight: 1 }}>
                  {dayStreak}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>RACHA</div>
              </div>
            </div>
          )}
        </div>

        {/* Daily progress bar */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>
              {progress.done}/{progress.total} MISIONES
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--cyan)' }}>
              {progress.pts} PTS HOY
            </span>
          </div>
          <div style={{
            height: '8px',
            background: 'var(--dim)',
            clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
          }}>
            <div style={{
              height: '100%',
              width: `${progress.pct}%`,
              background: progress.pct >= 100 ? 'var(--green)' : 'var(--cyan)',
              transition: 'width 600ms cubic-bezier(.34,1.56,.64,1)',
              boxShadow: progress.pct >= 100 ? '0 0 8px var(--green)' : '0 0 8px var(--cyan)',
            }} />
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Priority mission */}
        {priority && (
          <section>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--gold)', marginBottom: '8px', letterSpacing: '2px' }}>
              ★ MISIÓN PRIORITARIA
            </div>
            <MissionCard mission={priority} highlighted={true} particleRef={particleRef} />
          </section>
        )}

        {/* Empty state */}
        {pending.length === 0 && done.length === 0 && overdue.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌌</div>
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '14px', color: 'var(--cyan)', marginBottom: '8px' }}>
              MISIÓN DE INICIO
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted)' }}>
              Crea tu primera misión en la pestaña MISIONES
            </div>
          </div>
        )}

        {/* All done celebration */}
        {pending.length === 0 && done.length > 0 && overdue.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '20px',
            background: 'var(--bg2)',
            clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
            border: '1px solid var(--green)',
            boxShadow: '0 0 20px var(--green)40',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '16px', color: 'var(--green)' }}>
              ¡DÍA PERFECTO!
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginTop: '4px' }}>
              TODAS LAS MISIONES COMPLETADAS
            </div>
          </div>
        )}

        {/* Pending missions (excluding priority) */}
        {pending.filter(m => m.id !== priority?.id).length > 0 && (
          <section>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '1px' }}>
              PENDIENTES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pending
                .filter(m => m.id !== priority?.id)
                .map(m => <MissionCard key={m.id} mission={m} particleRef={particleRef} />)
              }
            </div>
          </section>
        )}

        {/* Overdue missions */}
        {overdue.length > 0 && (
          <section>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--pink)', marginBottom: '8px', letterSpacing: '1px' }}>
              ⚠ PENDIENTES DE DÍAS ANTERIORES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {overdue.map(m => <MissionCard key={m.id} mission={m} particleRef={particleRef} />)}
            </div>
          </section>
        )}

        {/* Completed */}
        {done.length > 0 && (
          <section>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '1px' }}>
              COMPLETADAS ({done.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {done.map(m => <MissionCard key={m.id} mission={m} particleRef={particleRef} />)}
            </div>
          </section>
        )}

        {/* Bottom padding for nav + pomodoro bar */}
        <div style={{ height: '120px' }} />
      </div>
    </div>
  );
}
