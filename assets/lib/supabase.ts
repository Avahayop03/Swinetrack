import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tqhbmujdtqxqivaesydq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaGJtdWpkdHF4cWl2YWVzeWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTE1NTAsImV4cCI6MjA2Nzg4NzU1MH0.aGKcDwbjmJU97w7pzgDteFhYxf7IcsPStBIqlBhRfvA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
