import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../cms/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.getSession().then(setUser).catch(() => setUser(null)).finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async (email, password) => setUser(await api.login(email, password)), []);
  const signOut = useCallback(async () => {
    await api.logout().catch(() => {});
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, ready, signIn, signOut }}>{children}</AuthContext.Provider>;
}
