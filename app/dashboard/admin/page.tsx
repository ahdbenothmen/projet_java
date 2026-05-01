"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Prerequis {
  id?: number;
  nom: string;
  isObligatoire: boolean;
}

interface Module {
  id: number;
  nom: string;
  coefficient: number;
  note: number | null;
  professeurCin: string;
   professeurNom: string;   
  professeurPrenom: string;
  prerequis: Prerequis[];
}

// ─── Type pour le sélecteur de professeur ─────────────────────────────────────
interface ProfResult {
  cin: string;
  nom: string;
  prenom: string;
  speciality: string;
  photo: string | null;
}

// ─── Données statiques dashboard ─────────────────────────────────────────────
const NIVEAUX = [
  { niveau: "Licence 1", classes: 4, etudiants: 320, tauxAdmis: 78 },
  { niveau: "Licence 2", classes: 3, etudiants: 245, tauxAdmis: 72 },
  { niveau: "Licence 3", classes: 3, etudiants: 210, tauxAdmis: 81 },
  { niveau: "Master 1",  classes: 2, etudiants: 120, tauxAdmis: 88 },
  { niveau: "Master 2",  classes: 2, etudiants: 89,  tauxAdmis: 91 },
];

const RECENT_DEMANDES = [
  { nom: "Personne 1", niveau: "Licence 1", status: "admis" },
  { nom: "Personne 2", niveau: "Master 2",  status: "attente" },
  { nom: "Personne 3", niveau: "Licence 3", status: "Nonretenu" },
  { nom: "Personne 4", niveau: "Master 1",  status: "admis" },
  { nom: "Personne 5", niveau: "Licence 2", status: "attente" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  admis:     { bg: "#EAF3DE", color: "#27500A", label: "Admis" },
  attente:   { bg: "#FAEEDA", color: "#633806", label: "En attente" },
  Nonretenu: { bg: "#FCEBEB", color: "#791F1F", label: "Non retenu" },
};

const NAV_ITEMS = ["Tableau de bord", "Étudiants", "Professeurs", "Modules"];

const API      = "http://localhost:8080/backend-universite/api/modules";
const PROF_API = "http://localhost:8080/backend-universite/api/professeurs/search";
const ADMIN_ID = 1;

// ─── Styles communs ───────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 600,
  color: "#555350", marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "1.5px solid #D3D1C7", fontSize: "13px", color: "#2C2C2A",
  background: "#FAFAF8", outline: "none", boxSizing: "border-box",
};

const iconBtnStyle = (bg: string, color: string): React.CSSProperties => ({
  width: "32px", height: "32px", borderRadius: "8px",
  border: "none", background: bg, color, fontSize: "18px",
  fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0, lineHeight: 1,
});

// ═════════════════════════════════════════════════════════════════════════════
// Composant principal
// ═════════════════════════════════════════════════════════════════════════════
export default function DashboardAdmin() {
  const [activeNav, setActiveNav] = useState("Tableau de bord");

  const totalEtudiants   = NIVEAUX.reduce((s, n) => s + n.etudiants, 0);
  const totalClasses     = NIVEAUX.reduce((s, n) => s + n.classes,   0);
  const totalProfesseurs = 64;
  const totalDemandes    = 38;
   const [showUserMenu, setShowUserMenu] = useState(false);  
  const menuRef = useRef<HTMLDivElement>(null);   
  useEffect(() => {                                          // ← ajout
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {                              // ← ajout
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminNomUtilisateur");
    localStorage.removeItem("adminEmail");
    window.location.href = "/login/admin";
  };

  const adminNom = typeof window !== "undefined"            // ← ajout
    ? localStorage.getItem("adminNomUtilisateur") ?? "Admin"
    : "Admin";
  return (
    <div id="dashboard-page" style={{
      display: "flex", flexDirection: "column", minHeight: "100vh",
      fontFamily: "'Segoe UI', sans-serif", background: "#E6F1FB",
    }}>

      {/* ── Navbar ── */}
      <nav id="navbar" style={{ background: "#185FA5", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", paddingBottom: "6px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginBottom: "2px" }}>Université de Mannouba</div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#fff" }}>Tableau de bord — Administration</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace(/^\w/, c => c.toUpperCase())}
            </div>
           {/* Avatar + menu déroulant */}
<div ref={menuRef} style={{ position: "relative" }}>
  <div
    onClick={() => setShowUserMenu((v) => !v)}
    style={{
      width: "36px", height: "36px", borderRadius: "50%",
      background: showUserMenu ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.2)",
      border: "2px solid rgba(255,255,255,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer",
      transition: "background 0.15s",
    }}
  >
    AD
  </div>

  {showUserMenu && (
    <div style={{
      position: "absolute", top: "calc(100% + 10px)", right: 0,
      background: "#fff", borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      border: "1.5px solid #D3D1C7",
      minWidth: "200px", zIndex: 1000,
      overflow: "hidden",
    }}>
      {/* Info utilisateur */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid #F1EFE8",
        background: "#FAFAF8",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#2C2C2A" }}>
          {adminNom}
        </div>
        <div style={{ fontSize: "11px", color: "#888780", marginTop: "2px" }}>
          Administrateur
        </div>
      </div>

      {/* Bouton déconnexion */}
      <div
        onClick={handleLogout}
        style={{
          padding: "12px 16px",
          display: "flex", alignItems: "center", gap: "10px",
          cursor: "pointer", fontSize: "13px", color: "#A32D2D",
          fontWeight: 600, transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#FCEBEB")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span style={{ fontSize: "16px" }}>🚪</span>
        Se déconnecter
      </div>
    </div>
  )}
</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item}
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

      {/* ── Contenu selon onglet actif ── */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        {activeNav === "Tableau de bord" && (
          <TabDashboard
            totalEtudiants={totalEtudiants}
            totalClasses={totalClasses}
            totalProfesseurs={totalProfesseurs}
            totalDemandes={totalDemandes}
          />
        )}
        {activeNav === "Modules"     && <TabModules />}
        {activeNav === "Étudiants"   && <TabVide label="Étudiants" />}
        {activeNav === "Professeurs" && <TabVide label="Professeurs" />}
      </main>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Onglet Tableau de bord
// ═════════════════════════════════════════════════════════════════════════════
function TabDashboard({ totalEtudiants, totalClasses, totalProfesseurs, totalDemandes }: {
  totalEtudiants: number; totalClasses: number;
  totalProfesseurs: number; totalDemandes: number;
}) {
  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>Vue générale — Année 2025/2026</p>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Étudiants",   value: totalEtudiants,   sub: "+48 ce semestre",  color: "#185FA5", bg: "#E6F1FB" },
          { label: "Professeurs",       value: totalProfesseurs, sub: "12 départements",  color: "#3B6D11", bg: "#EAF3DE" },
          { label: "Classes actives",   value: totalClasses,     sub: `${NIVEAUX.length} niveaux`, color: "#BA7517", bg: "#FAEEDA" },
          { label: "Demandes en cours", value: totalDemandes,    sub: "12 à traiter",     color: "#A32D2D", bg: "#FCEBEB" },
        ].map((k) => (
          <div key={k.label} style={{ background: "#fff", borderRadius: "12px", padding: "18px", border: "1.5px solid #D3D1C7" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: k.bg, marginBottom: "12px" }} />
            <div style={{ fontSize: "12px", color: "#888780", marginBottom: "4px" }}>{k.label}</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#2C2C2A" }}>{k.value.toLocaleString("fr-TN")}</div>
            <div style={{ fontSize: "11px", color: k.color, marginTop: "4px" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Table niveaux + Demandes */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1.5px solid #D3D1C7" }}>
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
                    <span style={{ background: "#E6F1FB", color: "#0C447C", borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: 600 }}>{row.classes}</span>
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

        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1.5px solid #D3D1C7" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#2C2C2A", marginBottom: "16px" }}>Demandes récentes</div>
          {RECENT_DEMANDES.map((d, i) => {
            const s = STATUS_STYLE[d.status];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < RECENT_DEMANDES.length - 1 ? "1px solid #F1EFE8" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#185FA5", flexShrink: 0 }}>
                    {d.nom.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#2C2C2A" }}>{d.nom}</div>
                    <div style={{ fontSize: "11px", color: "#888780" }}>{d.niveau}</div>
                  </div>
                </div>
                <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 600 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats statut */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
        {[
          { label: "Admis",      count: 18, total: totalDemandes, color: "#3B6D11", bg: "#EAF3DE", bar: "#3B6D11" },
          { label: "En attente", count: 12, total: totalDemandes, color: "#BA7517", bg: "#FAEEDA", bar: "#BA7517" },
          { label: "Non retenu", count: 8,  total: totalDemandes, color: "#A32D2D", bg: "#FCEBEB", bar: "#A32D2D" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: "12px", padding: "18px", border: "1.5px solid #D3D1C7" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#2C2C2A" }}>{s.label}</span>
              <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: 700 }}>{s.count}</span>
            </div>
            <div style={{ height: "8px", background: "#F1EFE8", borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ width: `${Math.round((s.count / s.total) * 100)}%`, height: "100%", background: s.bar, borderRadius: "8px" }} />
            </div>
            <div style={{ fontSize: "11px", color: "#888780", marginTop: "6px" }}>{Math.round((s.count / s.total) * 100)}% du total</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ProfesseurSelector  ← AVANT TabModules pour éviter le ReferenceError
// ═════════════════════════════════════════════════════════════════════════════
function ProfesseurSelector({
  value,
  displayName,
  onChange,
}: {
  value: string;
  displayName?: string;
  onChange: (cin: string) => void;
}) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<ProfResult[]>([]);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selected, setSelected] = useState<ProfResult | null>(null);
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef            = useRef<HTMLDivElement>(null);

  // Fermer si clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
  if (!value) {
    setSelected(null);
    setQuery("");
    return;
  }
  if (selected && selected.cin === value) {
    setQuery(`${selected.prenom} ${selected.nom}`);
  } else if (displayName) {
    setQuery(displayName);
  }
}, [value, selected, displayName]);

  const search = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      setSearchError("");
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSearchError("");
      try {
        const res = await fetch(`${PROF_API}?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const normalized: ProfResult[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : Array.isArray(data?.data)
              ? data.data
              : [];

        setResults(normalized);
        setOpen(true);
      } catch (err) {
        console.error("Erreur recherche professeurs:", err);
        setSearchError("Impossible de récupérer les professeurs.");
        setResults([]);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (p: ProfResult) => {
    setSelected(p);
    onChange(p.cin);
    setQuery(`${p.prenom} ${p.nom}`);
    setOpen(false);
  };

  const handleClear = () => {
    setSelected(null);
    onChange("");
    setQuery("");
    setResults([]);
    setSearchError("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", maxWidth: "420px" }}>
      {/* Input de recherche */}
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
          onFocus={() => {
            if (query.trim() !== "" || results.length > 0 || searchError) {
              setOpen(true);
            }
          }}
          placeholder="Rechercher par nom, prénom ou spécialité…"
          style={{ ...inputStyle, paddingRight: "36px" }}
        />
        {loading && (
          <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#888780" }}>
            ⏳
          </span>
        )}
        {selected && !loading && (
          <span
            onClick={handleClear}
            title="Effacer"
            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: "14px", color: "#A32D2D" }}
          >
            ✕
          </span>
        )}
      </div>

      {/* Dropdown résultats */}
      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", borderRadius: "10px",
          border: "1.5px solid #D3D1C7",
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          zIndex: 999, maxHeight: "320px", overflowY: "auto",
        }}>
          {results.map((p) => (
            <div
              key={p.cin}
              onClick={() => handleSelect(p)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 14px", cursor: "pointer",
                borderBottom: "1px solid #F1EFE8",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F8FD")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Photo */}
              <div style={{
                width: "44px", height: "44px", borderRadius: "50%",
                overflow: "hidden", flexShrink: 0,
                background: "#E6F1FB",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #D3D1C7",
              }}>
                {p.photo ? (
                  <img src={p.photo} alt={p.nom}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#185FA5" }}>
                    {p.prenom[0]}{p.nom[0]}
                  </span>
                )}
              </div>

              {/* Nom + spécialité */}
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#2C2C2A" }}>
                  {p.prenom} {p.nom}
                </div>
                <div style={{ fontSize: "11px", color: "#888780", marginTop: "2px" }}>
                  {p.speciality || "Spécialité non renseignée"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Erreur recherche */}
      {open && !loading && searchError && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", borderRadius: "10px",
          border: "1.5px solid #F0C0C0", padding: "14px",
          fontSize: "13px", color: "#791F1F", textAlign: "center",
          zIndex: 999,
        }}>
          {searchError}
        </div>
      )}

      {/* Aucun résultat */}
      {open && !loading && !searchError && results.length === 0 && query.trim() !== "" && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", borderRadius: "10px",
          border: "1.5px solid #D3D1C7", padding: "14px",
          fontSize: "13px", color: "#888780", textAlign: "center",
          zIndex: 999,
        }}>
          Aucun professeur trouvé pour « {query} »
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Onglet Modules
// ═════════════════════════════════════════════════════════════════════════════
function TabModules() {
  const [modules, setModules]     = useState<Module[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [deleting, setDeleting]   = useState<number | null>(null);
const [editingModule, setEditingModule] = useState<Module | null>(null);
const [profDisplayName, setProfDisplayName] = useState("");

  const [nom, setNom]             = useState("");
  const [coeff, setCoeff]         = useState("");
  const [profCin, setProfCin]     = useState("");
  const [prerequis, setPrerequis] = useState<{ nom: string; obl: boolean }[]>([{ nom: "", obl: false }]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const formRef = useRef<HTMLDivElement>(null);

const chargerModules = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(API, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.status === 401) {
      // Token expiré ou absent → rediriger vers login
      window.location.href = "/login/admin";
      return;
    }

    const data = await res.json();
    setModules(Array.isArray(data) ? data : []);  // ← sécurisation
  } catch {
    setModules([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { chargerModules(); }, []);
  useEffect(() => {
    if (showForm) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showForm]);

  const ajouterPrereq   = () => setPrerequis((p) => [...p, { nom: "", obl: false }]);
  const supprimerPrereq = (i: number) => setPrerequis((p) => p.filter((_, idx) => idx !== i));
  const updatePrereq    = (i: number, field: "nom" | "obl", val: string | boolean) =>
    setPrerequis((p) => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

const resetForm = () => {
  setNom(""); setCoeff(""); setProfCin("");
  setProfDisplayName(""); // ← ajout
  setPrerequis([{ nom: "", obl: false }]);
  setShowForm(false); setError("");
  setEditingModule(null);
};

const handleSubmit = async () => {
  setError("");
  if (!nom.trim())     { setError("Le nom du module est obligatoire."); return; }
  if (!profCin.trim()) { setError("Veuillez sélectionner un professeur."); return; }

  const prerequisValides = prerequis.filter((p) => p.nom.trim() !== "");
  const token = localStorage.getItem("adminToken");
  setSaving(true);

  try {
    const body = JSON.stringify({
      ...(editingModule ? { id: editingModule.id } : { adminId: ADMIN_ID }),
      nom: nom.trim(),
      coefficient: parseFloat(coeff) || 0,
      professeurCin: profCin.trim(),
      prerequis: prerequisValides.map((p) => p.nom),
      isObligatoire: prerequisValides.map((p) => p.obl),
    });

    const res = await fetch(API, {
      method: editingModule ? "PUT" : "POST",  // ← PUT si édition
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body,
    });

    const data = await res.json();
    if (data.success) { resetForm(); await chargerModules(); }
    else setError(data.message || "Erreur lors de l'enregistrement.");
  } catch { setError("Impossible de contacter le serveur."); }
  finally { setSaving(false); }
};


 const handleDelete = async (id: number) => {
  if (!confirm("Supprimer ce module et ses prérequis ?")) return;
  setDeleting(id);
  try {
    const token = localStorage.getItem("adminToken");
    await fetch(`${API}?id=${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    await chargerModules();
  } finally { setDeleting(null); }
};

const handleEdit = (m: Module) => {
  setEditingModule(m);
  setNom(m.nom);
  setCoeff(String(m.coefficient));
  setProfCin(m.professeurCin);
  setProfDisplayName(`${m.professeurPrenom ?? ""} ${m.professeurNom ?? ""}`.trim()); // ← ajout
  setPrerequis(
    m.prerequis.length > 0
      ? m.prerequis.map((p) => ({ nom: p.nom, obl: p.isObligatoire }))
      : [{ nom: "", obl: false }]
  );
  setShowForm(true);
};

  return (
    <div style={{ padding: "28px" }}>

      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#2C2C2A" }}>Gestion des modules</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888780" }}>
            {modules.length} module{modules.length !== 1 ? "s" : ""} enregistré{modules.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            background: showForm ? "#D3D1C7" : "#185FA5",
            color: showForm ? "#2C2C2A" : "#fff",
            border: "none", borderRadius: "10px",
            padding: "10px 20px", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
            transition: "background 0.2s",
          }}
        >
          <span style={{ fontSize: "18px", lineHeight: 1 }}>{showForm ? "✕" : "+"}</span>
          {showForm ? "Annuler" : "Ajouter un module"}
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div ref={formRef} style={{
          background: "#fff", borderRadius: "14px",
          border: "1.5px solid #185FA5", padding: "24px",
          marginBottom: "24px", boxShadow: "0 4px 20px rgba(24,95,165,0.10)",
        }}>
         <div style={{ fontSize: "15px", fontWeight: 700, color: "#185FA5", marginBottom: "20px" }}>
  {editingModule ? `Modifier — ${editingModule.nom}` : "Nouveau module"}
</div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px", marginBottom: "14px" }}>
            <div>
              <label style={labelStyle}>Nom du module *</label>
              <input value={nom} onChange={(e) => setNom(e.target.value)}
                placeholder="ex: Algorithmique avancée" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Coefficient</label>
              <input type="number" min="0" step="0.5" value={coeff}
                onChange={(e) => setCoeff(e.target.value)} placeholder="ex: 2.5" style={inputStyle} />
            </div>
          </div>

          {/* Sélecteur professeur */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Professeur *</label>
<ProfesseurSelector
  value={profCin}
  displayName={profDisplayName}  
  onChange={setProfCin}
/>          </div>

          {/* Prérequis */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#2C2C2A", marginBottom: "10px" }}>
              Prérequis
              <span style={{ fontSize: "11px", fontWeight: 400, color: "#888780", marginLeft: "8px" }}>(optionnel — 0 ou plusieurs)</span>
            </div>
            {prerequis.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <input
                  value={p.nom}
                  onChange={(e) => updatePrereq(i, "nom", e.target.value)}
                  placeholder={`Prérequis ${i + 1}`}
                  style={{ ...inputStyle, flex: 1, margin: 0 }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#888780", whiteSpace: "nowrap", cursor: "pointer" }}>
                  <input type="checkbox" checked={p.obl}
                    onChange={(e) => updatePrereq(i, "obl", e.target.checked)}
                    style={{ accentColor: "#185FA5", width: "14px", height: "14px" }} />
                  Obligatoire
                </label>
                <button onClick={ajouterPrereq} title="Ajouter" style={iconBtnStyle("#EAF3DE", "#27500A")}>+</button>
                <button onClick={() => supprimerPrereq(i)} title="Supprimer" disabled={prerequis.length === 1}
                  style={iconBtnStyle(prerequis.length === 1 ? "#F1EFE8" : "#FCEBEB", prerequis.length === 1 ? "#D3D1C7" : "#A32D2D")}>−</button>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ marginTop: "12px", background: "#FCEBEB", color: "#791F1F", borderRadius: "8px", padding: "10px 14px", fontSize: "13px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button onClick={handleSubmit} disabled={saving} style={{
              background: saving ? "#A0BEDD" : "#185FA5", color: "#fff",
              border: "none", borderRadius: "10px", padding: "10px 24px",
              fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
            }}>
                {saving ? "Enregistrement…" : editingModule ? "Enregistrer les modifications" : "Enregistrer le module"}            </button>
            <button onClick={resetForm} style={{
              background: "transparent", color: "#888780",
              border: "1.5px solid #D3D1C7", borderRadius: "10px",
              padding: "10px 20px", fontSize: "13px", cursor: "pointer",
            }}>Annuler</button>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#888780", fontSize: "14px" }}>Chargement…</div>
      ) : modules.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: "14px", border: "1.5px solid #D3D1C7", padding: "48px", textAlign: "center", color: "#888780", fontSize: "14px" }}>
          Aucun module enregistré. Cliquez sur « Ajouter un module » pour commencer.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {modules.map((m) => (
            <div key={m.id} style={{ background: "#fff", borderRadius: "12px", border: "1.5px solid #D3D1C7", overflow: "hidden" }}>

              {/* Carte module */}
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer" }}
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>
                    📘
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#2C2C2A" }}>{m.nom}</div>
                    <div style={{ fontSize: "12px", color: "#888780", marginTop: "2px" }}>
                      <div style={{ fontSize: "12px", color: "#888780", marginTop: "2px" }}>
  Coeff. {m.coefficient}
  {(m.professeurPrenom || m.professeurNom) && 
    ` · ${m.professeurPrenom ?? ""} ${m.professeurNom ?? ""}`.trim()
  }
</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    background: m.prerequis.length > 0 ? "#E6F1FB" : "#F1EFE8",
                    color: m.prerequis.length > 0 ? "#0C447C" : "#888780",
                    borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 600,
                  }}>
                    {m.prerequis.length} prérequis
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                    disabled={deleting === m.id}
                    style={{ background: "#FCEBEB", color: "#A32D2D", border: "none", borderRadius: "8px", padding: "6px 10px", fontSize: "13px", cursor: "pointer", fontWeight: 700 }}
                  >
                    {deleting === m.id ? "…" : "🗑"}
                  </button>
                  <button
  onClick={(e) => { e.stopPropagation(); handleEdit(m); }}
  style={{
    background: "#E6F1FB", color: "#185FA5",
    border: "none", borderRadius: "8px",
    padding: "6px 10px", fontSize: "13px",
    cursor: "pointer", fontWeight: 700
  }}
>
  ✏️
</button>
                  <span style={{ fontSize: "12px", color: "#888780", transform: expanded === m.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
                </div>
              </div>

              {/* Accordion prérequis */}
              {expanded === m.id && (
                <div style={{ borderTop: "1px solid #F1EFE8", padding: "14px 20px 16px", background: "#FAFAF8" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#888780", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Prérequis</div>
                  {m.prerequis.length === 0 ? (
                    <div style={{ fontSize: "13px", color: "#B0ADA4", fontStyle: "italic" }}>Aucun prérequis pour ce module.</div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {m.prerequis.map((p) => (
                        <span key={p.id} style={{
                          background: p.isObligatoire ? "#FAEEDA" : "#EAF3DE",
                          color: p.isObligatoire ? "#633806" : "#27500A",
                          borderRadius: "20px", padding: "4px 12px",
                          fontSize: "12px", fontWeight: 600,
                          display: "flex", alignItems: "center", gap: "5px",
                        }}>
                          {p.isObligatoire ? "⚠ " : "✓ "}{p.nom}
                          {p.isObligatoire && <span style={{ fontSize: "10px", opacity: 0.7 }}>(obligatoire)</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Onglets placeholder (Étudiants, Professeurs)
// ═════════════════════════════════════════════════════════════════════════════
function TabVide({ label }: { label: string }) {
  return (
    <div style={{ padding: "28px" }}>
      <div style={{ background: "#fff", borderRadius: "14px", border: "1.5px solid #D3D1C7", padding: "60px", textAlign: "center", color: "#888780", fontSize: "14px" }}>
        Section <strong>{label}</strong> — en cours de développement.
      </div>
    </div>
  );
}