export function Arrow({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function Plus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M7 1v12M1 7h12" />
    </svg>
  );
}

export function Quote() {
  return (
    <svg width="40" height="28" viewBox="0 0 40 28" fill="none" aria-hidden="true">
      <path d="M2 26V16C2 8 6 3 14 2M22 26V16c0-8 4-13 12-14" stroke="var(--moss)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ValueIcon({ name }) {
  const common = { width: 36, height: 36, viewBox: '0 0 36 36', fill: 'none', stroke: 'var(--moss)', strokeWidth: 1.5, strokeLinecap: 'round', 'aria-hidden': true };
  if (name === 'sun') {
    return (
      <svg {...common}>
        <circle cx="18" cy="18" r="6" />
        <path d="M18 3v5M18 28v5M3 18h5M28 18h5M7.4 7.4l3.5 3.5M25.1 25.1l3.5 3.5M7.4 28.6l3.5-3.5M25.1 10.9l3.5-3.5" />
      </svg>
    );
  }
  if (name === 'leaf') {
    return (
      <svg {...common}>
        <path d="M6 30C10 16 18 8 30 6c-1 12-9 21-24 24z" />
        <path d="M6 30L22 14" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="5" />
      <circle cx="24" cy="12" r="5" />
      <path d="M3 31c1-6 5-9 9-9s8 3 9 9M15 31c1-6 5-9 9-9s8 3 9 9" />
    </svg>
  );
}
