import { Fragment } from 'react';
import { motion } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1];

// Fade + rise. `custom` carries an optional delay (seconds).
export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay },
  }),
};

const viewport = { once: true, margin: '-80px' };

/** Reveals its content when scrolled into view. */
export function Reveal({ as = 'div', delay = 0, children, ...rest }) {
  const M = motion[as];
  return (
    <M initial="hidden" whileInView="show" viewport={viewport} variants={fadeUp} custom={delay} {...rest}>
      {children}
    </M>
  );
}

/** Staggers its <Item> children into view one after another. */
export function Stagger({ as = 'div', gap = 0.09, delay = 0, children, ...rest }) {
  const M = motion[as];
  return (
    <M
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </M>
  );
}

export function Item({ as = 'div', children, ...rest }) {
  const M = motion[as];
  return (
    <M variants={fadeUp} {...rest}>
      {children}
    </M>
  );
}

/** Headline that slides up word by word from behind a mask. */
export function SplitText({ text, as = 'h1', className, delay = 0.15, inView = false }) {
  const M = motion[as];
  const words = text.split(' ');
  const trigger = inView
    ? { initial: 'hidden', whileInView: 'show', viewport }
    : { initial: 'hidden', animate: 'show' };
  return (
    <M
      className={className}
      aria-label={text}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: delay } } }}
      {...trigger}
    >
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="word-mask" aria-hidden="true">
            <motion.span
              className="word"
              variants={{ hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 0.9, ease: EASE } } }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </M>
  );
}
