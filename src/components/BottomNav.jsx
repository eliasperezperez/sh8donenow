import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { SFX } from '../utils/sounds';

const Icons = {
  home: (active) => (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
      <rect x="7" y="2" width="2" height="6" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="6" y="3" width="4" height="4" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="4" y="7" width="2" height="3" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="10" y="7" width="2" height="3" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="6" y="7" width="4" height="4" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="7" y="11" width="2" height="2" fill={active ? 'var(--gold)' : '#44445a'} />
      <rect x="6" y="12" width="4" height="1" fill={active ? 'var(--pink)' : '#44445a'} />
    </svg>
  ),
  missions: (active) => (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="9" y="2" width="5" height="5" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="2" y="9" width="5" height="5" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="9" y="9" width="5" height="5" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
    </svg>
  ),
  dashboard: (active) => (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
      <rect x="5" y="3" width="6" height="6" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="4" y="4" width="8" height="4" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="2" y="7" width="12" height="2" fill={active ? 'var(--purple)' : 'var(--muted)'} />
      <rect x="1" y="8" width="14" height="1" fill={active ? 'var(--purple)' : 'var(--muted)'} />
    </svg>
  ),
  profile: (active) => (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
      <rect x="4" y="2" width="8" height="1" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="3" y="3" width="10" height="7" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="4" y="10" width="8" height="2" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="6" y="12" width="4" height="2" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="7" y="5" width="2" height="4" fill={active ? 'var(--bg)' : 'transparent'} />
      <rect x="5" y="7" width="6" height="2" fill={active ? 'var(--bg)' : 'transparent'} />
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: '/home',      label: 'INICIO',   icon: 'home'      },
  { to: '/missions',  label: 'MISIONES', icon: 'missions'  },
  { to: '/dashboard', label: 'MAPA',     icon: 'dashboard' },
  { to: '/profile',   label: 'PERFIL',   icon: 'profile'   },
];

export default function BottomNav() {
  const location        = useLocation();
  const { pendingMissions, missions } = useGameStore();

  const hasOverdue = pendingMissions.some(m => !m.completedToday) ||
                     missions.some(m => m.overdue && !m.completedToday);

  return (
    <nav style={{
      position:      'fixed',
      bottom:        0,
      left:          0, right: 0,
      height:        `calc(var(--nav-height) + var(--safe-bottom))`,
      background:    'rgba(5,5,15,0.98)',
      backdropFilter:'blur(16px)',
      borderTop:     '1px solid var(--dim)',
      display:       'flex',
      alignItems:    'flex-start',
      zIndex:        1000,
    }}>
      {NAV_ITEMS.map(item => {
        const active  = location.pathname.startsWith(item.to);
        const showDot = item.icon === 'home' && hasOverdue;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => SFX.nav()}
            style={{
              flex:            1,
              display:         'flex',
              flexDirection:   'column',
              alignItems:      'center',
              justifyContent:  'center',
              height:          'var(--nav-height)',
              gap:             '4px',
              textDecoration:  'none',
              position:        'relative',
              minHeight:       '48px',
            }}
          >
            {/* Active indicator line */}
            {active && (
              <motion.div
                layoutId="nav-indicator"
                style={{
                  position: 'absolute', top: 0, left: '15%', right: '15%',
                  height: '2px', background: 'var(--cyan)',
                  boxShadow: '0 0 6px var(--cyan)',
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}

            {/* Icon with tap animation */}
            <motion.div
              whileTap={{ scale: [null, 0.8, 1.2, 1] }}
              transition={{ duration: 0.2, times: [0, 0.3, 0.7, 1] }}
              style={{ position: 'relative' }}
            >
              {Icons[item.icon](active)}
              {/* Overdue dot */}
              {showDot && (
                <div style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  width: '6px', height: '6px',
                  background: 'var(--pink)',
                  borderRadius: '0',
                  clipPath: 'polygon(2px 0%,calc(100% - 2px) 0%,100% 2px,100% calc(100% - 2px),calc(100% - 2px) 100%,2px 100%,0% calc(100% - 2px),0% 2px)',
                  animation: 'breathe-scale 2s ease-in-out infinite',
                }} />
              )}
            </motion.div>

            {active && (
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '7px', color: 'var(--cyan)', letterSpacing: '0.5px' }}>
                {item.label}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
