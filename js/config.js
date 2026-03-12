// ════════════════════════════════════════════════════
// ⚙️  SUPABASE-KONFIGURASJON — fyll inn dine verdier
// ════════════════════════════════════════════════════

const SUPABASE_URL      = 'https://mxnojoymdgeapwsljkbg.supabase.co';
const SUPABASE_ANON_KEY = 'LIMPINN_DIN_NOKKEL_HER';
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
