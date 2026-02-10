import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Use placeholder values during build if env vars are missing
// This allows the build to complete without errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Lazy initialization - only create client when accessed
let supabaseClient: SupabaseClient | null = null;

const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    // Check if we're using placeholder values at runtime
    if (
      typeof window !== "undefined" &&
      (supabaseUrl === "https://placeholder.supabase.co" || supabaseAnonKey === "placeholder-key")
    ) {
      throw new Error(
        "Supabase environment variables are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel environment variables."
      );
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseClient;
};

// Export a proxy that lazily initializes the client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as SupabaseClient;
