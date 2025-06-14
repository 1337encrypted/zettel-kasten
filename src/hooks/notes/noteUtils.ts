
import { Note } from '@/types';

export const fromNoteDb = (dbNote: any): Note => ({
    id: dbNote.id,
    title: dbNote.title,
    content: dbNote.content || '',
    createdAt: new Date(dbNote.created_at),
    updatedAt: new Date(dbNote.updated_at),
    folderId: dbNote.folder_id,
    tags: dbNote.tags || [],
});

export const getFilePathsFromContent = (content: string): string[] => {
    if (!content) return [];
    const imageUrls = Array.from(content.matchAll(/!\[.*?\]\((.*?)\)/g), m => m[1]);
    const supabaseUrlPart = `storage/v1/object/public/note-images/`;
    return imageUrls
        .filter(url => url.includes(supabaseUrlPart))
        .map(url => url.substring(url.indexOf(supabaseUrlPart) + supabaseUrlPart.length));
};
