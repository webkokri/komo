import { useEffect, useState } from 'react';
import { listPages } from '../api.js';
import { pathFor, useCms } from '../store.jsx';
import MediaPicker from './MediaPicker.jsx';
import Panel from './Panel.jsx';

/** Everything the editor adds on top of the site. Renders nothing for visitors. */
export default function Editor() {
  const { user, editing, setEditing, undo, redo, saveDraft, publish, unpublished, dirty, signOut } = useCms();
  const [links, setLinks] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle('cms-editing', editing);
    return () => document.documentElement.classList.remove('cms-editing');
  }, [editing]);

  useEffect(() => {
    if (!editing) return undefined;
    listPages().then((pages) => setLinks(pages.filter((p) => p.slug !== '_global' && p.slug !== '404').map((p) => pathFor(p.slug)))).catch(() => {});
    return undefined;
  }, [editing]);

  // Links and form submits must not navigate while editing; shortcuts mirror the panel buttons.
  useEffect(() => {
    if (!editing) return undefined;
    const block = (e) => {
      if (e.target.closest?.('.cms-ui')) return;
      const a = e.target.closest?.('a[href]');
      if (a) e.preventDefault();
    };
    const keys = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      const typing = e.target.isContentEditable || /^(input|textarea|select)$/i.test(e.target.tagName);
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); saveDraft(); }
      else if (mod && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    };
    document.addEventListener('click', block, true);
    window.addEventListener('keydown', keys);
    return () => {
      document.removeEventListener('click', block, true);
      window.removeEventListener('keydown', keys);
    };
  }, [editing, saveDraft, undo, redo]);

  if (!user) return null;

  return (
    <>
      <datalist id="cms-links">
        {links.map((l) => <option key={l} value={l} />)}
      </datalist>
      {editing ? (
        <>
          <Panel />
          <MediaPicker />
        </>
      ) : (
        <div className="cms-ui cms-dock">
          <button type="button" className="cms-btn cms-btn--primary" onClick={() => setEditing(true)}>✎ Edit page</button>
          {unpublished.length > 0 && <button type="button" className="cms-btn" onClick={publish}>Publish ({unpublished.length})</button>}
          {dirty.length > 0 && <span className="cms-dock__note">unsaved</span>}
          <button type="button" className="cms-btn cms-btn--quiet" onClick={signOut}>Log out</button>
        </div>
      )}
    </>
  );
}
