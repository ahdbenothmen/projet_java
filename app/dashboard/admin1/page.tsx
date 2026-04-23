"use client";
import { useState } from "react";

const NIVEAUX = [
  { niveau: "Licence 1", classes: 4, etudiants: 320, tauxAdmis: 78 },
  { niveau: "Licence 2", classes: 3, etudiants: 245, tauxAdmis: 72 },
  { niveau: "Licence 3", classes: 3, etudiants: 210, tauxAdmis: 81 },
  { niveau: "Master 1",  classes: 2, etudiants: 120, tauxAdmis: 88 },
  { niveau: "Master 2",  classes: 2, etudiants: 89,  tauxAdmis: 91 },
];

const RECENT_DEMANDES = [
  { nom: "Personne 1",    niveau: "Licence 1", status: "admis" },
  { nom: "Personne 2",      niveau: "Master 2",  status: "attente" },
  { nom: "Personne 3",     niveau: "Licence 3", status: "Nonretenu" },
  { nom: "Personne 4",      niveau: "Master 1",  status: "admis" },
  { nom: "Personne 5",    niveau: "Licence 2", status: "attente" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  admis:   { bg: "#EAF3DE", color: "#27500A", label: "Admis" },
  attente: { bg: "#FAEEDA", color: "#633806", label: "En attente" },
  Nonretenu:  { bg: "#FCEBEB", color: "#791F1F", label: "Non retenu" },
};

const NAV_ITEMS = ["Tableau de bord", "Étudiants", "Professeurs", "Classes", "Demandes", "Paramètres"];

export default function DashboardAdmin() {
  const [activeNav, setActiveNav] = useState("Tableau de bord");

  const totalEtudiants = NIVEAUX.reduce((s, n) => s + n.etudiants, 0);
  const totalClasses   = NIVEAUX.reduce((s, n) => s + n.classes, 0);
  const totalProfesseurs = 64;
  const totalDemandes    = 38;

  return (
    <div id="dashboard-page" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#E6F1FB" }}>

      {/* ── Navbar ── */}
      <nav id="navbar" style={{ background: "#185FA5", padding: "0 28px" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", paddingBottom: "6px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginBottom: "2px" }}>Université de Mannouba</div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#fff" }}>Tableau de bord — Administration</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace(/^\w/, c => c.toUpperCase())}
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              AD
            </div>
          </div>
        </div>

        {/* Nav links row */}
        <div style={{ display: "flex", gap: "4px", paddingBottom: "0" }}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item}
              id={`nav-${item.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setActiveNav(item)}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: activeNav === item ? 600 : 400,
                color: activeNav === item ? "#fff" : "rgba(255,255,255,0.7)",
                borderBottom: activeNav === item ? "3px solid #fff" : "3px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </nav>

      {/* ── Main ── */}
      <main id="dashboard-main" style={{ flex: 1, padding: "28px", overflowY: "auto" }}>

        {/* Header */}
        <div id="dashboard-header" style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>Vue générale — Année 2025/2026</p>
        </div>

        {/* ── KPI Cards ── */}
        <div id="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
          {[
            { id: "kpi-etudiants", label: "Total Étudiants",   value: totalEtudiants, sub: "+48 ce semestre", color: "#185FA5", bg: "#E6F1FB" },
            { id: "kpi-professeurs", label: "Professeurs",      value: totalProfesseurs, sub: "12 départements",  color: "#3B6D11", bg: "#EAF3DE" },
            { id: "kpi-classes", label: "Classes actives",      value: totalClasses,   sub: `${NIVEAUX.length} niveaux`,     color: "#BA7517", bg: "#FAEEDA" },
            { id: "kpi-demandes", label: "Demandes en cours",   value: totalDemandes,  sub: "12 à traiter",     color: "#A32D2D", bg: "#FCEBEB" },
          ].map((k) => (
            <div key={k.id} id={k.id} style={{ background: "#fff", borderRadius: "12px", padding: "18px", border: "1.5px solid #D3D1C7" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: k.bg, marginBottom: "12px" }} />
              <div style={{ fontSize: "12px", color: "#888780", marginBottom: "4px" }}>{k.label}</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#2C2C2A" }}>{k.value.toLocaleString("fr-TN")}</div>
              <div style={{ fontSize: "11px", color: k.color, marginTop: "4px" }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Niveaux Table + Demandes récentes ── */}
        <div id="content-grid" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px", marginBottom: "24px" }}>

          {/* Table niveaux */}
          <div id="table-niveaux" style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1.5px solid #D3D1C7" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#2C2C2A", marginBottom: "16px" }}>Répartition par niveau</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #D3D1C7" }}>
                  {["Niveau", "Classes", "Étudiants", "Taux admis"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: "11px", color: "#888780", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NIVEAUX.map((row) => (
                  <tr key={row.niveau} style={{ borderBottom: "1px solid #F1EFE8" }}>
                    <td style={{ padding: "11px 8px", color: "#2C2C2A", fontWeight: 600 }}>{row.niveau}</td>
                    <td style={{ padding: "11px 8px" }}>
                      <span style={{ background: "#E6F1FB", color: "#0C447C", borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: 600 }}>
                        {row.classes}
                      </span>
                    </td>
                    <td style={{ padding: "11px 8px", color: "#2C2C2A" }}>{row.etudiants}</td>
                    <td style={{ padding: "11px 8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", background: "#F1EFE8", borderRadius: "6px", overflow: "hidden" }}>
                          <div style={{ width: `${row.tauxAdmis}%`, height: "100%", background: "#3B6D11", borderRadius: "6px" }} />
                        </div>
                        <span style={{ fontSize: "12px", color: "#3B6D11", fontWeight: 600, minWidth: "30px" }}>{row.tauxAdmis}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Demandes récentes */}
          <div id="recent-demandes" style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1.5px solid #D3D1C7" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#2C2C2A", marginBottom: "16px" }}>Demandes récentes</div>
            {RECENT_DEMANDES.map((d, i) => {
              const s = STATUS_STYLE[d.status];
              return (
                <div key={i} id={`demande-${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < RECENT_DEMANDES.length - 1 ? "1px solid #F1EFE8" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#185FA5", flexShrink: 0 }}>
                      {d.nom.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#2C2C2A" }}>{d.nom}</div>
                      <div style={{ fontSize: "11px", color: "#888780" }}>{d.niveau}</div>
                    </div>
                  </div>
                  <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 600 }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Statistiques statut demandes ── */}
        <div id="stats-statut" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
          {[
            { id: "stat-admis",   label: "Admis",       count: 18, total: totalDemandes, color: "#3B6D11", bg: "#EAF3DE", bar: "#3B6D11" },
            { id: "stat-attente", label: "En attente",  count: 12, total: totalDemandes, color: "#BA7517", bg: "#FAEEDA", bar: "#BA7517" },
            { id: "stat-Non-retenu",  label: "Non retenu",     count: 8,  total: totalDemandes, color: "#A32D2D", bg: "#FCEBEB", bar: "#A32D2D" },
          ].map((s) => (
            <div key={s.id} id={s.id} style={{ background: "#fff", borderRadius: "12px", padding: "18px", border: "1.5px solid #D3D1C7" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#2C2C2A" }}>{s.label}</span>
                <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: 700 }}>{s.count}</span>
              </div>
              <div style={{ height: "8px", background: "#F1EFE8", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ width: `${Math.round((s.count / s.total) * 100)}%`, height: "100%", background: s.bar, borderRadius: "8px" }} />
              </div>
              <div style={{ fontSize: "11px", color: "#888780", marginTop: "6px" }}>
                {Math.round((s.count / s.total) * 100)}% du total
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}