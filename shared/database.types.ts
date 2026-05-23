export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          owner_id: string | null;
          product_name: string;
          brand_name: string;
          category: string | null;
          source_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          product_name: string;
          brand_name: string;
          category?: string | null;
          source_url: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          product_name?: string;
          brand_name?: string;
          category?: string | null;
          source_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      scrape_jobs: {
        Row: {
          id: string;
          owner_id: string | null;
          source_url: string;
          status: "pending" | "running" | "success" | "failed";
          total_reviews: number;
          requested_reviews: number;
          stop_reason: string | null;
          error_message: string | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          source_url: string;
          status: "pending" | "running" | "success" | "failed";
          total_reviews?: number;
          requested_reviews?: number;
          stop_reason?: string | null;
          error_message?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          source_url?: string;
          status?: "pending" | "running" | "success" | "failed";
          total_reviews?: number;
          requested_reviews?: number;
          stop_reason?: string | null;
          error_message?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          owner_id: string | null;
          product_id: string;
          scrape_job_id: string;
          rating: number | null;
          review_text: string;
          review_date: string | null;
          source_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          product_id: string;
          scrape_job_id: string;
          rating?: number | null;
          review_text: string;
          review_date?: string | null;
          source_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          product_id?: string;
          scrape_job_id?: string;
          rating?: number | null;
          review_text?: string;
          review_date?: string | null;
          source_url?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
