import { LoginButton, LogoutButton } from '@/components/AuthButton';
import { useAuth } from '@/lib/useAuth';

function AuthControls() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <LoginButton />;
  return <LogoutButton />;
}

export { AuthControls };