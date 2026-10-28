import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminStats } from '../../cms/api.js';
import { Badge, Card, CardHeader, EmptyState, LinkButton, PageHeader, Spinner, StatTile, formatDate } from '../ui.jsx';
import { useAuth } from '../auth.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { adminStats().then(setStats).catch((e) => setError(e.message)); }, []);

  return (
    <>
      <PageHeader
        title={`Welcome${user.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        description="Everything on the KOMOREBI website is managed from here."
        actions={<LinkButton variant="primary" href="/?edit=1" target="_blank" rel="noreferrer">Open visual editor</LinkButton>}
      />
      {error && <p className="sc-error">{error}</p>}
      {!stats ? <Spinner /> : (
        <>
          <div className="sc-grid sc-grid--4">
            <StatTile label="Pages" value={stats.pages} to="/pages" />
            <StatTile label="Unpublished changes" value={stats.drafts} hint="Drafts waiting to go live" to="/pages" />
            <StatTile label="Media files" value={stats.media} to="/media" />
            <StatTile label="Enquiries" value={stats.leads} hint={`${stats.unread} unread`} to="/leads" />
          </div>
          <Card className="sc-mt">
            <CardHeader title="Latest enquiries" action={<Link className="sc-link" to="/leads">View all</Link>} />
            {stats.recent.length === 0 ? (
              <EmptyState title="No enquiries yet">Messages sent through the contact form appear here.</EmptyState>
            ) : (
              <ul className="sc-list">
                {stats.recent.map((l) => (
                  <li key={l.id}>
                    <div><strong>{l.name}</strong><small>{l.email}</small></div>
                    <div className="sc-right">{!l.read && <Badge tone="info">New</Badge>}<small>{formatDate(l.created_at)}</small></div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="sc-mt">
            <CardHeader title="How editing works" />
            <ol className="sc-steps">
              <li><b>Pages</b> lists every page. Open one in the <b>visual editor</b> to click and change any text, image or section directly on the page.</li>
              <li>Changes autosave as a draft. Press <b>Publish</b> in the editor to make them live.</li>
              <li><b>Menus</b> and <b>Site settings</b> control the header, footer, contact details and colours everywhere at once.</li>
            </ol>
          </Card>
        </>
      )}
    </>
  );
}
