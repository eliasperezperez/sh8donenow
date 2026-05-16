import { NavLink, useLocation } from 'react-router-dom';

/* Pixel art SVG icons — 16x16 orthogonal paths only */
const Icons = {
  home: (active) => (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
      {/* Rocket body */}
      <rect x="7" y="2" width="2" height="6" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="6" y="3" width="4" height="4" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      {/* Wings */}
      <rect x="4" y="7" width="2" height="3" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="10" y="7" width="2" height="3" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      {/* Body lower */}
      <rect x="6" y="7" width="4" height="4" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      {/* Flame */}
      <rect x="7" y="11" width="2" height="2" fill={active ? 'var(--gold)' : '#44445a'} />
      <rect x="6" y="12" width="4" height="1" fill={active ? 'var(--pink)' : '#44445a'} />
    </svg>
  ),
  missions: (active) => (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
      {/* 2x2 grid */}
      <rect x="2" y="2" width="5" height="5" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="9" y="2" width="5" height="5" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="2" y="9" width="5" height="5" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="9" y="9" width="5" height="5" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      {/* Check on bottom-right */}
      <rect x="11" y="11" width="1" height="2" fill={active ? 'var(--bg)' : 'transparent'} />
      <rect x="10" y="12" width="1" height="1" fill={active ? 'var(--bg)' : 'transparent'} />
    </svg>
  ),
  dashboard: (active) => (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
      {/* Planet circle */}
      <rect x="5" y="3" width="6" height="6" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="4" y="4" width="8" height="4" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      {/* Ring */}
      <rect x="2" y="7" width="12" height="2" fill={active ? 'var(--purple)' : 'var(--muted)'} />
      <rect x="1" y="8" width="14" height="1" fill={active ? 'var(--purple)' : 'var(--muted)'} />
    </svg>
  ),
  profile: (active) => (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
      {/* Shield */}
      <rect x="4" y="2" width="8" height="1" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="3" y="3" width="10" height="7" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="4" y="10" width="8" height="2" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="6" y="12" width="4" height="2" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      <rect x="7" y="14" width="2" height="1" fill={active ? 'var(--cyan)' : 'var(--muted)'} />
      {/* Star inside */}
      <rect x="7" y="5" width="2" height="4" fill={active ? 'var(--bg)' : 'transparent'} />
      <rect x="5" y="7" width="6" height="2" fill={active ? 'var(--bg)' : 'transparent'} />
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: '/home',      label: 'INICIO',    icon: 'home'      },
  { to: '/missions',  label: 'MISIONES',  icon: 'missions'  },
  { to: '/dashboard', label: 'MAPA',      icon: 'dashboard' },
  { to: '/profile',   label: 'PERFIL',    icon: 'profile'   },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0, right: 0,
        height: `calc(var(--nav-height) + var(--safe-bottom))`,
        background: 'rgba(5,5,15,0.98)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--dim)',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '0',
        zIndex: 1000,
      }}
    >
      {NAV_ITEMS.map(item => {
        const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
        return (
          <NavLink
            key={item.to}
            to={item.to}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'var(--nav-height)',
              gap: '4px',
              textDecoration: 'none',
              borderTop: active ? '2px solid var(--cyan)' : '2px solid transparent',
              transition: 'border-top-color 150ms ease',
              minHeight: '48px',
            }}
            className="pressable"
          >
            {Icons[item.icon](active)}
            {active && (
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '7px',
                color: 'var(--cyan)',
                letterSpacing: '0.5px',
              }}>
                {item.label}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
