
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const AppHeader = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="mb-8 relative text-center">
      <h1 className="text-4xl font-bold text-primary tracking-wide">
        Zet
      </h1>
      <div className="absolute top-0 right-0 flex items-center gap-4">
        {user && (
          <Button variant="ghost" size="icon" onClick={signOut} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};
