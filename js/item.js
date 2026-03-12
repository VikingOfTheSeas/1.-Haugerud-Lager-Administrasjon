// ════════════════════════════════════════════════════
// ITEM DETAIL PAGE — item.js
// ════════════════════════════════════════════════════

let currentItem = null;
let itemId = null;

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  itemId = params.get("id");
  if (!itemId) { showError("Ingen ID i URL."); return; }

  document.getElementById("loadingState").style.display = "flex";
  document.getElementById("itemContent").style.display  = "none";

  try {
    const { data, error } = await db.from("gjenstander").select("*").eq("id", itemId).single();
    if (error || !data) { showError(`Fant ingen gjenstand med ID: ${itemId}`); return; }
    currentItem = data;
    renderItem(data);
  } catch (e) {
    showError("Feil ved lasting: " + e.message);
  }

  // Realtime: oppdater siden automatisk hvis noen endrer i tabellen
  db.channel("item-" + itemId)
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "gjenstander",
        filter: `id=eq.${itemId}` }, payload => {
      currentItem = payload.new;
      renderItem(payload.new);
      showBanner("🔄 Siden ble oppdatert", "success");
    })
    .subscribe();
});

// ── Render ────────────────────────────────────────────────────────────────
function renderItem(g) {
  document.title = `${g.navn} – Speiderlageret`;
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("itemContent").style.display  = "block";

  // Header
  document.getElementById("itemNavn").textContent         = g.navn;
  document.getElementById("itemId").textContent           = g.id;
  document.getElementById("itemKategori").textContent     = g.kategori || "—";
  document.getElementById("itemSerienummer").textContent  = g.serienummer || "—";
  document.getElementById("itemHylleHeader").textContent  = g.hylleplassering || "Hylle ikke satt";
  document.getElementById("hylleLabelBig").textContent    = g.hylleplassering || "—";

  // Detaljer
  document.getElementById("itemHylle").textContent        = g.hylleplassering || "—";
  document.getElementById("itemKategori2").textContent    = g.kategori || "—";
  document.getElementById("itemSerienummer2").textContent = g.serienummer || "—";
  document.getElementById("itemEnhet").textContent        = g.enhet || "stk";
  document.getElementById("itemNotater").textContent      = g.notater || "—";

  // Status badge
  const statusEl = document.getElementById("itemStatus");
  statusEl.textContent = g.status;
  statusEl.className   = "status-badge status-" + statusClass(g.status);

  // Hurtigstatusknapper
  renderQuickStatusBtns(g.status);

  // Utlånsbanner
  const banner = document.getElementById("utlanBanner");
  if (g.status === "Utlånt") {
    banner.style.display = "block";
    document.getElementById("bannerUtlantTil").textContent  = g.utlant_til || "—";
    document.getElementById("bannerUtlansdato").textContent = g.utlansdato || "—";
    const fristEl = document.getElementById("bannerFrist");
    fristEl.textContent = g.innleveringsdato || "—";
    const forfalt = g.innleveringsdato && new Date(g.innleveringsdato) < new Date();
    fristEl.className = "utlan-banner-val mono" + (forfalt ? " forfalt-text" : "");
    if (forfalt) fristEl.textContent += " ⚠️";
  } else {
    banner.style.display = "none";
  }

  // Bilde
  const bildeEl       = document.getElementById("hylleBilde");
  const placeholder   = document.getElementById("bildePlaceholder");
  document.getElementById("newBildeUrl").value = g.bilde_url || "";
  if (g.bilde_url) {
    bildeEl.src           = g.bilde_url;
    bildeEl.style.display = "block";
    placeholder.style.display = "none";
    bildeEl.onerror = () => { bildeEl.style.display = "none"; placeholder.style.display = "flex"; };
  } else {
    bildeEl.style.display     = "none";
    placeholder.style.display = "flex";
  }

  // QR
  const qrEl = document.getElementById("qrCode");
  qrEl.innerHTML = "";
  const qrUrl = APP_BASE_URL + "item.html?id=" + encodeURIComponent(g.id);
  document.getElementById("qrUrl").textContent = qrUrl;
  new QRCode(qrEl, {
    text: qrUrl, width: 190, height: 190,
    colorDark: "#0a1628", colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
}

// ── Hurtigstatusknapper ────────────────────────────────────────────────────
function renderQuickStatusBtns(currentStatus) {
  const container = document.getElementById("quickStatusBtns");
  const statuser = [
    { label: "✅ Tilgjengelig", value: "Tilgjengelig", cls: "qbtn-tilg" },
    { label: "📤 Lån ut",       value: "Utlånt",       cls: "qbtn-utlant" },
    { label: "🔧 Reparasjon",   value: "Til reparasjon", cls: "qbtn-rep" },
    { label: "❌ Tapt",          value: "Tapt",         cls: "qbtn-tapt" },
  ];
  container.innerHTML = statuser.map(s => `
    <button class="qbtn ${s.cls} ${s.value === currentStatus ? "qbtn-active" : ""}"
            onclick="changeStatus('${s.value}')"
            ${s.value === currentStatus ? "disabled" : ""}>
      ${s.label}
    </button>`
  ).join("");
}

// ── Endre status ──────────────────────────────────────────────────────────
async function changeStatus(newStatus) {
  if (!currentItem) return;

  // Hvis utlånt og ingen utlånsinformasjon → åpne modal
  if (newStatus === "Utlånt") {
    document.getElementById("loanDato").value  = new Date().toISOString().split("T")[0];
    document.getElementById("loanFrist").value = "";
    document.getElementById("loanTil").value   = currentItem.utlant_til || "";
    document.getElementById("loanNotater").value = currentItem.notater || "";
    document.getElementById("loanModal").classList.add("open");
    return;
  }

  const updated = {
    ...currentItem,
    status: newStatus,
    utlant_til: "",
    utlansdato: "",
    innleveringsdato: "",
  };

  const { error } = await db.from("gjenstander").upsert(updated, { onConflict: "id" });
  if (!error) {
    currentItem = updated;
    renderItem(updated);
    showBanner("✓ Status satt til: " + newStatus, "success");
  } else {
    showBanner("Feil: " + error.message, "error");
  }
}

// ── Utlåns-modal ──────────────────────────────────────────────────────────
function openLoanModal() {
  if (!currentItem) return;
  document.getElementById("loanTil").value     = currentItem.utlant_til || "";
  document.getElementById("loanDato").value    = currentItem.utlansdato || new Date().toISOString().split("T")[0];
  document.getElementById("loanFrist").value   = currentItem.innleveringsdato || "";
  document.getElementById("loanNotater").value = currentItem.notater || "";
  document.getElementById("loanModal").classList.add("open");
}

function closeLoanModal() {
  document.getElementById("loanModal").classList.remove("open");
}

async function saveLoan() {
  const til = document.getElementById("loanTil").value.trim();
  if (!til) { showBanner("Skriv inn hvem som låner!", "error"); return; }

  const updated = {
    ...currentItem,
    status: "Utlånt",
    utlant_til: til,
    utlansdato: document.getElementById("loanDato").value,
    innleveringsdato: document.getElementById("loanFrist").value,
    notater: document.getElementById("loanNotater").value.trim() || currentItem.notater,
  };

  const { error } = await db.from("gjenstander").upsert(updated, { onConflict: "id" });
  if (!error) {
    currentItem = updated;
    closeLoanModal();
    renderItem(updated);
    showBanner("✓ Utlån registrert", "success");
  } else {
    showBanner("Feil: " + error.message, "error");
  }
}

// ── Bilde ─────────────────────────────────────────────────────────────────
function toggleImageInput() {
  const row = document.getElementById("imageUrlRow");
  const btn = document.getElementById("addImageBtn");
  const vis = row.style.display === "none";
  row.style.display = vis ? "flex" : "none";
  btn.textContent   = vis ? "✕ Avbryt" : "➕ Legg til / endre bilde";
}

async function saveBildeUrl() {
  const url = document.getElementById("newBildeUrl").value.trim();
  if (!currentItem) return;

  const updated = { ...currentItem, bilde_url: url };
  const { error } = await db.from("gjenstander").upsert(updated, { onConflict: "id" });
  if (!error) {
    currentItem = updated;
    renderItem(updated);
    document.getElementById("imageUrlRow").style.display = "none";
    document.getElementById("addImageBtn").textContent = "➕ Legg til / endre bilde";
    showBanner(url ? "✓ Bilde oppdatert" : "✓ Bilde fjernet", "success");
  } else {
    showBanner("Feil: " + error.message, "error");
  }
}

// ── Hjelpere ──────────────────────────────────────────────────────────────
function statusClass(status) {
  const map = { "Tilgjengelig":"tilgjengelig", "Utlånt":"utlant", "Til reparasjon":"reparasjon", "Tapt":"tapt" };
  return map[status] || "tilgjengelig";
}

function showError(msg) {
  document.getElementById("loadingState").style.display = "none";
  document.getElementById("errorState").style.display   = "flex";
  document.getElementById("errorMsg").textContent       = msg;
}

function showBanner(tekst, type = "success") {
  const el = document.getElementById("banner");
  el.textContent = tekst;
  el.className = "banner banner-" + type;
  el.style.display = "block";
  setTimeout(() => el.style.display = "none", 3500);
}

document.getElementById("loanModal").addEventListener("click", e => {
  if (e.target === document.getElementById("loanModal")) closeLoanModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeLoanModal();
});
