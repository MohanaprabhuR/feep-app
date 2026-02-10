import { createClient } from "@supabase/supabase-js";

// Use placeholder values during build if env vars are missing
// This allows the build to complete without errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

const client = createClient(supabaseUrl, supabaseAnonKey);

export default client;