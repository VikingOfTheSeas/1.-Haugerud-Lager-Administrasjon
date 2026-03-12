const KATEGORIER = ["Camping", "Kjøkken", "Sikkerhet", "Navigasjon", "Belysning", "Annet"];
const STATUSER = ["Tilgjengelig", "Utlånt", "Til reparasjon", "Tapt"];

const INITIAL_DATA = [
    { id: "T-S01", navn: "Telt (6-person)", kategori: "Camping", serienummer: "TELT-S01", status: "Tilgjengelig", utlåntTil: "", forventetRetur: "", notater: "Grønt telt" },
    { id: "T-L01", navn: "Telt (2-person)", kategori: "Camping", serienummer: "TELT-L01", status: "Utlånt", utlåntTil: "Ulvetroppen", forventetRetur: "2026-03-15", notater: "Blått telt" },
    { id: "SP-01", navn: "Sovepose", kategori: "Camping", serienummer: "SOVE-01", status: "Tilgjengelig", utlåntTil: "", forventetRetur: "", notater: "Mumiepose" },
    { id: "KO-01", navn: "Kompass", kategori: "Navigasjon", serienummer: "KOMP-01", status: "Tilgjengelig", utlåntTil: "", forventetRetur: "", notater: "" },
    { id: "LY-01", navn: "Lykt", kategori: "Belysning", serienummer: "LYKT-01", status: "Tilgjengelig", utlåntTil: "", forventetRetur: "", notater: "Batterier ikke inkludert" },
];

let gjenstander = [];
let filteredItems = [];
let sortField = "id";
let sortDirection = "asc";

function initApp() {
    const saved = localStorage.getItem("gjenstander");
    gjenstander = saved ? JSON.parse(saved) : INITIAL_DATA;
    populateSelects();
    setupEventListeners();
    filterAndDisplay();
    updateStats();
}

function populateSelects() {
    const selects = document.querySelectorAll("#filterKategori, #itemKategori");
    selects.forEach(select => {
        select.innerHTML = '<option value="Alle">Alle kategorier</option>';
        KATEGORIER.forEach(k => {
            select.innerHTML += `<option value="${k}">${k}</option>`;
        });
    });
}

function setupEventListeners() {
    document.getElementById("searchInput").addEventListener("input", filterAndDisplay);
    document.getElementById("filterKategori").addEventListener("change", filterAndDisplay);
    document.getElementById("filterStatus").addEventListener("change", filterAndDisplay);
    
    document.querySelectorAll(".sortable").forEach(th => {
        th.addEventListener("click", () => {
            const field = th.dataset.sort;
            sortDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
            sortField = field;
            filterAndDisplay();
        });
    });

    document.querySelectorAll(".tab").forEach(btn => {
        btn.addEventListener("click", (e) => setTab(e.target.dataset.tab));
    });

    document.getElementById("addItemForm").addEventListener("submit", (e) => {
        e.preventDefault();
        addNewItems();
    });
}

function setTab(tabName) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
    document.getElementById(tabName).classList.add("active");
    
    if (tabName === "sammendrag") displaySummary();
}

function filterAndDisplay() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const kategoriFilter = document.getElementById("filterKategori").value;
    const statusFilter = document.getElementById("filterStatus").value;

    filteredItems = gjenstander.filter(item => {
        const matchSearch = item.navn.toLowerCase().includes(searchTerm) || item.id.toLowerCase().includes(searchTerm);
        const matchKat = kategoriFilter === "Alle" || item.kategori === kategoriFilter;
        const matchStatus = statusFilter === "Alle" || item.status === statusFilter;
        return matchSearch && matchKat && matchStatus;
    });

    filteredItems.sort((a, b) => {
        const aVal = String(a[sortField] || "").toLowerCase();
        const bVal = String(b[sortField] || "").toLowerCase();
        const compare = aVal.localeCompare(bVal, "no");
        return sortDirection === "asc" ? compare : -compare;
    });

    displayTable();
    updateStats();
}

function displayTable() {
    const tbody = document.getElementById("itemsBody");
    tbody.innerHTML = "";

    if (filteredItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #475569; padding: 48px;">Ingen gjenstander funnet</td></tr>';
        return;
    }

    filteredItems.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="mono">${item.id}</td>
            <td>${item.navn}</td>
            <td>${item.kategori}</td>
            <td class="mono">${item.serienummer}</td>
            <td><span class="status-badge">${item.status}</span></td>
            <td>${item.utlåntTil || "—"}</td>
            <td>
                <button class="btn-edit" onclick="editItem('${item.id}')">✏️</button>
                <button class="btn-delete" onclick="deleteItem('${item.id}')">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("count-shown").textContent = filteredItems.length;
    document.getElementById("count-total").textContent = gjenstander.length;
}

function updateStats() {
    const total = gjenstander.length;
    const available = gjenstander.filter(g => g.status === "Tilgjengelig").length;
    const loaned = gjenstander.filter(g => g.status === "Utlånt").length;

    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-tilgjengelig").textContent = available;
    document.getElementById("stat-utlånt").textContent = loaned;
}

function addNewItems() {
    const navn = document.getElementById("itemName").value;
    const kategori = document.getElementById("itemKategori").value;
    const enhet = document.getElementById("itemEnhet").value;
    const antall = parseInt(document.getElementById("itemAntall").value);
    const prefix = document.getElementById("itemPrefix").value || navn.slice(0, 3).toUpperCase();

    for (let i = 1; i <= antall; i++) {
        gjenstander.push({
            id: `${prefix}-${String(i).padStart(2, "0")}`,
            navn,
            kategori,
            serienummer: `${prefix}-${String(i).padStart(3, "0")}`,
            status: "Tilgjengelig",
            utlåntTil: "",
            forventetRetur: "",
            notater: ""
        });
    }

    localStorage.setItem("gjenstander", JSON.stringify(gjenstander));
    document.getElementById("addItemForm").reset();
    filterAndDisplay();
    alert(`✓ ${antall} gjenstand(er) lagt til`);
}

function editItem(id) {
    const item = gjenstander.find(i => i.id === id);
    if (!item) return;
    
    const newStatus = prompt("Ny status:", item.status);
    if (newStatus && STATUSER.includes(newStatus)) {
        item.status = newStatus;
        localStorage.setItem("gjenstander", JSON.stringify(gjenstander));
        filterAndDisplay();
    }
}

function deleteItem(id) {
    if (confirm("Sikker på at du vil slette denne gjenstanden?")) {
        gjenstander = gjenstander.filter(i => i.id !== id);
        localStorage.setItem("gjenstander", JSON.stringify(gjenstander));
        filterAndDisplay();
    }
}

function displaySummary() {
    const total = gjenstander.length;
    const available = gjenstander.filter(g => g.status === "Tilgjengelig").length;
    const loaned = gjenstander.filter(g => g.status === "Utlånt").length;
    const repair = gjenstander.filter(g => g.status === "Til reparasjon").length;
    const lost = gjenstander.filter(g => g.status === "Tapt").length;
    
    document.getElementById("kpiGrid").innerHTML = `
        <div class="kpi-card"><div class="kpi-icon">📦</div><div class="kpi-value">${total}</div><div class="kpi-label">Totalt</div></div>
        <div class="kpi-card"><div class="kpi-icon">✅</div><div class="kpi-value">${available}</div><div class="kpi-label">Tilgjengelig</div></div>
        <div class="kpi-card"><div class="kpi-icon">📤</div><div class="kpi-value">${loaned}</div><div class="kpi-label">Utlånt</div></div>
        <div class="kpi-card"><div class="kpi-icon">🔧</div><div class="kpi-value">${repair}</div><div class="kpi-label">Til reparasjon</div></div>
        <div class="kpi-card"><div class="kpi-icon">❌</div><div class="kpi-value">${lost}</div><div class="kpi-label">Tapt</div></div>
    `;
}

document.addEventListener("DOMContentLoaded", initApp);
