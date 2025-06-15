
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export const DocsLink = () => (
  <Button variant="ghost" size="icon" asChild>
    <Link to="/docs" aria-label="Documentation">
      <BookOpen className="h-5 w-5" />
    </Link>
  </Button>
);
