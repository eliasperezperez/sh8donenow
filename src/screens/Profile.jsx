import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { getLevelInfo, LEVELS } from '../utils/levels';
import { ZONES } from '../utils/zones';
import { SFX } from '../utils/sounds';
import { useFlux } from '../hooks/useFlux';
import { todayKey } from '../utils/dates';

/* ── Íconos pixel SVG de recursos ── */
const ITEM_ICONS = {
  fluxo: (c='#00f5ff') => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="6" y="0" width="4" height="2" fill={c}/>
      <rect x="4" y="2" width="8" height="2" fill={c}/>
      <rect x="2" y="4" width="12" height="2" fill={c}/>
      <rect x="4" y="6" width="8" height="2" fill={c}/>
      <rect x="6" y="8" width="4" height="2" fill={c}/>
      <rect x="4" y="10" width="8" height="2" fill={c}/>
      <rect x="2" y="12" width="12" height="2" fill={c}/>
      <rect x="4" y="14" width="8" height="2" fill={c}/>
    </svg>
  ),
  ignicion: (c='#ff8c42') => (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
      <rect x="5" y="0" width="2" height="3" fill={c}/>
      <rect x="3" y="2" width="2" height="5" fill={c}/>
      <rect x="7" y="2" width="2" height="3" fill={c}/>
      <rect x="1" y="5" width="2" height="5" fill={c}/>
      <rect x="5" y="5" width="2" height="9" fill="#ff006e"/>
      <rect x="9" y="5" width="2" height="3" fill={c}/>
      <rect x="3" y="9" width="6" height="5" fill="#ff006e"/>
    </svg>
  ),
  qron: (c='#ffbe0b') => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="6" y="0" width="2" height="2" fill={c}/>
      <rect x="4" y="2" width="6" height="2" fill={c}/>
      <rect x="2" y="4" width="10" height="2" fill={c}/>
      <rect x="0" y="6" width="14" height="2" fill={c}/>
      <rect x="2" y="8" width="10" height="2" fill={c}/>
      <rect x="4" y="10" width="6" height="2" fill={c}/>
      <rect x="6" y="12" width="2" height="2" fill={c}/>
    </svg>
  ),
  amplificador: (c='#ff8c42') => (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
      <rect x="5" y="0" width="2" height="10" fill={c}/>
      <rect x="2" y="4" width="2" height="2" fill={c}/>
      <rect x="8" y="4" width="2" height="2" fill={c}/>
      <rect x="0" y="6" width="2" height="2" fill={c}/>
      <rect x="10" y="6" width="2" height="2" fill={c}/>
      <rect x="4" y="10" width="4" height="4" fill={c}/>
      <rect x="2" y="14" width="8" height="2" fill={c}/>
      <rect x="4" y="16" width="4" height="4" fill={c}/>
    </svg>
  ),
  capsula: (c='#00f5ff') => (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <rect x="2" y="0" width="12" height="2" fill={c}/>
      <rect x="0" y="2" width="16" height="8" fill={c} opacity="0.6"/>
      <rect x="2" y="10" width="12" height="2" fill={c}/>
      <rect x="6" y="4" width="4" height="4" fill={c}/>
    </svg>
  ),
  sintonizador: (c='#ffbe0b') => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="4" y="0" width="6" height="2" fill={c}/>
      <rect x="2" y="2" width="10" height="2" fill={c}/>
      <rect x="0" y="4" width="14" height="6" fill={c} opacity="0.4"/>
      <rect x="2" y="10" width="10" height="2" fill={c}/>
      <rect x="4" y="12" width="6" height="2" fill={c}/>
      <rect x="6" y="4" width="2" height="6" fill={c}/>
      <rect x="8" y="6" width="4" height="2" fill={c}/>
    </svg>
  ),
  amortiguador: (c='#8b5cf6') => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="4" y="0" width="8" height="2" fill={c}/>
      <rect x="2" y="2" width="2" height="10" fill={c}/>
      <rect x="12" y="2" width="2" height="10" fill={c}/>
      <rect x="4" y="12" width="8" height="2" fill={c}/>
      <rect x="6" y="14" width="4" height="2" fill={c}/>
      <rect x="6" y="6" width="4" height="4" fill={c}/>
      <rect x="7" y="4" width="2" height="2" fill={c}/>
      <rect x="8" y="7" width="4" height="2" fill={c} opacity="0.5"/>
    </svg>
  ),
};

/* ── Inventario ── */
function Inventario() {
  const {
    fluxo, igniciones, qron, amplificadores, capsulasMemoria,
    sintonizadores, amortiguadores, amplificadorActivo, modoEquilibrio,
    modoEquilibrioExpiry, capsulasUsadasEstaSemana, pendingMissions,
    activarAmplificador, activarModoEquilibrio, usarCapsula, usarIgnicion,
    invocarFlux, addToast,
  } = useGameStore();
  const { trigger: triggerFlux } = useFlux();

  const [capsulaPicker, setCapsulaPicker] = useState(false);
  const [ignicionMenu, setIgnicionMenu] = useState(false);

  const modoEqActivo = modoEquilibrio && modoEquilibrioExpiry && Date.now() < new Date(modoEquilibrioExpiry).getTime();
  const capsulasDisponibles = capsulasMemoria > 0 && capsulasUsadasEstaSemana < 1;

  const handleAmplificador = () => {
    if (amplificadorActivo) {
      addToast({ type: 'info', text: 'AMPLIFICADOR YA ACTIVO. Completa una misión.' });
      return;
    }
    if (activarAmplificador()) {
      SFX.amplificatorActivate?.();
      addToast({ type: 'success', text: 'AMPLIFICADOR ACTIVO — próxima misión x2 FLX' });
    } else {
      addToast({ type: 'warning', text: 'SIN AMPLIFICADORES' });
    }
  };

  const handleModoEquilibrio = () => {
    if (modoEqActivo) {
      addToast({ type: 'info', text: 'MODO EQUILIBRIO YA ACTIVO por 24hs' });
      return;
    }
    if (activarModoEquilibrio()) {
      addToast({ type: 'success', text: 'MODO EQUILIBRIO — +20% FLX por 24hs' });
    } else {
      addToast({ type: 'warning', text: 'NECESITAS 2 QRÓN' });
    }
  };

  const handleIgnicion = (tipo) => {
    setIgnicionMenu(false);
    if (!usarIgnicion()) {
      addToast({ type: 'warning', text: 'SIN IGNICIONES' });
      return;
    }
    if (tipo === 'flux') {
      triggerFlux('motivacion');
      addToast({ type: 'info', text: 'FLUX INVOCADO' });
    } else {
      addToast({ type: 'info', text: 'IGNICIÓN USADA' });
    }
  };

  const handleCapsula = (missionId) => {
    setCapsulaPicker(false);
    if (usarCapsula(missionId)) {
      SFX.capsulaUsed?.();
      addToast({ type: 'success', text: 'CÁPSULA DE MEMORIA USADA — señal retroactiva confirmada' });
    }
  };

  const ITEMS = [
    {
      key: 'fluxo',
      name: 'FLUXO',
      unit: 'FLX',
      qty: fluxo || 0,
      color: '#ff006e',
      desc: 'Energía del sistema',
      icon: ITEM_ICONS.fluxo('#ff006e'),
      action: null,
    },
    {
      key: 'ignicion',
      name: 'IGNICIÓN',
      unit: '',
      qty: igniciones || 0,
      maxQty: 3,
      color: '#ff8c42',
      desc: 'Recurso escaso. Máx 3.',
      icon: ITEM_ICONS.ignicion(),
      action: igniciones > 0 ? () => setIgnicionMenu(true) : null,
      actionLabel: 'USAR',
    },
    {
      key: 'qron',
      name: 'QRÓN',
      unit: 'QRN',
      qty: qron || 0,
      color: '#ffbe0b',
      desc: '2 QRN → Modo Equilibrio (+20% FLX 24hs)',
      icon: ITEM_ICONS.qron(),
      action: qron >= 2 && !modoEqActivo ? handleModoEquilibrio : null,
      actionLabel: modoEqActivo ? 'ACTIVO' : 'USAR',
    },
    {
      key: 'amplificador',
      name: 'AMPLIFICADOR',
      unit: '',
      qty: amplificadores || 0,
      color: '#ff8c42',
      desc: 'Siguiente misión vale x2 FLX',
      icon: ITEM_ICONS.amplificador(),
      action: amplificadores > 0 ? handleAmplificador : null,
      actionLabel: amplificadorActivo ? 'ACTIVO' : 'ACTIVAR',
    },
    {
      key: 'capsula',
      name: 'CÁPSULA',
      unit: '',
      qty: capsulasMemoria || 0,
      color: '#00f5ff',
      desc: 'Marcar misión pasada como completada',
      icon: ITEM_ICONS.capsula(),
      action: capsulasDisponibles ? () => setCapsulaPicker(true) : null,
      actionLabel: 'USAR',
    },
    {
      key: 'sintonizador',
      name: 'SINTONIZADOR',
      unit: '',
      qty: sintonizadores || 0,
      color: '#ffbe0b',
      desc: 'Cambiar frecuencia de misión',
      icon: ITEM_ICONS.sintonizador(),
      action: null,
      actionLabel: 'EN MISIÓN',
    },
    {
      key: 'amortiguador',
      name: 'AMORTIGUADOR',
      unit: '',
      qty: amortiguadores || 0,
      color: '#8b5cf6',
      desc: 'Protege la Racha de Señal',
      icon: ITEM_ICONS.amortiguador(),
      action: null,
      actionLabel: 'AUTO',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {ITEMS.map(item => (
          <div key={item.key} style={{
            background: 'var(--bg2)',
            clipPath: 'polygon(6px 0%,calc(100% - 6px) 0%,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0% calc(100% - 6px),0% 6px)',
            border: `1px solid ${item.color}40`,
            padding: '10px',
            display: 'flex', flexDirection: 'column', gap: '6px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: item.color }}>{item.name}</div>
                <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>
                  {typeof item.qty === 'number' ? item.qty.toLocaleString() : item.qty}
                  {item.unit && <span style={{ fontSize: '8px', color: item.color, marginLeft: '2px' }}>{item.unit}</span>}
                </div>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '5px', color: 'var(--muted)', lineHeight: 1.6 }}>
              {item.desc}
            </div>
            {item.actionLabel && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={item.action || undefined}
                disabled={!item.action}
                style={{
                  background: item.action ? item.color : 'var(--dim)',
                  border: 'none', color: item.action ? 'var(--bg)' : 'var(--muted)',
                  fontFamily: 'var(--font-ui)', fontSize: '6px', padding: '5px 8px',
                  clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                  cursor: item.action ? 'pointer' : 'default',
                  opacity: item.action ? 1 : 0.4,
                  width: '100%',
                }}
              >{item.actionLabel}</motion.button>
            )}
          </div>
        ))}
      </div>

      {/* Menú Ignición */}
      <AnimatePresence>
        {ignicionMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            style={{
              background: 'var(--bg2)',
              clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
              border: '1px solid #ff8c42',
              padding: '14px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: '#ff8c42', marginBottom: '10px' }}>
              USAR IGNICIÓN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'INVOCAR FLUX', desc: 'Consejo inmediato', fn: () => handleIgnicion('flux') },
                { label: 'CANCELAR', desc: '', fn: () => setIgnicionMenu(false) },
              ].map(op => (
                <motion.button key={op.label} whileTap={{ scale: 0.94 }}
                  onClick={op.fn}
                  style={{
                    background: 'var(--dim)', border: 'none', color: 'var(--text)',
                    fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '8px',
                    clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {op.label}
                  {op.desc && <span style={{ fontSize: '6px', color: 'var(--muted)', marginLeft: '6px' }}>{op.desc}</span>}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selector de cápsula */}
      <AnimatePresence>
        {capsulaPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            style={{
              background: 'var(--bg2)',
              clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
              border: '1px solid var(--cyan)',
              padding: '14px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--cyan)', marginBottom: '10px' }}>
              SELECCIONA SEÑAL PERDIDA
            </div>
            {pendingMissions.filter(m => !m.completedToday).length === 0 ? (
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)' }}>
                SIN SEÑALES PERDIDAS DISPONIBLES
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {pendingMissions.filter(m => !m.completedToday).map(m => (
                  <motion.button key={m.id} whileTap={{ scale: 0.94 }}
                    onClick={() => handleCapsula(m.id)}
                    style={{
                      background: 'var(--dim)', border: 'none', color: 'var(--text)',
                      fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '8px',
                      clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >{m.title}</motion.button>
                ))}
                <motion.button whileTap={{ scale: 0.94 }} onClick={() => setCapsulaPicker(false)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--muted)',
                    fontFamily: 'var(--font-ui)', fontSize: '6px', padding: '6px', cursor: 'pointer',
                  }}
                >CANCELAR</motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Diario de Vuelo (expandido) ── */
function DiarioDeVuelo({ bitacora, fluxHistory, weeklyTipsShown }) {
  const [section, setSection] = useState('reflexiones');
  const getZone = (id) => ZONES.find(z => z.id === id);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${getMonthAbbr(parseInt(parts[1]))}-${parts[0]}`;
  };

  const getMonthAbbr = (m) => ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][m - 1] || '';

  const sections = [
    ['reflexiones', 'ZONAS'],
    ['flux', 'FLUX'],
    ['consejos', 'CONSEJOS'],
  ];

  return (
    <div>
      {/* Sub-nav secciones */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {sections.map(([k, l]) => (
          <button key={k} onClick={() => setSection(k)}
            style={{
              background: section === k ? 'var(--cyan)' : 'var(--dim)',
              border: 'none', color: section === k ? 'var(--bg)' : 'var(--muted)',
              fontFamily: 'var(--font-ui)', fontSize: '6px', padding: '5px 8px',
              clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
              cursor: 'pointer',
            }}
          >{l}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {section === 'reflexiones' && (
          <motion.div key="reflexiones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {bitacora.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', lineHeight: 2 }}>
                COLONIZA ZONAS PARA<br />DESBLOQUEAR REFLEXIONES
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bitacora.map((entry) => {
                  const zone = getZone(entry.zoneId);
                  if (!zone) return null;
                  return (
                    <div key={entry.zoneId} style={{
                      background: 'var(--bg2)',
                      clipPath: 'polygon(6px 0%,calc(100% - 6px) 0%,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0% calc(100% - 6px),0% 6px)',
                      border: `1px solid ${zone.color}40`, padding: '10px',
                    }}>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)', marginBottom: '4px' }}>
                        {formatDate(entry.unlockedAt)} // ZONA COLONIZADA // {zone.short}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--text)', lineHeight: 1.7, fontStyle: 'italic' }}>
                        "{entry.reflection}"
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {section === 'flux' && (
          <motion.div key="flux" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {(!fluxHistory || fluxHistory.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', lineHeight: 2 }}>
                AÚN NO HAY TRANSMISIONES<br />DE FLUX REGISTRADAS
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[...fluxHistory].reverse().map((entry, i) => (
                  <div key={i} style={{
                    background: 'var(--bg2)',
                    clipPath: 'polygon(6px 0%,calc(100% - 6px) 0%,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0% calc(100% - 6px),0% 6px)',
                    border: '1px solid var(--cyan)30', padding: '8px',
                  }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)', marginBottom: '3px' }}>
                      {entry.date} // TRANSMISIÓN DE FLUX
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--cyan)', lineHeight: 1.6 }}>
                      {entry.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {section === 'consejos' && (
          <motion.div key="consejos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {(!weeklyTipsShown || weeklyTipsShown.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', lineHeight: 2 }}>
                LOS MICRO-CONSEJOS<br />APARECERÁN AQUÍ
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {weeklyTipsShown.map((tip, i) => (
                  <div key={i} style={{
                    background: 'var(--bg2)',
                    clipPath: 'polygon(6px 0%,calc(100% - 6px) 0%,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0% calc(100% - 6px),0% 6px)',
                    border: '1px solid var(--gold)30', padding: '8px',
                  }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--text)', lineHeight: 1.6 }}>
                      {tip}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Pantalla principal del Núcleo ── */
export default function Profile() {
  const [searchParams] = useSearchParams();
  const {
    playerName, setPlayerName, totalScore, fluxo, dayStreak, maxStreak,
    amortiguadores, shields, totalCompleted, totalPomos, perfectDays, resetGame,
    unlockedTransmisores, soundEnabled, soundVolume, setSoundEnabled, setSoundVolume,
    bitacora, fluxHistory, weeklyTipsShown,
    igniciones, qron, amplificadores, capsulasMemoria, sintonizadores,
  } = useGameStore();

  const initTab = searchParams.get('tab') || 'stats';
  const [tab, setTab]           = useState(initTab);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [confirmReset, setConfirmReset] = useState(false);

  const lvl = getLevelInfo(totalScore || fluxo || 0);
  const totalAmort = (amortiguadores || 0) + (shields || 0);

  const handleSaveName = () => {
    if (nameInput.trim()) { setPlayerName(nameInput.trim().toUpperCase()); SFX.addMission(); }
    setEditName(false);
  };

  const handleVolumeSet = (v) => {
    SFX.click();
    setSoundVolume(v);
  };

  const tabs = [
    ['stats', 'NÚCLEO'],
    ['inventario', `INVENTARIO`],
    ['diario', 'DIARIO'],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <header style={{ padding: '16px', borderBottom: '1px solid var(--dim)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '18px', color: 'var(--cyan)', letterSpacing: '3px', marginBottom: '10px' }}>
          NÚCLEO
        </div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); SFX.click(); }}
              style={{
                background: tab === k ? 'var(--cyan)' : 'var(--dim)',
                border: 'none', color: tab === k ? 'var(--bg)' : 'var(--muted)',
                fontFamily: 'var(--font-ui)', fontSize: '7px', padding: '6px 10px',
                clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                cursor: 'pointer', flexShrink: 0,
              }}
            >{l}</button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <AnimatePresence mode="wait">

          {tab === 'inventario' && (
            <motion.div key="inventario" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Inventario />
            </motion.div>
          )}

          {tab === 'diario' && (
            <motion.div key="diario" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <DiarioDeVuelo
                bitacora={bitacora || []}
                fluxHistory={fluxHistory || []}
                weeklyTipsShown={weeklyTipsShown || []}
              />
            </motion.div>
          )}

          {tab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Avatar + name */}
              <div style={{
                background: 'var(--bg2)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '20px', border: `1px solid ${lvl.color || 'var(--cyan)'}`, textAlign: 'center',
                boxShadow: `0 0 20px ${lvl.color || 'var(--cyan)'}20`,
              }}>
                {/* Igniciones orbitando */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
                  <span style={{ fontSize: '48px', filter: `drop-shadow(0 0 12px ${lvl.color || 'var(--cyan)'})`, display: 'block' }}>🚀</span>
                  <div style={{ position: 'absolute', top: 0, right: '-16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ opacity: i < (igniciones || 0) ? 1 : 0.2, transition: 'opacity 0.5s' }}>
                        <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                          <rect x="3" y="0" width="2" height="2" fill="#ff8c42"/>
                          <rect x="2" y="2" width="4" height="4" fill="#ff006e"/>
                          <rect x="3" y="6" width="2" height="4" fill="#ff8c42"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>

                {editName ? (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                    <input value={nameInput} onChange={e => setNameInput(e.target.value.slice(0, 16))}
                      onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                      style={{
                        background: 'var(--bg3)', border: `1px solid ${lvl.color || 'var(--cyan)'}`,
                        color: lvl.color || 'var(--cyan)',
                        fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '18px',
                        padding: '6px 12px', clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                        textAlign: 'center', width: '180px',
                      }}
                      autoFocus
                    />
                    <button onClick={handleSaveName}
                      style={{
                        background: lvl.color || 'var(--cyan)', border: 'none', color: 'var(--bg)',
                        fontFamily: 'var(--font-ui)', fontSize: '8px', padding: '6px 10px',
                        clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                        cursor: 'pointer',
                      }}
                    >✓</button>
                  </div>
                ) : (
                  <div onClick={() => setEditName(true)} style={{
                    fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: '20px',
                    color: lvl.color || 'var(--cyan)',
                    marginBottom: '4px', cursor: 'pointer', letterSpacing: '3px',
                  }}>
                    {playerName} <span style={{ fontSize: '14px', opacity: 0.5 }}>✎</span>
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: lvl.color || 'var(--gold)' }}>
                  {lvl.name}
                </div>
                <div className="score-breathe" style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '28px', color: 'var(--pink)', marginTop: '10px' }}>
                  {(fluxo || totalScore || 0).toLocaleString()}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>FLUXO TOTAL</div>
              </div>

              {/* Rangos de Operativo */}
              <div style={{
                background: 'var(--bg2)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '14px', border: '1px solid var(--dim)',
              }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)', marginBottom: '10px' }}>RANGOS DE OPERATIVO</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {LEVELS.map(l => {
                    const isCurrent = l.level === lvl.level;
                    const isPassed  = (totalScore || 0) >= l.minScore && !isCurrent;
                    const isLocked  = (totalScore || 0) < l.minScore;
                    return (
                      <div key={l.level} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '6px 10px',
                        background: isCurrent ? 'var(--bg3)' : 'transparent',
                        border: isCurrent ? `1px solid ${l.color}` : '1px solid transparent',
                        clipPath: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
                        opacity: isLocked ? 0.3 : 1,
                      }}>
                        <div style={{ width: '8px', height: '8px', background: l.color, clipPath: 'polygon(4px 0%,100% 4px,100% 4px,4px 8px,0 4px)', flexShrink: 0 }}/>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: isCurrent ? l.color : 'var(--text)' }}>
                            {l.name}
                          </div>
                        </div>
                        {isCurrent && (
                          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: l.color }}>
                            {Math.round(lvl.progress)}%
                          </div>
                        )}
                        {isPassed && (
                          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: l.color }}>★</div>
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
                padding: '14px', border: '1px solid var(--dim)',
                display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px',
              }}>
                {[
                  { label: 'RACHA',        value: dayStreak,      color: 'var(--pink)'   },
                  { label: 'MÁX RACHA',    value: maxStreak,      color: 'var(--gold)'   },
                  { label: 'AMORTIGUADOR', value: totalAmort,     color: 'var(--purple)' },
                  { label: 'SEÑALES',      value: totalCompleted, color: 'var(--green)'  },
                  { label: 'POMODOROS',    value: totalPomos,     color: 'var(--cyan)'   },
                  { label: 'DÍAS PERF.',   value: perfectDays,    color: 'var(--gold)'   },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '18px', color: s.color }}>{s.value}</div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '6px', color: 'var(--muted)', marginTop: '3px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Audio */}
              <div style={{
                background: 'var(--bg2)',
                clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
                padding: '14px', border: '1px solid var(--dim)', display: 'flex', flexDirection: 'column', gap: '10px',
              }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--muted)' }}>AUDIO</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'var(--text)' }}>SONIDOS</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[{ label: 'OFF', vol: 0 }, { label: '50%', vol: 0.5 }, { label: '100%', vol: 1 }].map(v => (
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
                  >⚠ RESETEAR NÚCLEO</button>
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
