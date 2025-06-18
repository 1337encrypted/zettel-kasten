
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { DocsLink } from './DocsLink';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HomeHeaderProps {
  onBackToList?: () => void;
  onNavigateUp?: () => void;
  showHomeButton?: boolean;
}

export const HomeHeader = ({ onBackToList, onNavigateUp, showHomeButton }: HomeHeaderProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDocsPage = location.pathname === '/docs';

  const renderNavigationButton = () => {
    if (onBackToList) {
      return (
        <Button onClick={onBackToList} variant="outline" size="icon" aria-label="Back to list">
          <ArrowLeft />
        </Button>
      );
    } else if (onNavigateUp) {
      return (
        <Button onClick={onNavigateUp} variant="outline" size="icon" aria-label="Up a level">
          <ArrowLeft />
        </Button>
      );
    } else if (showHomeButton) {
      return (
        <Button onClick={() => navigate('/')} variant="outline" size="icon" aria-label="Go to Homepage">
          <Home />
        </Button>
      );
    } else if (location.pathname !== '/') {
      return (
        <Button onClick={() => navigate(-1)} variant="outline" size="icon" aria-label="Go back">
          <ArrowLeft />
        </Button>
      );
    }
    return null;
  };

  return (
    <header className="mb-8 flex items-center justify-between relative h-10">
      <div className="w-1/3 flex items-center gap-2">
        {renderNavigationButton()}
        {!isDocsPage && <DocsLink />}
      </div>
      
      <div className="w-1/3 text-center">
        <Link to={user && user.id ? '/dashboard' : '/'} className="inline-flex items-center justify-center gap-3 text-foreground hover:text-primary transition-colors">
          <span className="text-4xl sm:text-3xl font-bold tracking-wide font-mono">Zet</span>
        </Link>
      </div>
      
      <div className="w-1/3 flex justify-end items-center gap-2">
        <ThemeToggle />
        {user && user.id && location.pathname !== '/dashboard' && (
          <Button asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        )}
        {(!user || !user.id) && location.pathname !== '/auth' && (
           <Button asChild>
            <Link to="/auth">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
};
