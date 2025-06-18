
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { ShortcutCheatSheet } from './ShortcutCheatSheet';
import { UserMenu } from './UserMenu';
import { HeaderNavigation } from './HeaderNavigation';
import { Folder, Profile } from '@/types';
import { DocsLink } from './DocsLink';

export const AppHeader = ({
  onExportAllNotes,
  viewMode,
  onBackToList,
  cheatSheetOpen,
  onCheatSheetOpenChange,
  onNavigateUp,
  profile,
  currentFolder,
  onUpdateFolder,
  isFolderUpdating,
}: {
  onExportAllNotes?: () => void;
  viewMode?: 'list' | 'edit' | 'preview';
  onBackToList?: () => void;
  cheatSheetOpen?: boolean;
  onCheatSheetOpenChange?: (open: boolean) => void;
  onNavigateUp?: () => void;
  profile?: Profile | null;
  currentFolder?: Folder | null;
  onUpdateFolder?: (folderData: Pick<Folder, 'id'> & Partial<Pick<Folder, 'isPublic'>>) => void;
  isFolderUpdating?: boolean;
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const isAtRootOfNotes = !onNavigateUp && (location.pathname === '/dashboard' || location.pathname.startsWith('/u/'));
  const isDocsPage = location.pathname === '/docs';

  return (
    <header className="mb-8 flex items-center justify-between relative h-10">
      <div className="w-1/3 flex items-center gap-2">
        <HeaderNavigation
          viewMode={viewMode}
          onBackToList={onBackToList}
          onNavigateUp={onNavigateUp}
          isAtRoot={isAtRootOfNotes}
        />
        {user && user.id && (
          <UserMenu
            onExportAllNotes={onExportAllNotes}
            onCheatSheetOpenChange={onCheatSheetOpenChange}
          />
        )}
        {!isDocsPage && <DocsLink />}
      </div>
      
      <div className="w-1/3 text-center">
        <Link to={user && user.id ? '/dashboard' : '/'} className="inline-flex items-center justify-center gap-3 text-foreground hover:text-primary transition-colors">
          <span className="text-4xl sm:text-3xl font-bold tracking-wide font-mono">Zet</span>
        </Link>
      </div>
      
      <div className="w-1/3 flex justify-end items-center gap-2">
        <ThemeToggle />
        {user && user.id && !currentFolder && location.pathname !== '/dashboard' && (
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
      {onCheatSheetOpenChange && <ShortcutCheatSheet open={!!cheatSheetOpen} onOpenChange={onCheatSheetOpenChange} />}
    </header>
  );
};
