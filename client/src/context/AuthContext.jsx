import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = session check in progress, null = not logged in, object = logged in
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    api.get('/auth/me')
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const login = (email, password) =>
    api.post('/auth/login', { email, password }).then(d => setUser(d.user));

  const signup = (formData) =>
    api.post('/auth/signup', formData).then(d => setUser(d.user));

  const logout = () =>
    api.post('/auth/logout').then(() => setUser(null));

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
