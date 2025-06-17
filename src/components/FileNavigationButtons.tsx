
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FileNavigationButtonsProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const FileNavigationButtons: React.FC<FileNavigationButtonsProps> = ({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}) => {
  return (
    <>
      {hasPrevious && (
        <Button
          variant="outline"
          size="icon"
          title="Previous file (h)"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      {hasNext && (
        <Button
          variant="outline"
          size="icon"
          title="Next file (l)"
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </>
  );
};
