import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderPlus, FilePlus, ArrowUpAZ, ArrowDownAZ, Search, Grid3x3, List } from 'lucide-react';
import type { ListViewMode } from '@/hooks/useUIState';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

interface ListViewHeaderProps {
  onNewNote: () => void;
  onCreateFolder: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  isSearching: boolean;
  listViewMode: ListViewMode;
  onToggleListViewMode: () => void;
}

export const ListViewHeader: React.FC<ListViewHeaderProps> = ({
  onNewNote,
  onCreateFolder,
  searchQuery,
  onSearchQueryChange,
  sortOrder,
  onSortOrderChange,
  isSearching,
  listViewMode,
  onToggleListViewMode,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
          <Button onClick={onNewNote} variant="outline" size="icon" title="Create New Note">
            <FilePlus />
          </Button>
          <Button onClick={onCreateFolder} variant="outline" size="icon" title="Create Folder">
            <FolderPlus />
          </Button>
      </div>
      <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
              type="text"
              placeholder={isMobile ? "Search" : "Search by title, content, tags, or ID..."}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-10 w-full"
          />
      </div>
      <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            disabled={isSearching}
            title={`Sort by title: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}. Click to toggle.`}
          >
            {sortOrder === 'asc' ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleListViewMode}
            title={`Switch to ${listViewMode === 'list' ? 'card' : 'list'} view`}
          >
            {listViewMode === 'list' ? <Grid3x3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
      </div>
    </div>
  );
};
