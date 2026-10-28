import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteMedia, listMedia, mediaUrl, updateMedia, uploadMedia } from '../../cms/api.js';
import { Button, EmptyState, Input, PageHeader, Spinner } from '../ui.jsx';

export default function MediaLibrary() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);
  const input = useRef(null);

  const load = useCallback(() => listMedia().then(setItems).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const upload = async (files) => {
    setBusy(true);
    setError('');
    try {
      for (const file of files) await uploadMedia(file);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete ${m.name}? Pages using it will show a broken image.`)) return;
    try { await deleteMedia(m.id); await load(); } catch (err) { setError(err.message); }
  };

  const copy = async (m) => {
    await navigator.clipboard?.writeText(m.url).catch(() => {});
    setCopied(m.id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <>
      <PageHeader
        title="Media library"
        description="Images used across the website. You can also upload from the visual editor."
        actions={
          <>
            <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload([...e.target.files])} />
            <Button variant="primary" disabled={busy} onClick={() => input.current?.click()}>{busy ? 'Uploading…' : 'Upload images'}</Button>
          </>
        }
      />
      {error && <p className="sc-error" role="alert">{error}</p>}
      {!items ? <Spinner /> : items.length === 0 ? (
        <EmptyState title="No images yet">Upload JPG, PNG, WebP, GIF or AVIF files up to 10 MB.</EmptyState>
      ) : (
        <div className="sc-media">
          {items.map((m) => (
            <figure key={m.id}>
              <img src={mediaUrl(m.url)} alt={m.alt || ''} loading="lazy" />
              <figcaption>
                <strong title={m.name}>{m.name}</strong>
                <small>{Math.round(m.size / 1024)} KB</small>
                <Input
                  aria-label="Alt text"
                  placeholder="Alt text"
                  defaultValue={m.alt}
                  onBlur={(e) => e.target.value !== (m.alt || '') && updateMedia(m.id, e.target.value).catch((err) => setError(err.message))}
                />
                <div className="sc-actions">
                  <Button size="sm" onClick={() => copy(m)}>{copied === m.id ? 'Copied' : 'Copy link'}</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(m)}>Delete</Button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
