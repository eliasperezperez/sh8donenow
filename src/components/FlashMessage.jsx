import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';

function Flash({ msg, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, msg.duration || 3000);
    return () => clearTimeout(t);
  }, [msg, onDone]);

  const icons = { success: '✓', error: '✗', info: '●', levelup: '↑', badge: '★' };
  const colors = {
    success: 'var(--green)',
    error:   'var(--pink)',
    info:    'var(--cyan)',
    levelup: 'var(--gold)',
    badge:   'var(--gold)',
  };
  const color = colors[msg.type] || 'var(--cyan)';
  const icon  = icons[msg.type] || '●';

  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: `1px solid ${color}`,
        clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '200px',
        maxWidth: '320px',
        animation: visible
          ? 'bounce-in 300ms cubic-bezier(.34,1.56,.64,1) forwards'
          : 'fade-out 300ms ease forwards',
        boxShadow: `0 0 16px ${color}40`,
      }}
    >
      <span style={{ color, fontFamily: 'var(--font-ui)', fontSize: '10px' }}>{icon}</span>
      <div>
        {msg.title && (
          <div style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '11px', color, marginBottom: '2px' }}>
            {msg.title}
          </div>
        )}
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text)' }}>
          {msg.text}
        </div>
      </div>
    </div>
  );
}

export default function FlashMessage() {
  const { flashMessages, removeFlash } = useGameStore();

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '80px',
        right: '12px',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'flex-end',
      }}
    >
      {flashMessages.map(msg => (
        <Flash key={msg.id} msg={msg} onDone={() => removeFlash(msg.id)} />
      ))}
    </div>
  );
}
