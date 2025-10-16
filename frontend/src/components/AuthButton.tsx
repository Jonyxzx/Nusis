import React from 'react';
import { useAuth } from '@/lib/useAuth';
import { Button } from '@/components//ui/button';
import GoogleIcon from '@/components/ui/google-icon';

export const LoginButton: React.FC = () => {
  const { login, loading } = useAuth();
  return (
    <Button onClick={login} disabled={loading} className='btn btn-primary' aria-label="Sign in with Google">
      <GoogleIcon />
      Sign in
    </Button>
  );
};

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  return (
    <Button onClick={() => void logout()} className='btn btn-secondary'>
      Sign out
    </Button>
  );
};
