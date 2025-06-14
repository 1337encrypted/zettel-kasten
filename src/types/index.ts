
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}
