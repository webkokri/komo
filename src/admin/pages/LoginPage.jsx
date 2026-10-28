import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { Button, Field, Input } from '../ui.jsx';

export default function LoginPage() {
  const { user, ready, signIn } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(form.email, form.password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="sc-center">
      <form className="sc-login" onSubmit={submit}>
        <div className="sc-brand"><span>SC</span><strong>Studio CMS</strong></div>
        <h1>Sign in</h1>
        <p>Manage the KOMOREBI website.</p>
        <Field label="Email"><Input type="email" autoComplete="email" required autoFocus value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password"><Input type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        {error && <p className="sc-error" role="alert">{error}</p>}
        <Button type="submit" variant="primary" disabled={busy || !ready}>{busy ? 'Signing in…' : 'Sign in'}</Button>
      </form>
    </div>
  );
}
