// ════════════════════════════════════════════════════
// ⚙️  SUPABASE-KONFIGURASJON
// Fyll inn din URL og anon-nøkkel fra:
// Supabase → Settings → API
// ════════════════════════════════════════════════════
 
const SUPABASE_URL     = 'https://mxnojoymdgeapwsljkbg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14bm9qb3ltZGdlYXB3c2xqa2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTczNzgsImV4cCI6MjA4ODg5MzM3OH0.IZuE0og-G-12Izu2VVyx_kV8sDHUE6nG5Ziucdi-FNk';
 
// Basis-URL for QR-lenker — bytt til din GitHub Pages URL
const APP_BASE_URL = window.location.origin + window.location.pathname.replace('index.html','');
 
const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
