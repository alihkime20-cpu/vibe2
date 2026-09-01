export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      article_authors: {
        Row: {
          article_id: string;
          author_id: string;
          contribution_role: string;
          created_at: string;
          sort_order: number;
        };
        Insert: {
          article_id: string;
          author_id: string;
          contribution_role?: string;
          created_at?: string;
          sort_order?: number;
        };
        Update: {
          article_id?: string;
          author_id?: string;
          contribution_role?: string;
          created_at?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "article_authors_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "article_authors_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "authors";
            referencedColumns: ["id"];
          },
        ];
      };
      article_categories: {
        Row: {
          article_id: string;
          category_id: string;
          created_at: string;
          is_primary: boolean;
          sort_order: number;
        };
        Insert: {
          article_id: string;
          category_id: string;
          created_at?: string;
          is_primary?: boolean;
          sort_order?: number;
        };
        Update: {
          article_id?: string;
          category_id?: string;
          created_at?: string;
          is_primary?: boolean;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "article_categories_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "article_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      article_relations: {
        Row: {
          created_at: string;
          metadata: Json;
          relation_key: string | null;
          relation_type: string;
          sort_order: number;
          source_article_id: string;
          target_article_id: string;
        };
        Insert: {
          created_at?: string;
          metadata?: Json;
          relation_key?: string | null;
          relation_type: string;
          sort_order?: number;
          source_article_id: string;
          target_article_id: string;
        };
        Update: {
          created_at?: string;
          metadata?: Json;
          relation_key?: string | null;
          relation_type?: string;
          sort_order?: number;
          source_article_id?: string;
          target_article_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "article_relations_source_article_id_fkey";
            columns: ["source_article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "article_relations_target_article_id_fkey";
            columns: ["target_article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
        ];
      };
      article_revisions: {
        Row: {
          article_translation_id: string;
          change_note: string | null;
          content: string;
          content_format: string;
          created_at: string;
          created_by: string | null;
          id: string;
          keywords: string[];
          publication_status: string;
          seo_description: string | null;
          seo_title: string | null;
          summary: string | null;
          title: string;
          version: number;
        };
        Insert: {
          article_translation_id: string;
          change_note?: string | null;
          content?: string;
          content_format?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          keywords?: string[];
          publication_status: string;
          seo_description?: string | null;
          seo_title?: string | null;
          summary?: string | null;
          title: string;
          version: number;
        };
        Update: {
          article_translation_id?: string;
          change_note?: string | null;
          content?: string;
          content_format?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          keywords?: string[];
          publication_status?: string;
          seo_description?: string | null;
          seo_title?: string | null;
          summary?: string | null;
          title?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "article_revisions_article_translation_id_fkey";
            columns: ["article_translation_id"];
            isOneToOne: false;
            referencedRelation: "article_translations";
            referencedColumns: ["id"];
          },
        ];
      };
      article_sources: {
        Row: {
          article_id: string;
          citation_note: string | null;
          created_at: string;
          sort_order: number;
          source_id: string;
        };
        Insert: {
          article_id: string;
          citation_note?: string | null;
          created_at?: string;
          sort_order?: number;
          source_id: string;
        };
        Update: {
          article_id?: string;
          citation_note?: string | null;
          created_at?: string;
          sort_order?: number;
          source_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "article_sources_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "article_sources_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
      article_tags: {
        Row: {
          article_id: string;
          created_at: string;
          tag_id: string;
        };
        Insert: {
          article_id: string;
          created_at?: string;
          tag_id: string;
        };
        Update: {
          article_id?: string;
          created_at?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      article_translations: {
        Row: {
          article_id: string;
          author_id: string | null;
          content: string;
          content_format: string;
          created_at: string;
          id: string;
          keywords: string[];
          language_code: string;
          metadata: Json;
          publication_status: string;
          published_at: string | null;
          search_text: string;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          summary: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          article_id: string;
          author_id?: string | null;
          content?: string;
          content_format?: string;
          created_at?: string;
          id?: string;
          keywords?: string[];
          language_code: string;
          metadata?: Json;
          publication_status?: string;
          published_at?: string | null;
          search_text?: string;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          summary?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          article_id?: string;
          author_id?: string | null;
          content?: string;
          content_format?: string;
          created_at?: string;
          id?: string;
          keywords?: string[];
          language_code?: string;
          metadata?: Json;
          publication_status?: string;
          published_at?: string | null;
          search_text?: string;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          summary?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "article_translations_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "article_translations_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "authors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "article_translations_language_code_fkey";
            columns: ["language_code"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["code"];
          },
        ];
      };
      articles: {
        Row: {
          created_at: string;
          id: string;
          is_featured: boolean;
          topic_id: string;
          updated_at: string;
          view_count: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_featured?: boolean;
          topic_id: string;
          updated_at?: string;
          view_count?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_featured?: boolean;
          topic_id?: string;
          updated_at?: string;
          view_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "articles_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: true;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      authors: {
        Row: {
          bio: string | null;
          created_at: string;
          display_name: string;
          id: string;
          metadata: Json;
          updated_at: string;
          website_url: string | null;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          display_name: string;
          id?: string;
          metadata?: Json;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          metadata?: Json;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          metadata: Json;
          parent_id: string | null;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          metadata?: Json;
          parent_id?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          metadata?: Json;
          parent_id?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      category_translations: {
        Row: {
          category_id: string;
          created_at: string;
          description: string | null;
          id: string;
          language_code: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          language_code: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          language_code?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "category_translations_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "category_translations_language_code_fkey";
            columns: ["language_code"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["code"];
          },
        ];
      };
      languages: {
        Row: {
          code: string;
          created_at: string;
          direction: string;
          is_active: boolean;
          name: string;
          native_name: string;
          sort_order: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          direction?: string;
          is_active?: boolean;
          name: string;
          native_name: string;
          sort_order?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          direction?: string;
          is_active?: boolean;
          name?: string;
          native_name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      media: {
        Row: {
          alt_text: string | null;
          article_id: string;
          caption: string | null;
          created_at: string;
          file_size_bytes: number | null;
          filename: string;
          id: string;
          is_primary: boolean;
          language_code: string | null;
          metadata: Json;
          mime_type: string;
          storage_bucket: string;
          storage_path: string;
          updated_at: string;
        };
        Insert: {
          alt_text?: string | null;
          article_id: string;
          caption?: string | null;
          created_at?: string;
          file_size_bytes?: number | null;
          filename: string;
          id?: string;
          is_primary?: boolean;
          language_code?: string | null;
          metadata?: Json;
          mime_type: string;
          storage_bucket?: string;
          storage_path: string;
          updated_at?: string;
        };
        Update: {
          alt_text?: string | null;
          article_id?: string;
          caption?: string | null;
          created_at?: string;
          file_size_bytes?: number | null;
          filename?: string;
          id?: string;
          is_primary?: boolean;
          language_code?: string | null;
          metadata?: Json;
          mime_type?: string;
          storage_bucket?: string;
          storage_path?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_language_code_fkey";
            columns: ["language_code"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["code"];
          },
        ];
      };
      seo_metadata: {
        Row: {
          article_translation_id: string;
          canonical_url: string | null;
          noindex: boolean;
          og_description: string | null;
          og_image_media_id: string | null;
          og_title: string | null;
          structured_data: Json;
          twitter_card: string;
          twitter_description: string | null;
          twitter_title: string | null;
          updated_at: string;
        };
        Insert: {
          article_translation_id: string;
          canonical_url?: string | null;
          noindex?: boolean;
          og_description?: string | null;
          og_image_media_id?: string | null;
          og_title?: string | null;
          structured_data?: Json;
          twitter_card?: string;
          twitter_description?: string | null;
          twitter_title?: string | null;
          updated_at?: string;
        };
        Update: {
          article_translation_id?: string;
          canonical_url?: string | null;
          noindex?: boolean;
          og_description?: string | null;
          og_image_media_id?: string | null;
          og_title?: string | null;
          structured_data?: Json;
          twitter_card?: string;
          twitter_description?: string | null;
          twitter_title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seo_metadata_article_translation_id_fkey";
            columns: ["article_translation_id"];
            isOneToOne: true;
            referencedRelation: "article_translations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_metadata_og_image_media_id_fkey";
            columns: ["og_image_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
        ];
      };
      sources: {
        Row: {
          accessed_at: string;
          created_at: string;
          id: string;
          metadata: Json;
          name: string;
          notes: string | null;
          publication_date: string | null;
          source_author: string | null;
          source_type: string;
          updated_at: string;
          url: string | null;
        };
        Insert: {
          accessed_at?: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          name: string;
          notes?: string | null;
          publication_date?: string | null;
          source_author?: string | null;
          source_type?: string;
          updated_at?: string;
          url?: string | null;
        };
        Update: {
          accessed_at?: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          name?: string;
          notes?: string | null;
          publication_date?: string | null;
          source_author?: string | null;
          source_type?: string;
          updated_at?: string;
          url?: string | null;
        };
        Relationships: [];
      };
      tag_translations: {
        Row: {
          created_at: string;
          id: string;
          language_code: string;
          name: string;
          slug: string;
          tag_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          language_code: string;
          name: string;
          slug: string;
          tag_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          language_code?: string;
          name?: string;
          slug?: string;
          tag_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tag_translations_language_code_fkey";
            columns: ["language_code"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["code"];
          },
          {
            foreignKeyName: "tag_translations_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          canonical_key: string;
          created_at: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          canonical_key: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          canonical_key?: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          canonical_key: string;
          created_at: string;
          entity_type: string;
          id: string;
          metadata: Json;
          parent_topic_id: string | null;
          updated_at: string;
        };
        Insert: {
          canonical_key: string;
          created_at?: string;
          entity_type?: string;
          id?: string;
          metadata?: Json;
          parent_topic_id?: string | null;
          updated_at?: string;
        };
        Update: {
          canonical_key?: string;
          created_at?: string;
          entity_type?: string;
          id?: string;
          metadata?: Json;
          parent_topic_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "topics_parent_topic_id_fkey";
            columns: ["parent_topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_articles: {
        Args: {
          page_offset?: number;
          page_size?: number;
          requested_language?: string;
          search_query: string;
        };
        Returns: {
          article_id: string;
          language_code: string;
          publication_status: string;
          relevance: number;
          slug: string;
          summary: string;
          title: string;
          topic_id: string;
          translation_id: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
