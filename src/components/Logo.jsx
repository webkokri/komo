import { motion } from 'framer-motion';
import { Txt } from '../cms/fields.jsx';
import { mediaUrl } from '../cms/api.js';
import { useCms } from '../cms/store.jsx';

export default function Logo({ showSub = true }) {
  const { get } = useCms();
  const image = get('global.header.logoImage');
  const word = get('global.header.logoWord');
  // An uploaded logo already contains the brand name, so it is shown on its own.
  if (image) {
    return (
      <span className="logo">
        <img className="logo__img" src={mediaUrl(image)} alt={word || 'Logo'} />
      </span>
    );
  }
  return (
    <span className="logo">
      {(
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
          <motion.circle
            cx="20"
            cy="10"
            r="5"
            fill="var(--sun)"
            animate={{ opacity: [1, 0.65, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <path d="M3 26c4-10 11-14 20-15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 21c-1-4 1-7 4-9M14 17c0-3 2-6 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      <span className="logo__text">
        <Txt path="global.header.logoWord" className="logo__word" />
        {showSub && <Txt path="global.header.logoSub" className="logo__sub" />}
      </span>
    </span>
  );
}
