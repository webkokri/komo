import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../cms/theme.jsx';
import DecorFrame from './DecorFrame.jsx';
import PictureFrame from './PictureFrame.jsx';

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
  frame = 'line',
  children,
}) {
  const corp = useTheme() === 'corporate';
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const shift = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);
  const toneClass = tone === 'dark' ? 'photo--dark' : tone === 'sand' ? 'photo--sand' : '';
  return (
    <motion.div
      ref={ref}
      className={`photo ${toneClass} ${frame === 'arch' ? 'photo--arch' : ''} ${frame === 'gallery' ? 'photo--gallery' : ''} ${className}`}
      style={{ height, ...style }}
      initial={{ clipPath: corp ? 'inset(0% 100% 0% 0%)' : 'inset(100% 0% 0% 0%)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: corp ? 0.9 : 1.1, ease: [0.77, 0, 0.18, 1] }}
    >
      <motion.div
        className="photo__media"
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {src ? <motion.img src={src} alt={alt} loading="lazy" decoding="async" style={{ y: onEdit ? 0 : shift, scale: onEdit ? 1 : 1.12 }} /> : null}
        {children}
      </motion.div>
      {src && frame === 'gallery' ? <PictureFrame /> : null}
      {src && frame !== 'none' && frame !== 'gallery' ? <DecorFrame inset={12} delay={1.1} variant={frame === 'brackets' ? 'brackets' : 'line'} flora={frame === 'arch' ? ['br'] : ['tl', 'br']} floraSmall={frame === 'arch' ? ['bl'] : ['tr', 'bl']} radii={frame === 'arch' ? [228, 228, 0, 0] : [2, 2, 2, 2]} /> : null}
      {!src && label ? <span className="photo__label">{label}</span> : null}
      {onEdit ? (
        <button type="button" className="photo__edit cms-ui" onClick={onEdit}>
          {src ? 'Change image' : 'Add image'}
        </button>
      ) : null}
    </motion.div>
  );
}
