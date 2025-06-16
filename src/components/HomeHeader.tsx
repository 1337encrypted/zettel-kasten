import { Link } from 'react-router-dom';
import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { DocsLink } from './DocsLink';
import { ArrowLeft, Home } from 'lucide-react';
interface HomeHeaderProps {
  onBackToList?: () => void;
  onNavigateUp?: () => void;
  showHomeButton?: boolean;
}
export const HomeHeader = ({
  onBackToList,
  onNavigateUp,
  showHomeButton
}: HomeHeaderProps) => {
  const {
    user
  } = useAuth();
  return <header className="w-full border-b">
      <div className="container mx-auto px-4">
        <div className="relative flex h-16 items-center">
          <div className="flex items-center gap-2">
            {showHomeButton && <Button variant="ghost" size="icon" asChild>
                <Link to="/" aria-label="Home">
                  <Home className="h-5 w-5" />
                </Link>
              </Button>}
            {onBackToList && <Button variant="ghost" size="icon" onClick={onBackToList} aria-label="Back to list">
                <ArrowLeft className="h-5 w-5" />
              </Button>}
            {onNavigateUp && <Button variant="ghost" size="icon" onClick={onNavigateUp} aria-label="Up a level">
                <ArrowLeft className="h-5 w-5" />
              </Button>}
            {user && <UserMenu />}
            <DocsLink />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link to={user ? '/dashboard' : '/'} className="text-2xl font-bold font-mono">Zet
          </Link>
          </div>
          <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            {user ? <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button> : <Button asChild>
                <Link to="/auth">Login</Link>
              </Button>}
          </div>
        </div>
      </div>
    </header>;
};