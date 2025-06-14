
import { ThemeToggle } from '@/components/ThemeToggle';

export const AppHeader = () => (
  <header className="mb-8 relative text-center">
    <h1 className="text-4xl font-bold text-primary tracking-wide">
      Zettelkasten Notes
    </h1>
    <div className="absolute top-0 right-0">
      <ThemeToggle />
    </div>
  </header>
);
