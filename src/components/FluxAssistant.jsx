import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFluxStore } from '../hooks/useFlux';

/* ── Sprite SVG pixel art 32×32 ── */
function FluxSprite({ animation }) {
  const isCelebrating = animation === 'celebrate' || animation === 'thumbsup';
  const isAlert       = animation === 'alert';
  const isThinking    = animation === 'thinking';
  const isSad         = animation === 'sad';
  const isOff         = animation === 'off';

  // Ojos según expresión
  const leftEyeH  = isSad ? 10 : 9;
  const rightEyeH = isThinking ? 9 : isSad ? 10 : 9;
  const eyeColor  = isAlert ? '#ff006e' : '#05050f';
  const bodyColor = isOff ? '#44445a' : '#00f5ff';
  const opacity   = isOff ? 0.4 : 1;
  const antenaGlow = isAlert ? '#ff006e' : isOff ? 'transparent' : '#00f5ff';

  // Antena inclinación en standby
  const antenaRotate = animation === 'standby' ? 15 : 0;

  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity }}>
      {/* Antena */}
      <g transform={`rotate(${antenaRotate} 16 12)`}>
        <rect x="15" y="2" width="2" height="8" fill={bodyColor}/>
        {/* Punta antena */}
        <rect x="13" y="0" width="6" height="4" fill={antenaGlow} style={{
          filter: isOff ? 'none' : `drop-shadow(0 0 3px ${antenaGlow})`,
        }}/>
      </g>
      {/* Cabeza */}
      <rect x="11" y="10" width="10" height="10" fill={bodyColor}/>
      {/* Ojo izquierdo */}
      <rect x="13" y={leftEyeH} width="2" height="2" fill={eyeColor}/>
      {/* Ojo derecho */}
      <rect x="17" y={rightEyeH} width="2" height="2" fill={eyeColor}/>
      {/* Cuerpo */}
      <rect x="10" y="20" width="12" height="8" fill={bodyColor}/>
      {/* Brazo izquierdo */}
      <rect x="6" y="21" width="4" height="2" fill={bodyColor}
        style={{ transformOrigin: '10px 22px', transform: isCelebrating ? 'rotate(-60deg)' : 'none', transition: 'transform 0.3s' }}
      />
      {/* Brazo derecho */}
      <rect x="22" y="21" width="4" height="2" fill={bodyColor}
        style={{ transformOrigin: '22px 22px', transform: isCelebrating ? 'rotate(60deg)' : 'none', transition: 'transform 0.3s' }}
      />
      {/* Pierna izquierda */}
      <rect x="11" y="28" width="4" height="4" fill={bodyColor}/>
      {/* Pierna derecha */}
      <rect x="17" y="28" width="4" height="4" fill={bodyColor}/>
    </svg>
  );
}

/* ── Animaciones del sprite según estado ── */
function getBodyAnimation(animation) {
  switch (animation) {
    case 'celebrate':
      return { y: [0, -4, 0, -4, 0], transition: { duration: 0.8, repeat: 1 } };
    case 'thumbsup':
      return { y: [0, -2, 0], transition: { duration: 0.6 } };
    case 'alert':
      return { x: [0, -2, 2, -2, 2, 0], transition: { duration: 0.4, repeat: Infinity, repeatDelay: 1.5 } };
    case 'thinking':
      return { rotate: [-3, 3, -3], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } };
    default:
      return { y: [0, -1, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } };
  }
}

/* ── Burbuja de texto ── */
function FluxBubble({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      style={{
        position: 'absolute',
        bottom: '44px',
        right: 0,
        width: '180px',
        background: 'var(--bg2)',
        clipPath: 'polygon(6px 0%,calc(100% - 6px) 0%,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0% calc(100% - 6px),0% 6px)',
        border: '1px solid var(--cyan)',
        padding: '8px',
        boxShadow: '0 0 16px rgba(0,245,255,0.25)',
        zIndex: 301,
      }}
    >
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '6px',
        color: 'var(--cyan)',
        lineHeight: 1.8,
        wordBreak: 'break-word',
      }}>
        {message}
      </div>
      {/* Triángulo apuntando al sprite */}
      <div style={{
        position: 'absolute',
        bottom: '-6px',
        right: '16px',
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: '6px solid var(--cyan)',
      }}/>
    </motion.div>
  );
}

/* ── Componente principal ── */
const FluxAssistant = memo(() => {
  const { visible, message, animation, hide } = useFluxStore();

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(var(--nav-height) + var(--safe-bottom) + 12px)',
      right: '16px',
      zIndex: 300,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    }}>
      <AnimatePresence>
        {visible && message && (
          <FluxBubble key="bubble" message={message} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.div
            key="flux-sprite"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, ...getBodyAnimation(animation) }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            onClick={hide}
            style={{ cursor: 'pointer', width: '32px', height: '32px' }}
          >
            <FluxSprite animation={animation} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FluxAssistant.displayName = 'FluxAssistant';
export default FluxAssistant;
