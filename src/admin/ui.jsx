import { Link } from 'react-router-dom';

export const cx = (...parts) => parts.filter(Boolean).join(' ');

export function Button({ variant = 'secondary', size = 'md', className, ...props }) {
  return <button className={cx('sc-btn', `sc-btn--${variant}`, `sc-btn--${size}`, className)} {...props} />;
}

export function LinkButton({ variant = 'secondary', size = 'md', className, ...props }) {
  const Tag = props.to ? Link : 'a';
  return <Tag className={cx('sc-btn', `sc-btn--${variant}`, `sc-btn--${size}`, className)} {...props} />;
}

export const Input = (props) => <input {...props} className={cx('sc-control', props.className)} />;
export const Textarea = (props) => <textarea {...props} className={cx('sc-control', 'sc-textarea', props.className)} />;
export const Select = (props) => <select {...props} className={cx('sc-control', props.className)} />;

export function Field({ label, help, error, children, className }) {
  return (
    <label className={cx('sc-field', className)}>
      {label && <span className="sc-label">{label}</span>}
      {children}
      {error ? <span className="sc-error">{error}</span> : help ? <span className="sc-help">{help}</span> : null}
    </label>
  );
}

export const Card = ({ className, ...props }) => <div className={cx('sc-card', className)} {...props} />;

export function CardHeader({ title, description, action }) {
  return (
    <div className="sc-cardhead">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <header className="sc-pagehead">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="sc-actions">{actions}</div>}
    </header>
  );
}

export function StatTile({ label, value, hint, to }) {
  const body = (
    <>
      <span className="sc-label">{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </>
  );
  return to ? <Link to={to} className="sc-stat sc-stat--link">{body}</Link> : <div className="sc-stat">{body}</div>;
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="sc-empty">
      <p>{title}</p>
      {children && <small>{children}</small>}
      {action}
    </div>
  );
}

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="sc-spinner"><span />{label}</div>
);

export const Badge = ({ tone = 'neutral', children }) => <span className={cx('sc-badge', `sc-badge--${tone}`)}>{children}</span>;

export const Notice = ({ tone = 'info', children }) => <div className={cx('sc-notice', `sc-notice--${tone}`)}>{children}</div>;

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
