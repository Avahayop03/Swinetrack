import { createClient } from "@supabase/supabase-js";
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = "https://tqhbmujdtqxqivaesydq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaGJtdWpkdHF4cWl2YWVzeWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTE1NTAsImV4cCI6MjA2Nzg4NzU1MH0.aGKcDwbjmJU97w7pzgDteFhYxf7IcsPStBIqlBhRfvA";

if (
  !supabaseUrl || 
  !supabaseAnonKey ||
  supabaseUrl.includes("YOUR_SUPABASE") ||
  supabaseAnonKey.includes("YOUR_SUPABASE")
) {
  console.error("❌ Supabase credentials not configured!");
  console.error(
    "Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // <--- Enables persistent login on mobile
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native/Expo
  },
});

export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from("snapshots").select("count").limit(1);
    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
    console.log("✅ Supabase connection test successful");
    return true;
  } catch (err) {
    console.error("Supabase connection test error:", err);
    return false;
  }
};