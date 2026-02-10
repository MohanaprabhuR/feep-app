import { createClient } from "@supabase/supabase-js";

// Use placeholder values during build if env vars are missing
// This allows the build to complete without errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Lazy initialization - only create client when accessed
let clientInstance = null;

const getClient = () => {
  if (!clientInstance) {
    // Check if we're using placeholder values at runtime
    if (
      typeof window !== "undefined" &&
      (supabaseUrl === "https://placeholder.supabase.co" || supabaseAnonKey === "placeholder-key")
    ) {
      throw new Error(
        "Supabase environment variables are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel environment variables."
      );
    }
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
};

// Export a proxy that lazily initializes the client
const client = new Proxy({}, {
  get(_target, prop) {
    const instance = getClient();
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export default client;