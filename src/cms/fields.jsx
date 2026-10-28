// Editable building blocks used by every section. In the public site they render ordinary
// (animated) elements; in the editor the same elements become click-to-edit.
import { createElement, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Photo from '../components/Photo.jsx';
import { Arrow } from '../components/Icons.jsx';
import { Item, Reveal, SplitText } from '../components/motion.jsx';
import { mediaUrl } from './api.js';
import { useCms } from './store.jsx';

function EditableText({ path, as: Tag = 'span', className, style, multiline, placeholder }) {
  const { get, set } = useCms();
  const value = get(path) ?? '';
  const ref = useRef(null);

  // The DOM node owns its text while focused; otherwise mirror the document (undo, redo, reorder).
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerText !== value) el.innerText = value;
  }, [value]);

  const commit = () => {
    const text = ref.current.innerText.replace(/ /g, ' ').replace(/\n+$/, '');
    if (text !== value) set(path, text);
  };

  return (
    <Tag
      ref={ref}
      className={`${className || ''} cms-text`.trim()}
      style={multiline ? { whiteSpace: 'pre-line', ...style } : style}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      data-placeholder={placeholder || 'Type here…'}
      onBlur={commit}
      onClick={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        e.stopPropagation(); // keep Space/Enter from triggering a surrounding button or link
        if (e.key === 'Enter' && !multiline) { e.preventDefault(); e.currentTarget.blur(); }
        if (e.key === 'Escape') e.currentTarget.blur();
      }}
      onKeyUp={(e) => e.stopPropagation()}
      onPaste={(e) => {
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
      }}
    />
  );
}

/**
 * Text bound to a document path, e.g. <Txt path="page.sections.0.props.title" as="h2" />.
 * `anim`: 'reveal' | 'item' | 'split' | undefined — the entrance animation used on the live site.
 * `motionProps`: pass framer-motion props for one-off animations (live site only).
 */
export function Txt({ path, as = 'span', anim, delay, inView, motionProps, multiline, placeholder, className, style, ...rest }) {
  const { editing, get } = useCms();
  const value = get(path) ?? '';

  if (editing) return <EditableText path={path} as={as} className={className} style={style} multiline={multiline} placeholder={placeholder} />;
  if (!value) return null;

  const base = { className, style: multiline ? { whiteSpace: 'pre-line', ...style } : style, ...rest };
  if (anim === 'split') return <SplitText as={as} className={className} text={value} delay={delay} inView={inView} />;
  if (anim === 'reveal') return <Reveal as={as} delay={delay} {...base}>{value}</Reveal>;
  if (anim === 'item') return <Item as={as} {...base}>{value}</Item>;
  if (motionProps) return createElement(motion[as], { ...base, ...motionProps }, value);
  return createElement(as, base, value);
}

const EXTERNAL = /^(https?:|mailto:|tel:|\/\/)/;

/** Router link for internal paths, plain anchor for external/hash links. Inert while editing. */
export function Lnk({ to = '#', children, ...rest }) {
  if (EXTERNAL.test(to)) return <a href={to} {...rest}>{children}</a>;
  return <Link to={to} {...rest}>{children}</Link>;
}

/** Button/link whose label and target both come from `{ label, to }` at `path`. */
export function Btn({ path, className, arrow, ...rest }) {
  const { editing, get } = useCms();
  const value = get(path);
  if (!value || (!value.label && !editing)) return null;
  return (
    <Lnk to={value.to} className={className} {...rest}>
      <Txt path={`${path}.label`} />
      {arrow ? <Arrow /> : null}
    </Lnk>
  );
}

/** Photo bound to `{ src, alt, label, height? }` at `path`; click to swap while editing. */
export function CmsPhoto({ path, height = 440, tone, className, style, children }) {
  const { editing, get, openMedia } = useCms();
  const img = get(path) || {};
  return (
    <Photo
      src={mediaUrl(img.src)}
      alt={img.alt}
      label={img.label}
      height={img.height || height}
      tone={tone}
      className={className}
      style={style}
      onEdit={editing ? () => openMedia(path) : undefined}
    >
      {children}
    </Photo>
  );
}
