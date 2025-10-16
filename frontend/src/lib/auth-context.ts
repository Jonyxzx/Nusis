import { createContext } from 'react';

export type User = {
  id?: string;
  email?: string;
  name?: string;
  displayName?: string;
};

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
