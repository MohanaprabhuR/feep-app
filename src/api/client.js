import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create client with fallback empty strings during build
// This allows the build to complete, but the client will fail at runtime if env vars are missing
const client = createClient(supabaseUrl, supabaseAnonKey);

export default client;