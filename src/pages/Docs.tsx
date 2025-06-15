
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Pencil, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const INITIAL_CONTENT = `# Zet Documentation

Welcome to Zet, your personal Zettelkasten-inspired knowledge base.

## The Idea Behind Zet

Zet was created with the vision of providing a simple, yet powerful tool for thought. The Zettelkasten method, pioneered by sociologist Niklas Luhmann, is a way of managing knowledge and producing new ideas by creating a network of interconnected notes. We wanted to bring this powerful method into the digital age in a clean, minimalist, and open way.

## Core Features

### Note Creation
You can create new notes and folders to organize your thoughts. Each note is a simple Markdown file.

### Linking Notes
Create a web of knowledge by linking notes together using the \`[[Note Title]]\` syntax. This automatically creates a connection between notes, which you can navigate.

### Folders and Visibility
Organize your notes into folders. You can set folders (and the notes within them) to be public or private.

### Markdown Support
All notes are written in Markdown, giving you flexibility in formatting your content. We support GitHub Flavored Markdown (GFM).

### Search and Tags
Quickly find what you're looking for with our powerful search. You can also add #tags to your notes for another layer of organization.

### Public/Private Access Control
Share your knowledge with the world by making notes or entire folders public. A unique URL is generated for you to share.

### Export and Backup
Your data is yours. You can export all your notes at any time to a standard format.
`;

const fetchDocs = async () => {
  const { data, error } = await supabase
    .from('documentation')
    .select('content, updated_at')
    .eq('id', 1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching docs:', error);
    throw new Error(error.message);
  }
  return data;
};

const updateDocs = async (content: string) => {
  const { data, error } = await supabase
    .from('documentation')
    .upsert({ id: 1, content, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const DocsPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const { data: docs, isLoading, isError } = useQuery({
    queryKey: ['documentation'],
    queryFn: fetchDocs,
  });

  const mutation = useMutation({
    mutationFn: updateDocs,
    onSuccess: () => {
      toast.success('Documentation updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['documentation'] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(`Failed to update documentation: ${error.message}`);
    },
  });

  const handleEditClick = () => {
    let currentContent = docs?.content || '';
    if (!currentContent || currentContent.includes('Admins can edit this content')) {
      currentContent = INITIAL_CONTENT;
    }
    setEditedContent(currentContent);
    setIsEditing(true);
  };

  const handleSave = () => {
    mutation.mutate(editedContent);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  let displayContent = docs?.content || INITIAL_CONTENT;
  if (docs?.content?.includes('Admins can edit this content')) {
      displayContent = INITIAL_CONTENT;
  }
  if (isError) {
      displayContent = '# Error\n\nCould not load documentation. Make sure the database migration has run.';
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-4 md:p-8">
      <AppHeader />
      <main className="flex-grow container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Documentation</h1>
          {isAdmin && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
                  <Button onClick={handleSave} disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                    <span className="ml-2">Save</span>
                  </Button>
                </>
              ) : (
                <Button onClick={handleEditClick} variant="outline">
                  <Pencil />
                  <span className="ml-2">Edit</span>
                </Button>
              )}
            </div>
          )}
        </div>
        
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-[60vh] font-mono"
            placeholder="Write your documentation in Markdown..."
          />
        ) : (
          <article className="max-w-none prose dark:prose-invert lg:prose-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent}
            </ReactMarkdown>
          </article>
        )}
      </main>
      <AppFooter />
    </div>
  );
};

export default DocsPage;
