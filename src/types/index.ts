export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  folderId?: string;
  isPublic?: boolean;
  slug?: string;
  userId?: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
  parentId?: string | null;
  isPublic?: boolean;
  slug?: string;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  is_public: boolean;
}
