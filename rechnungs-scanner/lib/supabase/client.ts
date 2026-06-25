import { createBrowserClient } from "@supabase/ssr";

// Supabase-Client für den Browser (nutzt den Publishable Key, RLS-geschützt)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
