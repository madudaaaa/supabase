import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://brswcmjsnzpudlmmbaux.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyc3djbWpzbnpwdWRsbW1iYXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MjQwMDgsImV4cCI6MjA3MjUwMDAwOH0.XpK7x667d-Gqt7KRR8ipsEDf4xH94Sgz5jyC5gsSofs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
