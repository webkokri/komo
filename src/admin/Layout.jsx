import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { cx } from './ui.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '▦', end: true },
  { to: '/pages', label: 'Pages', icon: '❏' },
  { to: '/menus', label: 'Menus', icon: '☰' },
  { to: '/media', label: 'Media library', icon: '▣' },
  { to: '/leads', label: 'Leads', icon: '✉' },
  { to: '/users', label: 'Users', icon: '☺', admin: true },
  { to: '/settings', label: 'Site settings', icon: '⚙' },
];

function Sidebar({ onNavigate }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="sc-side">
      <NavLink to="/" onClick={onNavigate} className="sc-brand">
        <span>SC</span>
        <strong>Studio CMS</strong>
      </NavLink>
      <nav>
        {NAV.filter((n) => !n.admin || user.role === 'admin').map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate} className={({ isActive }) => cx('sc-nav', isActive && 'is-active')}>
            <i aria-hidden="true">{icon}</i>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sc-side__foot">
        <a href="/" target="_blank" rel="noreferrer">View live site ↗</a>
        <p>{user.name || user.email}</p>
        <small>{user.email} · {user.role}</small>
        <button type="button" className="sc-nav" onClick={async () => { await signOut(); navigate('/login', { replace: true }); }}>
          <i aria-hidden="true">⇥</i>Sign out
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="sc-shell">
      <div className="sc-topbar">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">☰ Menu</button>
        <strong>Studio CMS</strong>
      </div>
      {open && (
        <div className="sc-drawer">
          <div className="sc-drawer__scrim" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside><Sidebar onNavigate={() => setOpen(false)} /></aside>
        </div>
      )}
      <aside className="sc-rail"><Sidebar /></aside>
      <main className="sc-main">
        <div key={pathname} className="sc-fade"><Outlet /></div>
      </main>
    </div>
  );
}
