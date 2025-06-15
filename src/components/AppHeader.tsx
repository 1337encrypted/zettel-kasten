import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { ShortcutCheatSheet } from './ShortcutCheatSheet';
import { UserMenu } from './UserMenu';
import { HeaderNavigation } from './HeaderNavigation';

export const AppHeader = ({
  onExportAllNotes,
  viewMode,
  onBackToList,
  cheatSheetOpen,
  onCheatSheetOpenChange,
  onNavigateUp,
}: {
  onExportAllNotes?: () => void;
  viewMode?: 'list' | 'edit' | 'preview';
  onBackToList?: () => void;
  cheatSheetOpen?: boolean;
  onCheatSheetOpenChange?: (open: boolean) => void;
  onNavigateUp?: () => void;
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const isAtRootOfNotes = !onNavigateUp && (location.pathname === '/dashboard' || location.pathname.startsWith('/u/'));

  return (
    <header className="mb-8 flex items-center justify-between relative h-10">
      <div className="w-1/3 flex items-center gap-2">
        <HeaderNavigation
          viewMode={viewMode}
          onBackToList={onBackToList}
          onNavigateUp={onNavigateUp}
          isAtRoot={isAtRootOfNotes}
        />
        {user ? (
          <>
            <UserMenu
              onExportAllNotes={onExportAllNotes}
              onCheatSheetOpenChange={onCheatSheetOpenChange}
            />
            {location.pathname !== '/dashboard' && (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            )}
          </>
        ) : (
           location.pathname !== '/auth' && (
             <Button asChild variant="outline">
              <Link to="/auth">Login</Link>
            </Button>
           )
        )}
      </div>
      
      <div className="w-1/3 text-center">
        {user ? (
          <Link to="/dashboard" className="inline-flex items-center justify-center gap-3 text-foreground hover:text-primary transition-colors">
            <span className="text-4xl font-bold tracking-wide">{user.user_metadata.username || 'Zet'}</span>
          </Link>
        ) : (
          <Link to="/" className="inline-flex items-center justify-center gap-3 text-foreground hover:text-primary transition-colors">
            <span className="text-4xl font-bold tracking-wide">Zet</span>
          </Link>
        )}
      </div>
      
      <div className="w-1/3 flex justify-end items-center gap-2">
        <ThemeToggle />
      </div>
      {onCheatSheetOpenChange && <ShortcutCheatSheet open={!!cheatSheetOpen} onOpenChange={onCheatSheetOpenChange} />}
    </header>
  );
};
