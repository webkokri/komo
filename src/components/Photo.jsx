import { motion } from 'framer-motion';

/**
 * Image slot with a curtain-style reveal on scroll.
 * Pass `src` (and `alt`) to show a real photo; without it a labelled placeholder is shown.
 * `onEdit` (editor only) adds a "change image" control over the slot.
 */
export default function Photo({
  label,
  src,
  alt = '',
  height = 440,
  tone = 'default', // 'default' | 'sand' | 'dark'
  className = '',
  style,
  onEdit,
  children,
}) {
  const toneClass = tone === 'dark' ? 'photo--dark' : tone === 'sand' ? 'photo--sand' : '';
  return (
    <motion.div
      className={`photo ${toneClass} ${className}`}
      style={{ height, ...style }}
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1.1, ease: [0.77, 0, 0.18, 1] }}
    >
      <motion.div
        className="photo__media"
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {src ? <img src={src} alt={alt} loading="lazy" /> : null}
        {children}
      </motion.div>
      {!src && label ? <span className="photo__label">{label}</span> : null}
      {onEdit ? (
        <button type="button" className="photo__edit cms-ui" onClick={onEdit}>
          {src ? 'Change image' : 'Add image'}
        </button>
      ) : null}
    </motion.div>
  );
}
