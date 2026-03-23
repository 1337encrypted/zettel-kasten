# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Zettelkasten note-taking application built with React, TypeScript, and Supabase. It supports hierarchical folder structures, markdown notes with math/mermaid rendering, and public/private sharing with custom slugs for both notes and folders.

## Common Commands

- **Development**: `npm run dev` (starts dev server on port 8080)
- **Build**: `npm run build` (production build)
- **Build (dev mode)**: `npm run build:dev` (development build)
- **Lint**: `npm run lint` (ESLint with TypeScript support)
- **Preview**: `npm run preview` (preview production build)

## Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** as build tool (port 8080, SWC for fast compilation)
- **TanStack Query** for data fetching/caching
- **React Router** for routing with wildcard routes for hierarchical navigation
- **shadcn/ui** + Radix UI components
- **Tailwind CSS** for styling with typography plugin
- **next-themes** for dark/light mode

### Backend
- **Supabase** for database, auth, and edge functions
- **PostgreSQL** with Row Level Security (RLS) for data access control
- **Edge Functions** for server-side operations (user validation, email checks, account deletion)

### Key Architectural Patterns

1. **Hooks-based architecture**: Business logic is organized into custom hooks in `/src/hooks/`
2. **Centralized app logic**: `useAppLogic` hook in src/hooks/useAppLogic.ts:22 orchestrates all major application state and handlers by composing 10+ specialized hooks
3. **Component composition**: UI components are highly composable using shadcn/ui patterns
4. **Type-safe database**: Auto-generated types from Supabase schema in `/src/integrations/supabase/types.ts`
5. **URL-driven state**: The `useUrlSync` hook synchronizes app state with URL parameters for deep linking and navigation

### Core Data Model

- **Notes**: Markdown content with tags, public/private visibility, custom slugs, hierarchical organization
- **Folders**: Nested folder structure with custom slugs for organizing notes
- **Profiles**: User profiles with optional usernames and public visibility settings

### URL Structure and Navigation

The app uses a hierarchical URL structure based on folder and note slugs:
- `/dashboard` - Root folder view
- `/dashboard/folder-slug/` - Folder view (trailing slash required)
- `/dashboard/folder-slug/subfolder-slug/` - Nested folder view
- `/dashboard/folder-slug/note-slug` - Note preview (no trailing slash)

The `useUrlSync` hook (src/hooks/useUrlSync.ts) handles bidirectional synchronization between URL paths and application state. It validates folder paths and note slugs, ensuring the URL always reflects a valid state.

### State Management

The app uses a hooks-based state management pattern centered around `useAppLogic`:

**Core State Hooks:**
- `useCoreAppState`: Core application state (selected note, view mode, current folder)
- `useUIState`: UI state like modals, command menu, and list/card view mode

**Data Management Hooks:**
- `useNotes` / `useFolders`: CRUD operations with TanStack Query
- `useNoteMover`: Handles moving notes between folders
- `useNoteSelection`: Manages multi-select and bulk operations

**Interaction Hooks:**
- `useNoteHandlers` / `useFolderHandlers`: Event handlers for note and folder operations
- `useKeyboardShortcuts`: Global keyboard shortcuts
- `useSearchAndSort`: Search and filtering logic
- `useUrlSync`: Synchronizes app state with URL parameters
- `usePathHelpers`: Utilities for generating folder and note paths

**Key Pattern**: All handlers and state are composed in `useAppLogic` and passed down to components, avoiding prop drilling and maintaining a clean separation of concerns.

### File Structure

- `/src/pages/`: Route components (Index, Home, Auth, Admin, UserPublicProfile, Docs, etc.)
- `/src/components/`: Reusable UI components
- `/src/components/ui/`: shadcn/ui components
- `/src/hooks/`: Custom hooks for business logic
- `/src/context/`: React context providers (AuthContext)
- `/src/integrations/supabase/`: Database client and auto-generated types
- `/src/types/`: TypeScript type definitions
- `/supabase/migrations/`: Database schema migrations (timestamped SQL files)
- `/supabase/functions/`: Edge functions for server-side operations

### Key Features

- **View modes**: Three view modes - list (folder/note browser), preview (read-only note view), and edit (note editor)
- **List/Card toggle**: Toggle between list and card view for folders and notes
- **Markdown rendering**: Full markdown support with KaTeX math rendering and Mermaid diagram support
- **Search and filtering**: Full-text search with sort options (modified date, created date, title)
- **Bulk operations**: Multi-select notes for bulk delete/move operations
- **Public sharing**: Notes and folders can be made public with custom slugs accessible at `/u/:userId/folder-slug/note-slug`
- **Import/Export**: Support for importing files and exporting notes/folders
- **Keyboard shortcuts**: Global shortcuts for navigation and common actions
- **Command menu**: CMD+K command palette for quick actions

### Development Notes

- Uses `@` alias for src imports (configured in vite.config.ts:18)
- ESLint configured with React hooks rules and TypeScript support
- Database schema changes require Supabase migrations in `/supabase/migrations/`
- No test framework is currently configured in the project
- The project uses `lovable-tagger` plugin in development mode for component tracking

### Database Schema Management

When making database changes:
1. Create a new migration file in `/supabase/migrations/` with timestamp format: `YYYYMMDDHHMMSS_description.sql`
2. Update the auto-generated types by running Supabase type generation
3. Ensure Row Level Security (RLS) policies are properly configured for new tables
4. Test migrations locally before deploying

### Edge Functions

Edge functions are located in `/supabase/functions/` and include:
- `check-user-exists` - Validate user existence
- `check-username-exists` - Check username availability
- `delete-user` - Handle user account deletion
- `get-login-email` - Retrieve login email
- `validate-email` - Email validation
- Shared CORS configuration in `shared/cors.ts`
