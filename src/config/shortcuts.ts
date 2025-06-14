
import { Note } from "@/types";

export type ShortcutAction = 'toggleCommandMenu' | 'newNote' | 'selectAll' | 'escape' | 'openShortcuts';

export interface Shortcut {
  id: string;
  command: string;
  keys: string;
  actionName: ShortcutAction;
}

export const shortcuts: Shortcut[] = [
  { id: 'toggle-command-menu', command: 'Open command menu', keys: '⌘ K', actionName: 'toggleCommandMenu' },
  { id: 'new-note', command: 'New note', keys: '⌘ N', actionName: 'newNote' },
  { id: 'select-all', command: 'Select all notes', keys: '⌘ A', actionName: 'selectAll' },
  { id: 'escape', command: 'Deselect / Go back', keys: 'Esc', actionName: 'escape' },
  { id: 'open-shortcuts', command: 'Open shortcuts', keys: '⌘ /', actionName: 'openShortcuts' },
];
