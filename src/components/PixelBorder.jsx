export default function PixelBorder({ children, color = 'var(--cyan)', size = 'md', className = '', style = {} }) {
  const clip = {
    sm: 'polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)',
    md: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)',
    lg: 'polygon(12px 0%,calc(100% - 12px) 0%,100% 12px,100% calc(100% - 12px),calc(100% - 12px) 100%,12px 100%,0% calc(100% - 12px),0% 12px)',
  }[size] || 'polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)';

  return (
    <div className={`relative ${className}`} style={style}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-1px',
          background: color,
          clipPath: clip,
          zIndex: 0,
          opacity: 0.8,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, clipPath: clip }}>
        {children}
      </div>
    </div>
  );
}
