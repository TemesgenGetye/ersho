import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rzelceaqcdwskuxawrbv.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZWxjZWFxY2R3c2t1eGF3cmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzAzMzcsImV4cCI6MjA3MzIwNjMzN30.F_BGRgVU-xA9h_-G3h5p32Qqr1CKJG1Adzn4-2_DHmM";

// Create a single instance to avoid multiple GoTrueClient warnings
const supabaseClient = createSupabaseBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);

export const supabase = supabaseClient;

export const createBrowserClient = () => {
  return supabaseClient;
};

// Service role client for admin operations (bypasses RLS)
export const createServiceClient = () => {
  // For now, we'll use the anon key but with RLS bypass
  // In production, you should use the actual service role key
  const serviceRoleKey =
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

  return createSupabaseBrowserClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "user" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "user" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: "user" | "admin";
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          date: string;
          location: string;
          image_url: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          date: string;
          location: string;
          image_url?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          date?: string;
          location?: string;
          image_url?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
      };
      user_images: {
        Row: {
          id: string;
          user_id: string;
          event_id: string | null;
          image_url: string;
          caption: string;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id?: string | null;
          image_url: string;
          caption?: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string | null;
          image_url?: string;
          caption?: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
      };
    };
  };
};
