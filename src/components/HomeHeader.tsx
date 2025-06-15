
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
        <div className="flex h-16 items-center justify-between">
            <Link to={user ? '/dashboard' : '/'} className="text-2xl font-bold flex items-center gap-2">
                <img src="/lovable-uploads/3d4105c3-8713-4c19-b696-105b36d2928e.png" alt="Zet logo" className="h-8 w-8" />
                <span>Zet</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <DocsLink />
                <ThemeToggle />
                {user ? (
                    <UserMenu />
                ) : (
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" asChild>
                            <Link to="/auth">Login</Link>
                        </Button>
                        <Button asChild>
                            <Link to="/auth?state=sign_up">Sign Up</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};
