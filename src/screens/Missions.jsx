import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import MissionCard from '../components/MissionCard';
import { ZONES, ENERGIA, migrateZone } from '../utils/zones';
import { getDayOfWeek } from '../utils/dates';
import { SFX } from '../utils/sounds';

const DAYS_ES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const FILTERS  = ['TODAS', 'HOY', 'PENDIENTES'];

/* ── Typewriter title ── */
function TypewriterText({ text, speed = 40 }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const t = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return <span>{displayed}<span style={{ animation: 'breathe-scale 0.8s ease-in-out infinite', display: 'inline-block', color: 'var(--cyan)' }}>_</span></span>;
}

/* ── New Mission Hologram Panel ── */
function HologramPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '', zoneId: 'mision', energia: 'media', minutes: 30, recurrent: false, days: [],
  });
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setScanning(false), 500);
    return () => clearTimeout(t);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleDay = (d) => set('days', form.days.includes(d) ? form.days.filter(x => x !== d) : [...form.days, d]);

  const zone = ZONES.find(z => z.id === form.zoneId) || ZONES[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    SFX.addMission();
    onSubmit(form);
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.3 + i * 0.06, duration: 0.2 } }),
  };

  const inputStyle = {
    background: 'var(--bg3)', border: '1px solid var(--dim)', color: 'var(--text)',
    fontFamily: 'var(--font-body)', fontSize: '13px', padding: '10px 12px',
    clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
    width: '100%', transition: 'border-color 150ms',
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,245,255,0.03)', zIndex: 49, backdropFilter: 'blur(2px)' }}
      />

      {/* Panel */}
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--bg2)',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% 100%,0% 100%,0% 8px)',
          border: `1px solid ${zone.color}`,
          borderBottom: 'none',
          padding: '20px 16px',
          zIndex: 50,
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: `0 -8px 40px ${zone.color}20`,
        }}
      >
        {/* Scan line — once on open */}
        {scanning && (
          <div aria-hidden="true" style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: '2px',
            background: `linear-gradient(90deg, transparent, var(--cyan), transparent)`,
            animation: 'scan-line 500ms ease-out forwards',
            pointerEvents: 'none', zIndex: 10,
          }} />
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Title */}
          <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', color: 'var(--cyan)', marginBottom: '6px', letterSpacing: '3px' }}>
              <TypewriterText text="+ NUEVA MISIÓN" speed={40} />
            </div>
            <input
              type="text"
              placeholder="Nombre de la misión..."
              value={form.title}
              onChange={e => set('title', e.target.value)}
              maxLength={60}
              style={inputStyle}
              autoFocus
            />
          </motion.div>

          {/* Zone selector */}
          <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '6px' }}>ZONA</div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {ZONES.map(z => (
                <motion.button
                  key={z.id} type="button" whileTap={{ scale: 0.9 }}
                  onClick={() => { set('zoneId', z.id); SFX.click(); }}
                  style={{
                    background: form.zoneId === z.id ? z.color : 'var(--dim)',
                    border: 'none', color: form.zoneId === z.id ? 'var(--bg)' : 'var(--muted)',
                    fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '5px 8px',
                    clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                    cursor: 'pointer', transition: 'background 150ms, color 150ms',
                  }}
                >{z.emoji} {z.short}</motion.button>
              ))}
            </div>
          </motion.div>

          {/* Energía + minutos */}
          <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible"
            style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '6px' }}>ENERGÍA</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {ENERGIA.map(e => (
                  <button key={e.id} type="button"
                    onClick={() => set('energia', e.value)}
                    style={{
                      background: form.energia === e.value ? 'var(--bg3)' : 'transparent',
                      border: form.energia === e.value ? `1px solid ${zone.color}` : '1px solid var(--dim)',
                      color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '10px',
                      padding: '4px 0', clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                      cursor: 'pointer', flex: 1, transition: 'border-color 150ms',
                    }}
                  >{e.label.split(' ')[0]}</button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '6px' }}>MINUTOS</div>
              <select value={form.minutes} onChange={e => set('minutes', Number(e.target.value))}
                style={{ ...inputStyle, padding: '6px 8px', cursor: 'pointer' }}>
                {[15, 20, 25, 30, 45, 60, 90, 120].map(m => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Recurrente */}
          <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div onClick={() => set('recurrent', !form.recurrent)} style={{
                width: '20px', height: '20px',
                background: form.recurrent ? zone.color : 'var(--dim)',
                clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--bg)', fontSize: '12px', flexShrink: 0, transition: 'background 150ms',
              }}>
                {form.recurrent ? '✓' : ''}
              </div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--text)' }}>MISIÓN RECURRENTE</span>
            </label>
          </motion.div>

          {/* Días (solo si recurrente) */}
          <AnimatePresence>
            {form.recurrent && (
              <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible" exit={{ opacity: 0, height: 0 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '6px' }}>DÍAS</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {DAYS_ES.map((day, i) => (
                    <button key={i} type="button" onClick={() => toggleDay(i)}
                      style={{
                        flex: 1, background: form.days.includes(i) ? zone.color : 'var(--dim)',
                        border: 'none', color: form.days.includes(i) ? 'var(--bg)' : 'var(--muted)',
                        fontFamily: 'var(--font-ui)', fontSize: '6px', padding: '5px 0',
                        clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                        cursor: 'pointer', transition: 'background 150ms',
                      }}
                    >{day}</button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botones */}
          <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible"
            style={{ display: 'flex', gap: '8px', marginTop: '4px', paddingBottom: `calc(var(--safe-bottom) + 8px)` }}>
            <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={onClose}
              style={{
                flex: 1, background: 'var(--dim)', border: 'none', color: 'var(--text)',
                fontFamily: 'var(--font-ui)', fontSize: '8px', padding: '12px',
                clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                cursor: 'pointer',
              }}
            >CANCELAR</motion.button>
            <motion.button type="submit" whileTap={{ scale: 0.94 }}
              style={{
                flex: 2, background: zone.color, border: 'none', color: 'var(--bg)',
                fontFamily: 'var(--font-ui)', fontSize: '8px', padding: '12px',
                clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                cursor: 'pointer', letterSpacing: '2px',
              }}
            >✓ CREAR MISIÓN</motion.button>
          </motion.div>
        </form>
      </motion.div>
    </>
  );
}

/* ── Empty State ── */
function EmptyState({ onAdd }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: '16px' }}>
      <div className="ship-float" style={{ fontSize: '64px', filter: 'drop-shadow(0 0 16px var(--cyan))' }}>🚀</div>
      <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '13px', color: 'var(--cyan)', textAlign: 'center', letterSpacing: '1px' }}>
        SIN MISIONES
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', textAlign: 'center', lineHeight: 2, letterSpacing: '1px' }}>
        PROGRAMA TU PRIMERA ORDEN,<br />PILOTO.
      </div>
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={onAdd}
        style={{
          background: 'var(--cyan)', border: 'none', color: 'var(--bg)',
          fontFamily: 'var(--font-ui)', fontSize: '8px', padding: '12px 28px',
          clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
          cursor: 'pointer', letterSpacing: '2px', boxShadow: '0 0 24px var(--cyan)40',
        }}
      >+ NUEVA MISIÓN</motion.button>
    </div>
  );
}

export default function Missions({ particleRef }) {
  const { missions, pendingMissions, deleteMission, addMission } = useGameStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState('TODAS');
  const [longPressId, setLongPressId] = useState(null);
  const lpTimer = useRef(null);
  const todayDow = getDayOfWeek();

  const allMissions = [...missions, ...pendingMissions];

  const filtered = allMissions.filter(m => {
    if (filter === 'HOY')        return !m.recurrent || (m.days || []).includes(todayDow);
    if (filter === 'PENDIENTES') return !m.completedToday;
    return true;
  });

  const openForm  = () => { SFX.openForm(); setShowForm(true); };
  const closeForm = () => { SFX.close();    setShowForm(false); };

  const handleAddMission = (data) => {
    addMission(data);
    setShowForm(false);
  };

  const startLongPress = (id) => { lpTimer.current = setTimeout(() => setLongPressId(id), 500); };
  const endLongPress   = ()    => clearTimeout(lpTimer.current);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <header style={{ padding: '16px', borderBottom: '1px solid var(--dim)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '18px', color: 'var(--cyan)', letterSpacing: '3px', marginBottom: '12px' }}>
          MISIONES
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {FILTERS.map(f => (
            <motion.button key={f} whileTap={{ scale: 0.92 }} onClick={() => { setFilter(f); SFX.click(); }}
              style={{
                background: filter === f ? 'var(--cyan)' : 'var(--dim)',
                border: 'none', color: filter === f ? 'var(--bg)' : 'var(--muted)',
                fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '6px 10px',
                clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                cursor: 'pointer',
              }}
            >{f}</motion.button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 && !showForm
          ? <EmptyState onAdd={openForm} />
          : filtered.map(m => (
            <div key={m.id} style={{ position: 'relative' }}
              onTouchStart={() => startLongPress(m.id)} onTouchEnd={endLongPress}
              onMouseLeave={endLongPress}
            >
              {longPressId === m.id && (
                <div style={{
                  position: 'absolute', top: 0, right: 0, zIndex: 20,
                  display: 'flex', gap: '2px',
                }}>
                  <button onClick={() => { deleteMission(m.id); setLongPressId(null); SFX.close(); }}
                    style={{
                      background: 'var(--pink)', border: 'none', color: 'white',
                      fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '6px 10px', cursor: 'pointer',
                      clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                    }}>🗑 ELIMINAR</button>
                  <button onClick={() => setLongPressId(null)}
                    style={{
                      background: 'var(--dim)', border: 'none', color: 'var(--text)',
                      fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '6px 8px', cursor: 'pointer',
                      clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                    }}>✕</button>
                </div>
              )}
              <MissionCard mission={m} particleRef={particleRef} />
            </div>
          ))
        }
        <div style={{ height: '100px' }} />
      </div>

      {/* FAB — flotante bottom-right */}
      {!showForm && (
        <motion.button
          className="fab-breathe"
          whileTap={{ scale: 0.88 }}
          onClick={openForm}
          style={{
            position: 'fixed',
            bottom: `calc(var(--nav-height) + var(--safe-bottom) + 16px)`,
            right: '16px',
            width: '60px', height: '60px',
            background: 'var(--cyan)',
            clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
            border: 'none',
            color: 'var(--bg)',
            fontSize: '28px',
            cursor: 'pointer',
            zIndex: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(0,245,255,0.4)',
          }}
          aria-label="Nueva misión"
        >+</motion.button>
      )}

      {/* Hologram panel */}
      <AnimatePresence>
        {showForm && (
          <HologramPanel onClose={closeForm} onSubmit={handleAddMission} />
        )}
      </AnimatePresence>
    </div>
  );
}
