import { useEffect, useState } from 'react';
import { deleteMedia, listMedia, mediaUrl, uploadMedia } from '../api.js';
import { useCms } from '../store.jsx';

/** Modal for choosing or uploading an image. Writes into the field that opened it. */
export default function MediaPicker() {
  const { ui, closeMedia, get, update, set } = useCms();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');
  const target = ui.media;

  useEffect(() => {
    if (!target) return;
    setError('');
    listMedia().then(setItems).catch((e) => setError(e.message));
  }, [target]);

  useEffect(() => {
    if (!target) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeMedia();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [target, closeMedia]);

  if (!target) return null;
  const current = target.mode === 'url' ? get(target.path) : get(target.path)?.src;

  const choose = (src, alt = '') => {
    if (target.mode === 'url') set(target.path, src);
    else update(target.path, (img = {}) => ({ ...img, src, alt: img.alt || alt }));
    closeMedia();
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const media = await uploadMedia(file);
      setItems((list) => [media, ...(list || [])]);
      choose(media.url, media.alt);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.name || 'this image'} from the library? Pages using it will show a broken image.`)) return;
    await deleteMedia(item.id).catch((err) => setError(err.message));
    setItems((list) => list.filter((m) => m.id !== item.id));
  };

  return (
    <div className="cms-ui cms-modal" role="dialog" aria-modal="true" aria-label="Choose an image" onClick={closeMedia}>
      <div className="cms-modal__box" onClick={(e) => e.stopPropagation()}>
        <header className="cms-modal__head">
          <h2>Choose an image</h2>
          <button type="button" className="cms-icon-btn" onClick={closeMedia} aria-label="Close">✕</button>
        </header>
        <div className="cms-modal__tools">
          <label className="cms-btn cms-btn--primary">
            {busy ? 'Uploading…' : 'Upload new image'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={onFile} hidden disabled={busy} />
          </label>
          <form className="cms-modal__url" onSubmit={(e) => { e.preventDefault(); if (url.trim()) choose(url.trim()); }}>
            <input type="url" placeholder="…or paste an image address" value={url} onChange={(e) => setUrl(e.target.value)} />
            <button type="submit" className="cms-btn">Use</button>
          </form>
        </div>
        {error ? <p className="cms-error" role="alert">{error}</p> : null}
        <div className="cms-modal__grid">
          {items === null && !error ? <p>Loading…</p> : null}
          {items?.length === 0 ? <p>No images yet. Upload one to get started.</p> : null}
          {items?.map((m) => (
            <div key={m.id} className={`cms-thumb ${current === m.url ? 'is-current' : ''}`}>
              <button type="button" onClick={() => choose(m.url, m.alt)} title={m.name}>
                <img src={mediaUrl(m.url)} alt={m.alt || m.name || ''} loading="lazy" />
              </button>
              <button type="button" className="cms-thumb__del" onClick={() => remove(m)} aria-label={`Delete ${m.name}`}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
