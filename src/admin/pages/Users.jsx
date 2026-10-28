import { useCallback, useEffect, useState } from 'react';
import { createUser, deleteUser, listUsers, updateUser } from '../../cms/api.js';
import { useAuth } from '../auth.jsx';
import { Badge, Button, Card, Field, Input, PageHeader, Select, Spinner, formatDate } from '../ui.jsx';

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', name: '', role: 'editor', password: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => listUsers().then(setUsers).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await createUser(form);
      setForm({ email: '', name: '', role: 'editor', password: '' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const act = async (fn) => {
    setError('');
    try { await fn(); await load(); } catch (err) { setError(err.message); }
  };

  const resetPassword = (u) => {
    const password = window.prompt(`New password for ${u.email} (at least 8 characters)`);
    if (password) act(() => updateUser(u.id, { password }));
  };

  if (me.role !== 'admin') return <p className="sc-error">Only admins can manage users.</p>;

  return (
    <>
      <PageHeader title="Users" description="People who can sign in to Studio CMS. Admins manage users; editors manage content." />
      {error && <p className="sc-error" role="alert">{error}</p>}
      {!users ? <Spinner /> : (
        <div className="sc-tablewrap">
          <table className="sc-table">
            <thead><tr><th>User</th><th>Role</th><th>Created</th><th /></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.name || u.email}</strong><small className="sc-block">{u.email}</small></td>
                  <td>
                    <Select value={u.role} disabled={u.id === me.id} onChange={(e) => act(() => updateUser(u.id, { role: e.target.value }))} aria-label={`Role for ${u.email}`}>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                    </Select>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td className="sc-right">
                    {u.id === me.id && <Badge>You</Badge>}{' '}
                    <Button size="sm" onClick={() => resetPassword(u)}>Reset password</Button>{' '}
                    {u.id !== me.id && <Button size="sm" variant="danger" onClick={() => window.confirm(`Delete ${u.email}?`) && act(() => deleteUser(u.id))}>Delete</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Card className="sc-mt">
        <h2 className="sc-sub">Add a user</h2>
        <form className="sc-form" onSubmit={add}>
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
          <Field label="Password" help="At least 8 characters."><Input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          <Button type="submit" variant="primary" disabled={busy}>{busy ? 'Adding…' : 'Add user'}</Button>
        </form>
      </Card>
    </>
  );
}
