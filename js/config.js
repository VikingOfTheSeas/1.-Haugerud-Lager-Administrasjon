// ════════════════════════════════════════════════════
// ⚙️  SUPABASE-KONFIGURASJON — fyll inn dine verdier
// ════════════════════════════════════════════════════

const SUPABASE_URL      = 'https://mxnojoymdgeapwsljkbg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14bm9qb3ltZGdlYXB3c2xqa2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTczNzgsImV4cCI6MjA4ODg5MzM3OH0.IZuE0og-G-12Izu2VVyx_kV8sDHUE6nG5Ziucdi-FNk';
const APP_BASE_URL      = 'https://vikingoftheseas.github.io/speiderlageret/';

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Google Drive URL-konvertering ─────────────────────────────────────────
// Støtter: drive.google.com/file/d/ID/view  →  direkte bilde-URL
function konverterBildeUrl(url) {
  if (!url) return "";
  // Google Drive deling-lenke
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  // Google Drive open-lenke
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  return url; // vanlig URL, bruk som den er
}
