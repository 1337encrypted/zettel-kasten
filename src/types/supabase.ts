export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_settings: {
        Row: {
          default_readme_content: string
          default_readme_title: string
          id: number
          updated_at: string | null
        }
        Insert: {
          default_readme_content?: string
          default_readme_title?: string
          id?: number
          updated_at?: string | null
        }
        Update: {
          default_readme_content?: string
          default_readme_title?: string
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      documentation: {
        Row: {
          content: string
          id: number
          updated_at: string | null
        }
        Insert: {
          content?: string
          id?: number
          updated_at?: string | null
        }
        Update: {
          content?: string
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          user_id: string
          is_public: boolean
          slug: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          user_id: string
          is_public?: boolean
          slug?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          user_id?: string
          is_public?: boolean
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          folder_id: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          is_public: boolean
          slug: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          is_public?: boolean
          slug?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          is_public?: boolean
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
          created_at: string
          is_public: boolean
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
          created_at?: string
          is_public?: boolean
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
          created_at?: string
          is_public?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_folders_for_user: {
        Args: {
          p_user_id: string
        }
        Returns: {
          created_at: string
          id: string
          is_public: boolean
          name: string
          parent_id: string | null
          slug: string | null
          user_id: string
        }[]
      }
      get_public_notes_for_user: {
        Args: {
          p_user_id: string
        }
        Returns: {
          content: string | null
          created_at: string
          folder_id: string | null
          id: string
          is_public: boolean
          slug: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }[]
      }
      is_admin: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
