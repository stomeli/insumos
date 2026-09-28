import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vyurlbcsvcwaapvwuxhk.supabase.co";

const supabaseAnonKey =
  "sb_publishable_h_ZfmyUc_v1z0YHP8Dtpcw__KH9gQT-";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);
