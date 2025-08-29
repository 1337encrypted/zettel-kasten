# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Zettelkasten note-taking application built with React, TypeScript, and Supabase. It supports hierarchical folder structures, markdown notes with math/mermaid rendering, voice assistant integration, and public/private sharing.

## Common Commands

- **Development**: `npm run dev` (starts dev server on port 8080)
- **Build**: `npm run build` (production build)
- **Build (dev mode)**: `npm run build:dev` (development build)
- **Lint**: `npm run lint` (ESLint with TypeScript support)
- **Preview**: `npm run preview` (preview production build)

## Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** as build tool
- **TanStack Query** for data fetching/caching
- **React Router** for routing
- **shadcn/ui** + Radix UI components
- **Tailwind CSS** for styling
- **next-themes** for dark/light mode

### Backend
- **Supabase** for database, auth, and edge functions
- **PostgreSQL** with vector embeddings for semantic search
- **Row Level Security (RLS)** for data access control

### Key Architectural Patterns

1. **Hooks-based architecture**: Business logic is organized into custom hooks in `/src/hooks/`
2. **Centralized app logic**: `useAppLogic` hook orchestrates all major application state and handlers
3. **Component composition**: UI components are highly composable using shadcn/ui patterns
4. **Type-safe database**: Auto-generated types from Supabase schema in `/src/integrations/supabase/types.ts`

### Core Data Model

- **Notes**: Hierarchical notes with markdown content, tags, public/private visibility, and slugs
- **Folders**: Nested folder structure for organizing notes
- **Profiles**: User profiles with optional usernames and public visibility

### File Structure

- `/src/pages/`: Route components (Index, Home, Auth, Admin, etc.)
- `/src/components/`: Reusable UI components
- `/src/hooks/`: Custom hooks for business logic
- `/src/context/`: React context providers (Auth)
- `/src/integrations/supabase/`: Database client and types
- `/src/types/`: TypeScript type definitions
- `/supabase/`: Database migrations and edge functions

### State Management

The app uses a hooks-based state management pattern:
- `useAppLogic`: Main orchestrator hook that combines all app functionality
- `useCoreAppState`: Core application state (selected note, view mode, current folder)
- `useNotes`/`useFolders`: Data hooks for CRUD operations
- `useUIState`: UI state like modals and command menu
- `useUrlSync`: Synchronizes app state with URL parameters

### Key Features

- **Dual view modes**: List view and detail view for notes
- **Markdown rendering**: Full markdown support with KaTeX math and Mermaid diagrams
- **Search and filtering**: Full-text search with sort options
- **Bulk operations**: Multi-select notes for bulk delete/move
- **Public sharing**: Notes and folders can be made public with custom slugs
- **Import/Export**: Support for importing files and exporting notes

### Development Notes

- Uses `@` alias for src imports (configured in vite.config.ts)
- ESLint configured with React hooks rules
- shadcn/ui components are in `/src/components/ui/`
- Database schema changes require Supabase migrations in `/supabase/migrations/`
- No test framework is currently configured in the project