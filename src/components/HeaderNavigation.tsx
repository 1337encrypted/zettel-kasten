
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderNavigationProps {
  viewMode?: 'list' | 'edit' | 'preview';
  onBackToList?: () => void;
  onNavigateUp?: () => void;
  isAtRoot?: boolean;
}

export const HeaderNavigation = ({
  viewMode,
  onBackToList,
  onNavigateUp,
  isAtRoot,
}: HeaderNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const showNavBackButton = location.pathname !== '/';

  if (viewMode && viewMode !== 'list' && onBackToList) {
    return (
      <Button onClick={onBackToList} variant="outline" size="icon" aria-label="Back to list">
        <ArrowLeft />
      </Button>
    );
  }

  if (onNavigateUp) {
    return (
      <Button onClick={onNavigateUp} variant="outline" size="icon" aria-label="Up a level">
        <ArrowLeft />
      </Button>
    );
  }

  if (isAtRoot) {
    return (
      <Button onClick={() => navigate('/')} variant="outline" size="icon" aria-label="Go to Homepage">
        <Home />
      </Button>
    );
  }

  if (showNavBackButton) {
    return (
      <Button onClick={() => navigate(-1)} variant="outline" size="icon" aria-label="Go back">
        <ArrowLeft />
      </Button>
    );
  }

  return null;
};
