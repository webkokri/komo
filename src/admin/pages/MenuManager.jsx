import { useState } from 'react';
import { Button, Card, CardHeader, Field, Input, PageHeader, Spinner } from '../ui.jsx';
import { useGlobal } from '../data.js';

const move = (list, i, d) => {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function LinkRows({ links, onChange }) {
  const set = (i, k, v) => onChange(links.map((l, n) => (n === i ? { ...l, [k]: v } : l)));
  return (
    <div className="sc-rows">
      {links.map((l, i) => (
        <div className="sc-row" key={i}>
          <Input aria-label="Label" placeholder="Label" value={l.label} onChange={(e) => set(i, 'label', e.target.value)} />
          <Input aria-label="Link" placeholder="/page" value={l.to} onChange={(e) => set(i, 'to', e.target.value)} />
          <Button size="icon" variant="ghost" title="Move up" disabled={i === 0} onClick={() => onChange(move(links, i, -1))}>↑</Button>
          <Button size="icon" variant="ghost" title="Move down" disabled={i === links.length - 1} onClick={() => onChange(move(links, i, 1))}>↓</Button>
          <Button size="icon" variant="danger" title="Remove" onClick={() => onChange(links.filter((_, n) => n !== i))}>✕</Button>
        </div>
      ))}
      <Button size="sm" onClick={() => onChange([...links, { label: '', to: '/' }])}>+ Add link</Button>
    </div>
  );
}

export default function MenuManager() {
  const { doc, setDoc, save, error } = useGlobal();
  const [state, setState] = useState({ busy: false, error: '', saved: false });
  if (error) return <p className="sc-error">{error}</p>;
  if (!doc) return <Spinner />;

  const header = doc.header || {};
  const footer = doc.footer || {};
  const columns = footer.columns || [];
  const patch = (path, value) => {
    setState({ ...state, saved: false });
    setDoc({ ...doc, [path]: { ...doc[path], ...value } });
  };
  const setColumn = (i, value) => patch('footer', { columns: columns.map((c, n) => (n === i ? { ...c, ...value } : c)) });

  const submit = async () => {
    setState({ busy: true, error: '', saved: false });
    try {
      await save(doc);
      setState({ busy: false, error: '', saved: true });
    } catch (err) {
      setState({ busy: false, error: err.message, saved: false });
    }
  };

  return (
    <>
      <PageHeader title="Menus" description="The main navigation and footer links. Saving publishes immediately." />
      <Card>
        <CardHeader title="Main menu" description="Shown in the website header." />
        <LinkRows links={header.nav || []} onChange={(nav) => patch('header', { nav })} />
        <div className="sc-form sc-mt">
          <Field label="Header button text"><Input value={header.cta?.label || ''} onChange={(e) => patch('header', { cta: { ...header.cta, label: e.target.value } })} /></Field>
          <Field label="Header button link"><Input value={header.cta?.to || ''} onChange={(e) => patch('header', { cta: { ...header.cta, to: e.target.value } })} /></Field>
        </div>
      </Card>
      {columns.map((c, i) => (
        <Card className="sc-mt" key={i}>
          <CardHeader title={`Footer column ${i + 1}`} action={<Button size="sm" variant="danger" onClick={() => patch('footer', { columns: columns.filter((_, n) => n !== i) })}>Remove column</Button>} />
          <Field label="Column title"><Input value={c.title} onChange={(e) => setColumn(i, { title: e.target.value })} /></Field>
          <div className="sc-mt"><LinkRows links={c.links || []} onChange={(links) => setColumn(i, { links })} /></div>
        </Card>
      ))}
      <Button className="sc-mt" onClick={() => patch('footer', { columns: [...columns, { title: 'New column', links: [] }] })}>+ Add footer column</Button>
      <div className="sc-savebar">
        {state.error && <span className="sc-error" role="alert">{state.error}</span>}
        {state.saved && <span className="sc-ok">Published</span>}
        <Button variant="primary" onClick={submit} disabled={state.busy}>{state.busy ? 'Saving…' : 'Save and publish'}</Button>
      </div>
    </>
  );
}
