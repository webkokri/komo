import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from './Footer.jsx';
import { EASE } from './motion.jsx';

/**
 * Wraps each routed page (and the footer) so the whole page
 * fades in on enter and out on leave. Also sets the document title
 * and scrolls to a #hash target once the page has arrived.
 */
export default function Page({ title, children }) {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    const t = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 450);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.3, ease: 'easeIn' } }}
    >
      <main id="main">{children}</main>
      <Footer />
    </motion.div>
  );
}
