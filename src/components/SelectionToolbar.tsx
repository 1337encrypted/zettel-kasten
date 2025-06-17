
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, FolderOpen } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

interface SelectionToolbarProps {
  numSelected: number;
  allNotesSelected: boolean;
  onSelectAll: () => void;
  onBulkDeleteNotes: () => void;
  onMoveNotes: () => void;
  canSelectAny: boolean;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  numSelected,
  allNotesSelected,
  onSelectAll,
  onBulkDeleteNotes,
  onMoveNotes,
  canSelectAny,
}) => {
  return (
    <div className="flex items-center justify-between p-2 px-4 border rounded-lg bg-secondary/30 font-mono">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={allNotesSelected}
          onCheckedChange={onSelectAll}
          aria-label="Select all notes"
          disabled={!canSelectAny}
        />
        <span className="text-sm text-muted-foreground">{numSelected} selected</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onMoveNotes} disabled={numSelected === 0}>
          <FolderOpen className="h-4 w-4 mr-2" />
          Move
        </Button>
        <Button variant="destructive" size="sm" onClick={onBulkDeleteNotes} disabled={numSelected === 0}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};
