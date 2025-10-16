import React, { useEffect, useState } from 'react';
import { AuthContext } from './auth-context';
import type { User } from './auth-context';
import api from './api';


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await api.get('/api/me');
      setUser(res.data.user ?? res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = () => {
    // Navigate to backend start auth endpoint; backend will redirect to Google
    window.location.href = `${import.meta.env.VITE_API_URL || ''}/auth/google`;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

// export hook from separate file to keep this file fast-refresh friendly
