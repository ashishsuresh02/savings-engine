import { createClient } from '@supabase/supabase-js';

const getValidUrl = (url: string | undefined): string => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return 'https://abypppsniztkenhypsoc.supabase.co';
  }
  return url.trim().replace(/\/+$/, '');
};

const supabaseUrl = getValidUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
);

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFieXBwcHNuaXp0a2VuaHlwc29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTgxOTEsImV4cCI6MjEwNDE3NDE5MX0.38SZ5HVAfwTMzYnxX4wDmuF7Wi5Bo11Pz0YJlJY9UU0'
).trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});