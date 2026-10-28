import { useCallback, useEffect, useState } from 'react';
import { deleteLead, listLeads, markLead } from '../../cms/api.js';
import { Badge, Button, Card, EmptyState, PageHeader, Spinner, formatDate } from '../ui.jsx';

export default function Leads() {
  const [leads, setLeads] = useState(null);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => listLeads().then(setLeads).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (l) => {
    const next = open === l.id ? null : l.id;
    setOpen(next);
    if (next && !l.read) {
      await markLead(l.id, true).catch(() => {});
      setLeads((all) => all.map((x) => (x.id === l.id ? { ...x, read: true } : x)));
    }
  };

  const remove = async (l) => {
    if (!window.confirm(`Delete the enquiry from ${l.name}?`)) return;
    try { await deleteLead(l.id); setOpen(null); await load(); } catch (err) { setError(err.message); }
  };

  return (
    <>
      <PageHeader title="Leads" description="Messages sent through the website contact form." />
      {error && <p className="sc-error" role="alert">{error}</p>}
      {!leads ? <Spinner /> : leads.length === 0 ? (
        <EmptyState title="No enquiries yet">New messages from the contact form will appear here.</EmptyState>
      ) : (
        <div className="sc-stack">
          {leads.map((l) => (
            <Card key={l.id} className={l.read ? '' : 'sc-card--unread'}>
              <button type="button" className="sc-leadhead" onClick={() => toggle(l)} aria-expanded={open === l.id}>
                <span><strong>{l.name}</strong><small>{l.email}</small></span>
                <span className="sc-right">{!l.read && <Badge tone="info">New</Badge>}<small>{formatDate(l.created_at)}</small></span>
              </button>
              {open === l.id && (
                <div className="sc-leadbody">
                  <dl>
                    {Object.entries(l.details || {}).filter(([k]) => !['name', 'email'].includes(k)).map(([k, v]) => (
                      <div key={k}><dt>{k.replace(/([A-Z])/g, ' $1')}</dt><dd>{v}</dd></div>
                    ))}
                  </dl>
                  <div className="sc-actions">
                    <Button size="sm" variant="primary" onClick={() => { window.location.href = `mailto:${l.email}`; }}>Reply by email</Button>
                    <Button size="sm" onClick={async () => { await markLead(l.id, false); setOpen(null); load(); }}>Mark unread</Button>
                    <Button size="sm" variant="danger" onClick={() => remove(l)}>Delete</Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
