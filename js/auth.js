const PASSORD     = "Petter Bøckman";
const SESSION_KEY = "speider_auth";

function sjekkInnlogget() { return sessionStorage.getItem(SESSION_KEY) === "ok"; }
function loggUt() { sessionStorage.removeItem(SESSION_KEY); location.href = "index.html"; }

if (!sjekkInnlogget()) {
  document.addEventListener("DOMContentLoaded", function () {

    document.body.style.cssText = "margin:0;padding:0;background:linear-gradient(135deg,#0a1628,#0d2137,#0a1a2e);min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;";
    document.body.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = [
      ".lb{background:rgba(255,255,255,0.03);border:1px solid rgba(70,189,198,0.25);border-radius:20px;padding:48px 40px;width:90%;max-width:380px;text-align:center}",
      ".lb h1{font-size:22px;font-weight:700;color:#46bdc6;margin:12px 0 6px}",
      ".lb p{font-size:13px;color:#64748b;margin-bottom:28px}",
      ".lb input{width:100%;padding:13px 16px;background:rgba(255,255,255,0.07);border:1px solid rgba(70,189,198,0.25);border-radius:10px;color:#e2e8f0;font-size:15px;font-family:inherit;text-align:center;letter-spacing:2px;outline:none;margin-bottom:12px;box-sizing:border-box}",
      ".lb input:focus{border-color:rgba(70,189,198,0.6)}",
      ".lb button{width:100%;padding:13px;background:linear-gradient(135deg,#46bdc6,#1a8a92);color:#0a1628;font-size:15px;font-weight:700;border:none;border-radius:10px;cursor:pointer;font-family:inherit}",
      ".feil{display:none;color:#f87171;font-size:13px;margin-top:12px}"
    ].join("");
    document.head.appendChild(style);

    const boks = document.createElement("div");
    boks.className = "lb";

    const ikon = document.createElement("div");
    ikon.style.fontSize = "48px";
    ikon.textContent = "⚜️";

    const h1 = document.createElement("h1");
    h1.textContent = "Speiderlageret";

    const p = document.createElement("p");
    p.textContent = "Haugerud Speiderlag — Felles lagersystem";

    const input = document.createElement("input");
    input.type = "password";
    input.id = "pwInput";
    input.placeholder = "Passord…";

    const btn = document.createElement("button");
    btn.id = "pwBtn";
    btn.textContent = "Logg inn →";

    const feil = document.createElement("div");
    feil.className = "feil";
    feil.id = "pwFeil";
    feil.textContent = "❌ Feil passord, prøv igjen";

    boks.appendChild(ikon);
    boks.appendChild(h1);
    boks.appendChild(p);
    boks.appendChild(input);
    boks.appendChild(btn);
    boks.appendChild(feil);
    document.body.appendChild(boks);

    function forsok() {
      if (input.value === PASSORD) {
        sessionStorage.setItem(SESSION_KEY, "ok");
        location.reload();
      } else {
        feil.style.display = "block";
        input.value = "";
        input.focus();
      }
    }

    btn.addEventListener("click", forsok);
    input.addEventListener("keydown", function(e) { if (e.key === "Enter") forsok(); });
    input.focus();
  });
}
