
import { Link } from 'react-router-dom';
import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { DocsLink } from './DocsLink';

export const HomeHeader = () => {
  const { user } = useAuth();

  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4">
        <div className="relative flex h-16 items-center">
          <div className="flex items-center">
            {user && (
              <UserMenu />
            )}
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link to={user ? '/dashboard' : '/'} className="text-2xl font-bold">
              Zet
            </Link>
          </div>
          <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
            <DocsLink />
            <ThemeToggle />
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/auth">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
