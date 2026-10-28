import { useState } from 'react';
import { mediaUrl } from '../api.js';
import { clone, move } from '../path.js';
import { useCms } from '../store.jsx';

const itemTitle = (item, key) => {
  const v = item?.[key];
  return (typeof v === 'string' && v.trim()) || 'Untitled';
};

function Label({ children, hint }) {
  return (
    <span className="cms-label">
      {children}
      {hint ? <small>{hint}</small> : null}
    </span>
  );
}

function TextInput({ path, label, multiline, ...rest }) {
  const { get, set } = useCms();
  const value = get(path) ?? '';
  return (
    <label className="cms-field">
      <Label>{label}</Label>
      {multiline ? (
        <textarea rows={4} value={value} onChange={(e) => set(path, e.target.value)} {...rest} />
      ) : (
        <input type="text" value={value} onChange={(e) => set(path, e.target.value)} {...rest} />
      )}
    </label>
  );
}

function UrlInput({ path, label }) {
  const { get, set } = useCms();
  return (
    <label className="cms-field">
      <Label hint="page address, https://… or #anchor">{label}</Label>
      <input type="text" list="cms-links" value={get(path) ?? ''} onChange={(e) => set(path, e.target.value)} />
    </label>
  );
}

function LinkField({ path, label }) {
  return (
    <fieldset className="cms-group">
      <legend>{label}</legend>
      <TextInput path={`${path}.label`} label="Text" />
      <UrlInput path={`${path}.to`} label="Goes to" />
    </fieldset>
  );
}

function ImageField({ path, label }) {
  const { get, set, update, openMedia } = useCms();
  const img = get(path) || {};
  return (
    <div className="cms-field">
      <Label>{label}</Label>
      <div className="cms-image">
        <div className="cms-image__thumb">
          {img.src ? <img src={mediaUrl(img.src)} alt="" /> : <span>{img.label || 'No image'}</span>}
        </div>
        <div className="cms-image__actions">
          <button type="button" className="cms-btn" onClick={() => openMedia(path)}>{img.src ? 'Change image' : 'Choose image'}</button>
          {img.src ? <button type="button" className="cms-btn cms-btn--quiet" onClick={() => update(path, (v) => ({ ...v, src: '', alt: '' }))}>Remove</button> : null}
        </div>
      </div>
      <TextInput path={`${path}.alt`} label="Alt text (describes the image)" />
      <label className="cms-field">
        <Label hint="optional">Height in pixels</Label>
        <input
          type="number"
          min="120"
          value={img.height ?? ''}
          onChange={(e) => set(`${path}.height`, e.target.value ? Number(e.target.value) : undefined)}
        />
      </label>
    </div>
  );
}

function ImageUrlField({ path, label }) {
  const { get, set, openMedia } = useCms();
  const value = get(path) || '';
  return (
    <div className="cms-field">
      <Label>{label}</Label>
      <div className="cms-image">
        <div className="cms-image__thumb">{value ? <img src={mediaUrl(value)} alt="" /> : <span>None</span>}</div>
        <div className="cms-image__actions">
          <button type="button" className="cms-btn" onClick={() => openMedia(path, 'url')}>{value ? 'Change' : 'Choose image'}</button>
          {value ? <button type="button" className="cms-btn cms-btn--quiet" onClick={() => set(path, '')}>Remove</button> : null}
        </div>
      </div>
    </div>
  );
}

function StringsField({ path, def }) {
  const { get, update } = useCms();
  const items = get(path) || [];
  return (
    <div className="cms-field">
      <Label>{def.label}</Label>
      <ul className="cms-strings">
        {items.map((_, i) => (
          <li key={i}>
            <TextInput path={`${path}.${i}`} label={`#${i + 1}`} multiline={def.multiline} />
            <div className="cms-row-actions">
              <button type="button" title="Move up" disabled={i === 0} onClick={() => update(path, (l) => move(l, i, i - 1))}>↑</button>
              <button type="button" title="Move down" disabled={i === items.length - 1} onClick={() => update(path, (l) => move(l, i, i + 1))}>↓</button>
              <button type="button" title="Remove" onClick={() => update(path, (l) => l.filter((__, n) => n !== i))}>✕</button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="cms-btn" onClick={() => update(path, (l = []) => [...l, def.newItem ?? ''])}>+ Add</button>
    </div>
  );
}

function ListField({ path, def }) {
  const { get, update } = useCms();
  const items = get(path) || [];
  const [open, setOpen] = useState(0);
  return (
    <div className="cms-field">
      <Label>{def.label} <small>({items.length})</small></Label>
      <ul className="cms-list">
        {items.map((item, i) => (
          <li key={i} className={open === i ? 'is-open' : ''}>
            <div className="cms-list__head">
              <button type="button" className="cms-list__title" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span aria-hidden="true">{open === i ? '▾' : '▸'}</span> {itemTitle(item, def.itemLabel)}
              </button>
              <div className="cms-row-actions">
                <button type="button" title="Move up" disabled={i === 0} onClick={() => { update(path, (l) => move(l, i, i - 1)); setOpen(i - 1); }}>↑</button>
                <button type="button" title="Move down" disabled={i === items.length - 1} onClick={() => { update(path, (l) => move(l, i, i + 1)); setOpen(i + 1); }}>↓</button>
                <button type="button" title="Duplicate" onClick={() => update(path, (l) => { const c = [...l]; c.splice(i + 1, 0, clone(l[i])); return c; })}>⧉</button>
                <button type="button" title="Remove" onClick={() => window.confirm('Remove this item?') && update(path, (l) => l.filter((__, n) => n !== i))}>✕</button>
              </div>
            </div>
            {open === i && <div className="cms-list__body"><FieldEditor fields={def.fields} base={`${path}.${i}`} /></div>}
          </li>
        ))}
      </ul>
      <button type="button" className="cms-btn" onClick={() => { update(path, (l = []) => [...l, clone(def.newItem)]); setOpen(items.length); }}>+ Add {def.label.toLowerCase().replace(/s$/, '')}</button>
    </div>
  );
}

function Toggle({ path, label }) {
  const { get, set } = useCms();
  return (
    <label className="cms-check">
      <input type="checkbox" checked={!!get(path)} onChange={(e) => set(path, e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Select({ path, def }) {
  const { get, set } = useCms();
  return (
    <label className="cms-field">
      <Label>{def.label}</Label>
      <select value={get(path) ?? ''} onChange={(e) => set(path, e.target.value)}>
        {def.options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </label>
  );
}

function NumberInput({ path, label }) {
  const { get, set } = useCms();
  return (
    <label className="cms-field">
      <Label>{label}</Label>
      <input type="number" min="0" value={get(path) ?? ''} onChange={(e) => set(path, e.target.value === '' ? 0 : Number(e.target.value))} />
    </label>
  );
}

/** Renders form controls for a list of field definitions, bound to the object at `base`. */
export function FieldEditor({ fields, base }) {
  return fields.map((def) => {
    const path = `${base}.${def.key}`;
    switch (def.type) {
      case 'text': return <TextInput key={def.key} path={path} label={def.label} />;
      case 'textarea': return <TextInput key={def.key} path={path} label={def.label} multiline />;
      case 'url': return <UrlInput key={def.key} path={path} label={def.label} />;
      case 'link': return <LinkField key={def.key} path={path} label={def.label} />;
      case 'image': return <ImageField key={def.key} path={path} label={def.label} />;
      case 'imageUrl': return <ImageUrlField key={def.key} path={path} label={def.label} />;
      case 'select': return <Select key={def.key} path={path} def={def} />;
      case 'toggle': return <Toggle key={def.key} path={path} label={def.label} />;
      case 'number': return <NumberInput key={def.key} path={path} label={def.label} />;
      case 'strings': return <StringsField key={def.key} path={path} def={def} />;
      case 'list': return <ListField key={def.key} path={path} def={def} />;
      default: return null;
    }
  });
}
