import React, { useEffect, useState } from 'react';
import { AuthContext } from './auth-context';
import type { User } from './auth-context';


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/me`, {
        credentials: 'include',
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user ?? data);
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
      await fetch(`${import.meta.env.VITE_API_URL || ''}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
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
