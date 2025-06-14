import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Trash2, Archive, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const AppHeader = ({
  onExportAllNotes,
  viewMode,
  onBackToList
}: {
  onExportAllNotes?: () => void;
  viewMode?: 'list' | 'edit' | 'preview';
  onBackToList?: () => void;
}) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.functions.invoke('delete-user');
      if (error) throw error;
      toast.success("Your account has been successfully deleted.");
      signOut();
    } catch (error: any) {
      toast.error(`Failed to delete account: ${error.message}`);
    }
  };

  const showNavBackButton = location.pathname !== '/';

  return (
    <header className="mb-8 flex items-center justify-between relative h-10">
      <div className="w-1/3 flex items-center gap-2">
        {viewMode && viewMode !== 'list' && onBackToList ? (
          <Button onClick={onBackToList} variant="outline" size="icon" aria-label="Back to list">
            <ArrowLeft />
          </Button>
        ) : showNavBackButton && (
          <Button onClick={() => navigate(-1)} variant="outline" size="icon" aria-label="Go back">
            <ArrowLeft />
          </Button>
        )}
        {user ? (
          <>
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Account</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onExportAllNotes} className="cursor-pointer" disabled={!onExportAllNotes}>
                    <Archive className="mr-2 h-4 w-4" />
                    <span>Export All Notes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete Account</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all of your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
        <Link to="/" className="inline-flex items-center justify-center gap-3 text-foreground hover:text-primary transition-colors">
          <span className="text-4xl font-bold tracking-wide">Zet</span>
        </Link>
      </div>
      
      <div className="w-1/3 flex justify-end">
        <ThemeToggle />
      </div>
    </header>
  );
};
