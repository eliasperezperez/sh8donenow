import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import MissionCard from '../components/MissionCard';
import { RUBROS, ENERGIA } from '../utils/scoring';
import { getDayOfWeek } from '../utils/dates';

const DAYS_ES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const FILTERS = ['TODAS', 'HOY', 'PENDIENTES'];

function NewMissionForm({ onClose }) {
  const { addMission } = useGameStore();
  const [form, setForm] = useState({
    title: '', rubroId: 'creativo', energia: 'media',
    minutes: 30, recurrent: false, days: [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleDay = (d) => set('days', form.days.includes(d) ? form.days.filter(x => x !== d) : [...form.days, d]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addMission(form);
    onClose();
  };

  const rubro = RUBROS.find(r => r.id === form.rubroId) || RUBROS[0];

  return (
    <div
      style={{
        background: 'var(--bg2)',
        clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
        border: `1px solid ${rubro.color}`,
        padding: '16px',
        animation: 'slide-down 250ms cubic-bezier(.34,1.56,.64,1) forwards',
        marginBottom: '12px',
      }}
    >
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', color: 'var(--cyan)', marginBottom: '12px', letterSpacing: '2px' }}>
        + NUEVA MISIÓN
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Title */}
        <input
          type="text"
          placeholder="Nombre de la misión..."
          value={form.title}
          onChange={e => set('title', e.target.value)}
          maxLength={60}
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--dim)',
            color: 'var(--text)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            padding: '10px 12px',
            clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
            width: '100%',
            transition: 'border-color 150ms',
          }}
          autoFocus
        />

        {/* Rubro selector */}
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '6px' }}>RUBRO</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {RUBROS.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => set('rubroId', r.id)}
                style={{
                  background: form.rubroId === r.id ? r.color : 'var(--dim)',
                  border: 'none',
                  color: form.rubroId === r.id ? 'var(--bg)' : 'var(--muted)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '7px',
                  padding: '5px 10px',
                  clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                  cursor: 'pointer',
                }}
              >
                {r.emoji} {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Energía + minutes row */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '6px' }}>ENERGÍA</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {ENERGIA.map(e => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => set('energia', e.value)}
                  style={{
                    background: form.energia === e.value ? 'var(--dim)' : 'var(--bg3)',
                    border: form.energia === e.value ? '1px solid var(--cyan)' : '1px solid var(--dim)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '10px',
                    padding: '4px 6px',
                    clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                    cursor: 'pointer',
                    flex: 1,
                  }}
                >
                  {e.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '6px' }}>MINUTOS</div>
            <select
              value={form.minutes}
              onChange={e => set('minutes', Number(e.target.value))}
              style={{
                width: '100%',
                background: 'var(--bg3)',
                border: '1px solid var(--dim)',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                padding: '6px 8px',
                clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                cursor: 'pointer',
              }}
            >
              {[15, 20, 25, 30, 45, 60, 90, 120].map(m => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </select>
          </div>
        </div>

        {/* Recurrent */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div
              onClick={() => set('recurrent', !form.recurrent)}
              style={{
                width: '20px', height: '20px',
                background: form.recurrent ? 'var(--cyan)' : 'var(--dim)',
                clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--bg)',
                fontSize: '12px',
                flexShrink: 0,
              }}
            >
              {form.recurrent ? '✓' : ''}
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--text)' }}>MISIÓN RECURRENTE</span>
          </label>
        </div>

        {/* Day selector (only if recurrent) */}
        {form.recurrent && (
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '6px' }}>DÍAS</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {DAYS_ES.map((day, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  style={{
                    flex: 1,
                    background: form.days.includes(i) ? 'var(--purple)' : 'var(--dim)',
                    border: 'none',
                    color: form.days.includes(i) ? 'white' : 'var(--muted)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '6px',
                    padding: '5px 0',
                    clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                    cursor: 'pointer',
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              background: 'var(--dim)',
              border: 'none',
              color: 'var(--text)',
              fontFamily: 'var(--font-ui)',
              fontSize: '8px',
              padding: '10px',
              clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
              cursor: 'pointer',
            }}
          >
            CANCELAR
          </button>
          <button
            type="submit"
            style={{
              flex: 2,
              background: rubro.color,
              border: 'none',
              color: 'var(--bg)',
              fontFamily: 'var(--font-ui)',
              fontSize: '8px',
              padding: '10px',
              clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
              cursor: 'pointer',
              letterSpacing: '2px',
            }}
          >
            ✓ CREAR MISIÓN
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Missions({ particleRef }) {
  const { missions, pendingMissions, deleteMission } = useGameStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('TODAS');
  const [longPressId, setLongPressId] = useState(null);
  const lpTimer = { current: null };

  const todayDow = getDayOfWeek();

  const allMissions = [...missions, ...pendingMissions];

  const filtered = allMissions.filter(m => {
    if (filter === 'HOY')       return !m.recurrent || m.days?.includes(todayDow);
    if (filter === 'PENDIENTES') return !m.completedToday;
    return true;
  });

  const handleLongPressStart = (id) => {
    lpTimer.current = setTimeout(() => setLongPressId(id), 500);
  };
  const handleLongPressEnd = () => {
    clearTimeout(lpTimer.current);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{ padding: '16px', borderBottom: '1px solid var(--dim)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '18px', color: 'var(--cyan)', letterSpacing: '3px', marginBottom: '12px' }}>
          MISIONES
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'var(--cyan)' : 'var(--dim)',
                border: 'none',
                color: filter === f ? 'var(--bg)' : 'var(--muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '7px',
                padding: '6px 10px',
                clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {/* New mission button / form */}
        {showForm ? (
          <NewMissionForm onClose={() => setShowForm(false)} />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%',
              background: 'var(--bg2)',
              border: '1px dashed var(--cyan)',
              color: 'var(--cyan)',
              fontFamily: 'var(--font-ui)',
              fontSize: '8px',
              padding: '14px',
              clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
              cursor: 'pointer',
              marginBottom: '12px',
              letterSpacing: '2px',
            }}
            className="pressable"
          >
            + NUEVA MISIÓN
          </button>
        )}

        {/* Mission list */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)', fontFamily: 'var(--font-ui)', fontSize: '8px' }}>
            NO HAY MISIONES
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(m => (
            <div
              key={m.id}
              style={{ position: 'relative' }}
              onTouchStart={() => handleLongPressStart(m.id)}
              onTouchEnd={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
            >
              {longPressId === m.id && (
                <div style={{
                  position: 'absolute', top: 0, right: 0, zIndex: 20,
                  background: 'var(--pink)',
                  clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                }}>
                  <button
                    onClick={() => { deleteMission(m.id); setLongPressId(null); }}
                    style={{
                      background: 'none', border: 'none',
                      color: 'white', fontFamily: 'var(--font-ui)', fontSize: '7px',
                      padding: '6px 10px', cursor: 'pointer',
                    }}
                  >
                    🗑 ELIMINAR
                  </button>
                  <button
                    onClick={() => setLongPressId(null)}
                    style={{
                      background: 'none', border: 'none',
                      color: 'white', fontFamily: 'var(--font-ui)', fontSize: '7px',
                      padding: '6px 10px', cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
              <MissionCard mission={m} particleRef={particleRef} />
            </div>
          ))}
        </div>

        <div style={{ height: '120px' }} />
      </div>
    </div>
  );
}
