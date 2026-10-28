import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Logo from './Logo.jsx';
import { EASE } from './motion.jsx';
import { Btn, Txt } from '../cms/fields.jsx';
import { useCms } from '../cms/store.jsx';

export default function Header() {
  const { get, editing, selectGlobal } = useCms();
  const NAV_LINKS = get('global.header.nav') || [];
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { pathname } = useLocation();

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));
  useEffect(() => setOpen(false), [pathname]);

  // close the mobile menu with Escape
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <motion.header
      className={`header ${scrolled ? 'is-scrolled' : ''}`}
      onClickCapture={editing ? () => selectGlobal('header') : undefined}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="container header__bar">
        <Link to="/" className="header__logo" aria-label="KOMOREBI home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="nav nav--desktop">
          {NAV_LINKS.map((l, i) => (
            <NavLink
              key={i}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <Txt path={`global.header.nav.${i}.label`} />
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="nav__underline"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <Btn path="global.header.cta" className="btn btn--outline-light header__cta" arrow />

        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`menu-btn__icon ${open ? 'is-open' : ''}`}>
            <span />
            <span />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <motion.ul
              className="container mobile-menu__list"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
            >
              {NAV_LINKS.map((l, i) => (
                <motion.li key={i} variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) => `mobile-menu__link ${isActive ? 'is-active' : ''}`}
                  >
                    <Txt path={`global.header.nav.${i}.label`} />
                  </NavLink>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
                <Btn path="global.header.cta" className="btn btn--light" arrow />
              </motion.li>
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
