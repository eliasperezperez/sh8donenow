import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

const TYPE_CONFIG = {
  success: { color: 'var(--green)',  icon: '✓', duration: 2500 },
  levelup: { color: 'var(--gold)',   icon: '↑', duration: 4000 },
  badge:   { color: 'var(--gold)',   icon: '★', duration: 4000 },
  alert:   { color: 'var(--pink)',   icon: '⚠', duration: 3000 },
  info:    { color: 'var(--cyan)',   icon: '●', duration: 2500 },
  error:   { color: 'var(--pink)',   icon: '✗', duration: 3000 },
};

function Toast({ toast, onRemove }) {
  const cfg   = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
  const color = cfg.color;

  return (
    <motion.div
      layout
      initial={{ y: 60, opacity: 0, scale: 0.92 }}
      animate={{ y: 0,  opacity: 1, scale: 1 }}
      exit={{ x: 80, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={() => onRemove(toast.id)}
      style={{
        background:  'var(--bg2)',
        border:      `1px solid ${color}`,
        clipPath:    'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
        padding:     '10px 14px',
        display:     'flex',
        alignItems:  'center',
        gap:         '10px',
        minWidth:    '220px',
        maxWidth:    '320px',
        boxShadow:   `0 0 16px ${color}35`,
        cursor:      'pointer',
      }}
    >
      <span style={{ color, fontFamily: 'var(--font-ui)', fontSize: '10px', flexShrink: 0 }}>
        {cfg.icon}
      </span>
      <div style={{ minWidth: 0 }}>
        {toast.title && (
          <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '11px', color, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {toast.title}
          </div>
        )}
        {toast.text && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {toast.text}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ToastSystem() {
  const { toasts, removeToast } = useGameStore();

  return (
    <div
      aria-live="polite"
      style={{
        position:       'fixed',
        bottom:         `calc(var(--nav-height) + var(--safe-bottom) + 12px)`,
        left:           '50%',
        transform:      'translateX(-50%)',
        zIndex:         9500,
        display:        'flex',
        flexDirection:  'column-reverse',
        gap:            '6px',
        alignItems:     'center',
        width:          'calc(100% - 32px)',
        maxWidth:       '360px',
        pointerEvents:  'none',
      }}
    >
      <AnimatePresence mode="sync">
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Toast toast={t} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
