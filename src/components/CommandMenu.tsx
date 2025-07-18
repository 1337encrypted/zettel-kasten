
import React from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Note, Folder } from '@/types';
import { File, Folder as FolderIcon, Moon, Sun, FilePlus, FolderPlus, CheckSquare } from 'lucide-react';
import { useTheme } from 'next-themes';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  folders: Folder[];
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
  onCreateFolder: () => void;
  onSelectFolder: (folderId: string) => void;
  onSelectAll: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  open,
  onOpenChange,
  notes,
  folders,
  onSelectNote,
  onNewNote,
  onCreateFolder,
  onSelectFolder,
  onSelectAll,
}) => {
  const { setTheme } = useTheme();

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(onNewNote)}>
            <FilePlus className="mr-2 h-4 w-4" />
            <span>New Note</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onCreateFolder)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            <span>New Folder</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onSelectAll)}>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Select All</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Theme</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Theme</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Notes">
          {notes.map((note) => (
            <CommandItem
              key={note.id}
              onSelect={() => runCommand(() => onSelectNote(note))}
              value={note.title}
            >
              <File className="mr-2 h-4 w-4" />
              <span>{note.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Folders">
          {folders.map((folder) => (
            <CommandItem
              key={folder.id}
              onSelect={() => runCommand(() => onSelectFolder(folder.id))}
              value={folder.name}
            >
              <FolderIcon className="mr-2 h-4 w-4" />
              <span>{folder.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
