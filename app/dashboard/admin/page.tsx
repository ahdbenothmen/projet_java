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
// Ajouter avec les autres interfaces
interface AdminStats {
  profsApprouves: number; profsRejetes: number; profsAttente: number;
  etuApprouves: number;   etuRejetes: number;   etuAttente: number;
  totalModules: number;
}

interface EtudiantInscrit {
  cin: string; nom: string; prenom: string; email: string; niveau: string;
}

// Ajouter avec les autres constantes API
const STATS_API          = "http://localhost:8080/universite-backend/api/admin/stats";
const MODULE_ETU_API     = "http://localhost:8080/universite-backend/api/admin/module-etudiants";

const API      = "http://localhost:8080/universite-backend/api/modules";
const PROF_API = "http://localhost:8080/universite-backend/api/professeurs/search";
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
        {activeNav === "Étudiants" && <TabEtudiants />}
        {activeNav === "Professeurs" && <TabProfesseurs />}
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
  const [stats, setStats]               = useState<AdminStats | null>(null);
  const [modules, setModules]           = useState<Module[]>([]);
  const [moduleNbInscrits, setModuleNbInscrits] = useState<Record<number, number>>({});
  const [searchModule, setSearchModule] = useState("");
  const [modulePopup, setModulePopup]   = useState<Module | null>(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupEtudiants, setPopupEtudiants] = useState<EtudiantInscrit[]>([]);

  const getToken = () => localStorage.getItem("adminToken") ?? "";

  useEffect(() => {
    // Charger stats
    fetch(STATS_API, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json()).then((d) => setStats(d)).catch(() => {});

    // Charger modules + nb inscrits
    fetch(API, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then(async (data) => {
        const liste: Module[] = Array.isArray(data) ? data : [];
        setModules(liste);
        const entries = await Promise.all(
          liste.map(async (m) => {
            try {
              const r = await fetch(`${MODULE_ETU_API}?moduleId=${m.id}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
              });
              const d = await r.json();
              return [m.id, d.nbInscrits ?? 0] as [number, number];
            } catch { return [m.id, 0] as [number, number]; }
          })
        );
        setModuleNbInscrits(Object.fromEntries(entries));
      }).catch(() => {});
  }, []);

  const handleVoirEtudiants = async (m: Module) => {
    setModulePopup(m);
    setPopupLoading(true);
    setPopupEtudiants([]);
    try {
      const res = await fetch(`${MODULE_ETU_API}?moduleId=${m.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setPopupEtudiants(Array.isArray(data.etudiants) ? data.etudiants : []);
    } catch { setPopupEtudiants([]); }
    finally { setPopupLoading(false); }
  };

  const modulesFiltres = modules.filter((m) =>
    m.nom.toLowerCase().includes(searchModule.toLowerCase())
  );

  return (
    <div style={{ padding: "28px" }}>
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>Vue générale — Année 2025/2026</p>
      </div>

      {/* ── Modal étudiants inscrits ── */}
      {modulePopup && (
        <div onClick={() => setModulePopup(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          zIndex: 1500, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "560px",
            maxHeight: "85vh", overflowY: "auto", boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
          }}>
            <div style={{
              background: "#185FA5", padding: "20px 24px", borderRadius: "16px 16px 0 0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              position: "sticky", top: 0, zIndex: 10,
            }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Étudiants inscrits</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>
                  📘 {modulePopup.nom}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: 600 }}>
                  {popupLoading ? "…" : `${popupEtudiants.length} inscrit${popupEtudiants.length !== 1 ? "s" : ""}`}
                </span>
                <button onClick={() => setModulePopup(null)} style={{
                  background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
                  borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "16px",
                }}>✕</button>
              </div>
            </div>
            <div style={{ padding: "20px" }}>
              {popupLoading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#888780" }}>Chargement…</div>
              ) : popupEtudiants.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#888780", fontSize: "14px" }}>
                  Aucun étudiant inscrit à ce module.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {popupEtudiants.map((etu) => (
                    <div key={etu.cin} style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 14px", background: "#FAFAF8",
                      borderRadius: "10px", border: "1px solid #F1EFE8",
                    }}>
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "50%",
                        background: "#E6F1FB", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "13px", fontWeight: 700,
                        color: "#185FA5", flexShrink: 0,
                      }}>
                        {etu.prenom?.[0]}{etu.nom?.[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "#2C2C2A" }}>
                          {etu.prenom} {etu.nom}
                        </div>
                        <div style={{ fontSize: "11px", color: "#888780", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {etu.email}
                        </div>
                      </div>
                      <span style={{
                        background: "#E6F1FB", color: "#0C447C", borderRadius: "20px",
                        padding: "3px 10px", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap",
                      }}>
                        {etu.niveau || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    

      {/* KPI row 2 — stats temps réel */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "18px", border: "1.5px solid #D3D1C7" }}>
            <div style={{ fontSize: "12px", color: "#888780", marginBottom: "4px" }}>📘 Modules enregistrés</div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "#185FA5" }}>{stats.totalModules}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "18px", border: "1.5px solid #D3D1C7" }}>
            <div style={{ fontSize: "12px", color: "#888780", marginBottom: "10px" }}>👨‍🏫 Professeurs</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { label: "Approuvés",  value: stats.profsApprouves, bg: "#EAF3DE", color: "#27500A" },
                { label: "En attente", value: stats.profsAttente,   bg: "#FAEEDA", color: "#633806" },
                { label: "Refusés",    value: stats.profsRejetes,   bg: "#FCEBEB", color: "#791F1F" },
              ].map((s) => (
                <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "10px", color: s.color, marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "18px", border: "1.5px solid #D3D1C7" }}>
            <div style={{ fontSize: "12px", color: "#888780", marginBottom: "10px" }}>🎓 Étudiants</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { label: "Approuvés",  value: stats.etuApprouves, bg: "#EAF3DE", color: "#27500A" },
                { label: "En attente", value: stats.etuAttente,   bg: "#FAEEDA", color: "#633806" },
                { label: "Refusés",    value: stats.etuRejetes,   bg: "#FCEBEB", color: "#791F1F" },
              ].map((s) => (
                <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "10px", color: s.color, marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Liste des modules avec recherche ── */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1.5px solid #D3D1C7" }}>

        {/* En-tête + recherche */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#2C2C2A" }}>
            📘 Modules — inscriptions
            <span style={{ fontSize: "12px", fontWeight: 400, color: "#888780", marginLeft: "8px" }}>
              {modulesFiltres.length} module{modulesFiltres.length !== 1 ? "s" : ""}
            </span>
          </div>
          <input
            value={searchModule}
            onChange={(e) => setSearchModule(e.target.value)}
            placeholder="Rechercher un module…"
            style={{
              padding: "8px 14px", border: "1.5px solid #D3D1C7", borderRadius: "8px",
              fontSize: "13px", color: "#2C2C2A", background: "#FAFAF8",
              outline: "none", width: "220px",
            }}
          />
        </div>

        {/* Liste */}
        {modules.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "#888780", fontSize: "13px" }}>
            Chargement…
          </div>
        ) : modulesFiltres.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "#888780", fontSize: "13px" }}>
            Aucun module trouvé pour « {searchModule} »
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {modulesFiltres.map((m) => {
              const nb = moduleNbInscrits[m.id] ?? 0;
              return (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", background: "#FAFAF8",
                  borderRadius: "10px", border: "1px solid #F1EFE8",
                }}>
                  {/* Icône */}
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "9px",
                    background: "#E6F1FB", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "16px", flexShrink: 0,
                  }}>📘</div>

                  {/* Nom + prof */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "13px", color: "#2C2C2A" }}>{m.nom}</div>
                    <div style={{ fontSize: "11px", color: "#888780", marginTop: "2px" }}>
                      Coeff. {m.coefficient}
                      {(m.professeurPrenom || m.professeurNom) &&
                        ` · ${m.professeurPrenom ?? ""} ${m.professeurNom ?? ""}`.trim()}
                    </div>
                  </div>

                  {/* Badge nb inscrits — cliquable */}
                  <button
                    onClick={() => handleVoirEtudiants(m)}
                    title="Voir les étudiants inscrits"
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      background: nb > 0 ? "#E6F1FB" : "#F1EFE8",
                      color: nb > 0 ? "#0C447C" : "#888780",
                      border: `1.5px solid ${nb > 0 ? "#B8D4F0" : "#D3D1C7"}`,
                      borderRadius: "20px", padding: "5px 12px",
                      fontSize: "12px", fontWeight: 700, cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#185FA5";
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.borderColor = "#185FA5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = nb > 0 ? "#E6F1FB" : "#F1EFE8";
                      e.currentTarget.style.color = nb > 0 ? "#0C447C" : "#888780";
                      e.currentTarget.style.borderColor = nb > 0 ? "#B8D4F0" : "#D3D1C7";
                    }}
                  >
                    <span>🎓</span>
                    <span>{nb} étudiant{nb !== 1 ? "s" : ""}</span>
                    <span style={{ fontSize: "11px", opacity: 0.7 }}>👁</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
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
const res = await fetch(`${PROF_API}?q=${encodeURIComponent(q)}`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken") ?? ""}`,
  },
});        if (!res.ok) {
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

// ═══════════════════════════════════════════════════════
// Onglet Professeurs
// ═══════════════════════════════════════════════════════
const ADMIN_PROF_API = "http://localhost:8080/universite-backend/api/admin/professeurs";

interface ProfAdmin {
  cin: string; nom: string; prenom: string; email: string;
  telephone: string; adresse: string; status: string;
  dateInscription: string; diplomes: string; speciality: string;
  photo: string | null; photoCin: string | null; diplomePdf: string | null;
}

function TabProfesseurs() {
  const [tab, setTab]           = useState<"en_attente" | "approuve" | "rejete">("en_attente");
  const [profs, setProfs]       = useState<ProfAdmin[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<ProfAdmin | null>(null);
  const [acting, setActing]     = useState<string | null>(null);
  const [notif, setNotif]       = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ✅ Lire le token au moment du fetch, pas au render (fix SSR Next.js)
  const getToken = () => localStorage.getItem("adminToken") ?? "";

  const load = async (status: string, q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`${ADMIN_PROF_API}?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) {
        window.location.href = "/login/admin";
        return;
      }
      const data = await res.json();
      setProfs(Array.isArray(data) ? data : []);
    } catch {
      setProfs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(tab); }, [tab]);

  const showNotif = (msg: string, type: "success" | "error") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const handleAction = async (cin: string, action: "approuver" | "rejeter") => {
    setActing(cin + action);
    try {
      const res = await fetch(`${ADMIN_PROF_API}/${cin}/${action}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        showNotif(
          action === "approuver"
            ? "✅ Professeur approuvé — un email lui a été envoyé."
            : "❌ Professeur refusé — un email lui a été envoyé.",
          action === "approuver" ? "success" : "error"
        );
        setSelected(null);
        await load(tab, search);
      } else {
        showNotif(data.message || "Erreur", "error");
      }
    } catch {
      showNotif("Impossible de contacter le serveur.", "error");
    } finally {
      setActing(null);
    }
  };

  const TABS: { key: "en_attente" | "approuve" | "rejete"; label: string; color: string; bg: string }[] = [
    { key: "en_attente", label: "En attente", color: "#633806", bg: "#FAEEDA" },
    { key: "approuve",   label: "Approuvés",  color: "#27500A", bg: "#EAF3DE" },
    { key: "rejete",     label: "Refusés",    color: "#791F1F", bg: "#FCEBEB" },
  ];

  return (
    <div style={{ padding: "28px", position: "relative" }}>

      {/* ── Toast notification ── */}
      {notif && (
        <div style={{
          position: "fixed", top: "24px", right: "28px", zIndex: 2000,
          background: notif.type === "success" ? "#EAF3DE" : "#FCEBEB",
          color: notif.type === "success" ? "#27500A" : "#791F1F",
          border: `1.5px solid ${notif.type === "success" ? "#C0DD97" : "#F7C1C1"}`,
          borderRadius: "12px", padding: "14px 20px",
          fontSize: "13px", fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          maxWidth: "360px", lineHeight: 1.5,
          animation: "fadeIn 0.2s ease",
        }}>
          {notif.msg}
        </div>
      )}

      {/* ── En-tête ── */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#2C2C2A" }}>
          Gestion des professeurs
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888780" }}>
          Approuver, refuser ou consulter les dossiers
        </p>
      </div>

      {/* ── Onglets statut ── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch(""); }}
            style={{
              padding: "8px 20px", borderRadius: "20px", border: "none",
              background: tab === t.key ? t.bg : "#F1EFE8",
              color: tab === t.key ? t.color : "#888780",
              fontWeight: tab === t.key ? 700 : 400,
              fontSize: "13px", cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Recherche ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", maxWidth: "420px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") load(tab, search); }}
          placeholder="Rechercher par nom ou prénom…"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={() => load(tab, search)}
          style={{
            padding: "9px 18px", background: "#185FA5", color: "#fff",
            border: "none", borderRadius: "8px", fontSize: "13px",
            fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          Rechercher
        </button>
      </div>

      {/* ── Liste des professeurs ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#888780", fontSize: "14px" }}>
          Chargement…
        </div>
      ) : profs.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: "14px",
          border: "1.5px solid #D3D1C7", padding: "48px",
          textAlign: "center", color: "#888780", fontSize: "14px",
        }}>
          Aucun professeur dans cette catégorie.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {profs.map((p) => (
            <div
              key={p.cin}
              onClick={() => setSelected(p)}
              style={{
                background: "#fff", borderRadius: "12px",
                border: "1.5px solid #D3D1C7", padding: "14px 20px",
                display: "flex", alignItems: "center", gap: "16px",
                cursor: "pointer", transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(24,95,165,0.10)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              {/* Photo */}
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                overflow: "hidden", flexShrink: 0, background: "#E6F1FB",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #D3D1C7",
              }}>
                {p.photo
                  ? <img src={p.photo} alt={p.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "16px", fontWeight: 700, color: "#185FA5" }}>
                      {p.prenom?.[0]}{p.nom?.[0]}
                    </span>
                }
              </div>

              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "#2C2C2A" }}>
                  {p.prenom} {p.nom}
                </div>
                <div style={{ fontSize: "12px", color: "#888780", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.speciality || "Spécialité non renseignée"} · {p.email}
                </div>
              </div>

              {/* Badge statut */}
              <span style={{
                background:
                  p.status === "approuve" ? "#EAF3DE" :
                  p.status === "rejete"   ? "#FCEBEB" : "#FAEEDA",
                color:
                  p.status === "approuve" ? "#27500A" :
                  p.status === "rejete"   ? "#791F1F" : "#633806",
                borderRadius: "20px", padding: "3px 12px",
                fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap",
              }}>
                {p.status === "approuve" ? "Approuvé" :
                 p.status === "rejete"   ? "Refusé"   : "En attente"}
              </span>

              {/* Date */}
              <div style={{ fontSize: "11px", color: "#B0ADA4", whiteSpace: "nowrap" }}>
                {new Date(p.dateInscription).toLocaleDateString("fr-FR")}
              </div>

              {/* Icône œil */}
              <div style={{ fontSize: "18px", color: "#185FA5", flexShrink: 0 }}>👁</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal détail professeur ── */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)", zIndex: 1500,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: "16px",
              width: "100%", maxWidth: "600px",
              maxHeight: "88vh", overflowY: "auto",
              boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
            }}
          >
            {/* Header modal */}
            <div style={{
              background: "#185FA5", padding: "20px 24px",
              borderRadius: "16px 16px 0 0",
              display: "flex", alignItems: "center", gap: "14px",
              position: "sticky", top: 0, zIndex: 10,
            }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                overflow: "hidden", flexShrink: 0,
                border: "3px solid rgba(255,255,255,0.4)",
                background: "#0C447C",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {selected.photo
                  ? <img src={selected.photo} alt={selected.nom}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
                      {selected.prenom?.[0]}{selected.nom?.[0]}
                    </span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "17px", fontWeight: 700, color: "#fff" }}>
                  {selected.prenom} {selected.nom}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>
                  {selected.speciality || "Spécialité non renseignée"}
                </div>
              </div>
              {/* Badge statut dans le header */}
              <span style={{
                background: "rgba(255,255,255,0.2)",
                color: "#fff", borderRadius: "20px",
                padding: "4px 12px", fontSize: "12px", fontWeight: 600,
              }}>
                {selected.status === "approuve" ? "✅ Approuvé" :
                 selected.status === "rejete"   ? "❌ Refusé"  : "⏳ En attente"}
              </span>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "rgba(255,255,255,0.15)", border: "none",
                  color: "#fff", borderRadius: "8px",
                  padding: "6px 12px", cursor: "pointer", fontSize: "16px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Corps modal */}
            <div style={{ padding: "24px" }}>

              {/* Grille infos */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                {[
                  { label: "CIN",         value: selected.cin },
                  { label: "Email",       value: selected.email },
                  { label: "Téléphone",   value: selected.telephone || "—" },
                  { label: "Adresse",     value: selected.adresse   || "—" },
                  { label: "Diplôme",     value: selected.diplomes  || "—" },
                  { label: "Inscription", value: new Date(selected.dateInscription).toLocaleDateString("fr-FR") },
                ].map((f) => (
                  <div key={f.label} style={{
                    background: "#FAFAF8", borderRadius: "10px",
                    padding: "12px 14px", border: "1px solid #F1EFE8",
                  }}>
                    <div style={{ fontSize: "11px", color: "#888780", fontWeight: 600, marginBottom: "4px" }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: "13px", color: "#2C2C2A", fontWeight: 600, wordBreak: "break-all" }}>
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Photo CIN */}
              {selected.photoCin && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#888780", marginBottom: "8px" }}>
                    Photo CIN
                  </div>
                  <img
                    src={selected.photoCin} alt="CIN"
                    style={{
                      width: "100%", maxHeight: "160px", objectFit: "contain",
                      borderRadius: "10px", border: "1.5px solid #D3D1C7",
                      background: "#F1EFE8",
                    }}
                  />
                </div>
              )}

            {/* Diplôme PDF */}
{selected.diplomePdf && (
  <div style={{ marginBottom: "24px" }}>
    <div style={{ fontSize: "12px", fontWeight: 600, color: "#888780", marginBottom: "8px" }}>
      Diplôme (PDF)
    </div>
    <div style={{ display: "flex", gap: "10px" }}>
      {/* Bouton ouvrir dans nouvel onglet */}
      <button
        onClick={() => {
          const win = window.open();
          if (win) {
            win.document.write(
              `<iframe src="${selected.diplomePdf}" style="width:100%;height:100vh;border:none;"></iframe>`
            );
            win.document.title = `Diplôme — ${selected.prenom} ${selected.nom}`;
          }
        }}
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "#E6F1FB", color: "#185FA5", borderRadius: "8px",
          padding: "10px 16px", fontSize: "13px", fontWeight: 600,
          border: "none", cursor: "pointer",
        }}
      >
        📄 Visualiser le diplôme
      </button>

     
    </div>

  </div>
)}

              {/* ── Boutons d'action ── */}
              {selected.status === "en_attente" && (
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => handleAction(selected.cin, "approuver")}
                    disabled={!!acting}
                    style={{
                      flex: 1, border: "none", borderRadius: "10px",
                      padding: "13px", fontSize: "14px", fontWeight: 700,
                      cursor: acting ? "not-allowed" : "pointer",
                      background: acting ? "#C0DD97" : "#3B6D11",
                      color: "#fff", transition: "background 0.2s",
                    }}
                  >
                    {acting === selected.cin + "approuver" ? "Envoi en cours…" : "✅ Approuver"}
                  </button>
                  <button
                    onClick={() => handleAction(selected.cin, "rejeter")}
                    disabled={!!acting}
                    style={{
                      flex: 1, border: "none", borderRadius: "10px",
                      padding: "13px", fontSize: "14px", fontWeight: 700,
                      cursor: acting ? "not-allowed" : "pointer",
                      background: acting ? "#F7C1C1" : "#A32D2D",
                      color: "#fff", transition: "background 0.2s",
                    }}
                  >
                    {acting === selected.cin + "rejeter" ? "Envoi en cours…" : "❌ Refuser"}
                  </button>
                </div>
              )}

              {selected.status === "approuve" && (
                <div style={{
                  background: "#EAF3DE", color: "#27500A",
                  borderRadius: "10px", padding: "14px 16px",
                  fontSize: "13px", fontWeight: 600, textAlign: "center",
                }}>
                  ✅ Ce professeur a été approuvé — il peut se connecter à son espace.
                </div>
              )}

              {selected.status === "rejete" && (
                <div style={{
                  background: "#FCEBEB", color: "#791F1F",
                  borderRadius: "10px", padding: "14px 16px",
                  fontSize: "13px", fontWeight: 600, textAlign: "center",
                }}>
                  ❌ Ce professeur a été refusé.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// Onglet etudiants
// ═════════════════════════════════════════════════════════════════════════════
const ADMIN_ETU_API = "http://localhost:8080/universite-backend/api/admin/etudiants";

interface EtudiantAdmin {
  cin: string; nom: string; prenom: string; email: string;
  telephone: string; adresse: string; status: string;
  dateInscription: string; niveau: string; speciality: string;
  photo: string | null; photoCin: string | null;
}

function TabEtudiants() {
  const [tab, setTab]           = useState<"en_attente" | "approuve" | "rejete">("en_attente");
  const [etudiants, setEtudiants] = useState<EtudiantAdmin[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<EtudiantAdmin | null>(null);
  const [acting, setActing]     = useState<string | null>(null);
  const [notif, setNotif]       = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const getToken = () => localStorage.getItem("adminToken") ?? "";

  const load = async (status: string, q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`${ADMIN_ETU_API}?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) { window.location.href = "/login/admin"; return; }
      const data = await res.json();
      setEtudiants(Array.isArray(data) ? data : []);
    } catch {
      setEtudiants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(tab); }, [tab]);

  const showNotif = (msg: string, type: "success" | "error") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const handleAction = async (cin: string, action: "approuver" | "rejeter") => {
    setActing(cin + action);
    try {
      const res = await fetch(`${ADMIN_ETU_API}/${cin}/${action}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        showNotif(
          action === "approuver"
            ? "✅ Étudiant approuvé — un email lui a été envoyé."
            : "❌ Étudiant refusé — un email lui a été envoyé.",
          action === "approuver" ? "success" : "error"
        );
        setSelected(null);
        await load(tab, search);
      } else {
        showNotif(data.message || "Erreur", "error");
      }
    } catch {
      showNotif("Impossible de contacter le serveur.", "error");
    } finally {
      setActing(null);
    }
  };

  const TABS: { key: "en_attente" | "approuve" | "rejete"; label: string; color: string; bg: string }[] = [
    { key: "en_attente", label: "En attente", color: "#633806", bg: "#FAEEDA" },
    { key: "approuve",   label: "Approuvés",  color: "#27500A", bg: "#EAF3DE" },
    { key: "rejete",     label: "Refusés",    color: "#791F1F", bg: "#FCEBEB" },
  ];

  return (
    <div style={{ padding: "28px", position: "relative" }}>

      {/* Toast */}
      {notif && (
        <div style={{
          position: "fixed", top: "24px", right: "28px", zIndex: 2000,
          background: notif.type === "success" ? "#EAF3DE" : "#FCEBEB",
          color: notif.type === "success" ? "#27500A" : "#791F1F",
          border: `1.5px solid ${notif.type === "success" ? "#C0DD97" : "#F7C1C1"}`,
          borderRadius: "12px", padding: "14px 20px",
          fontSize: "13px", fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxWidth: "360px",
        }}>
          {notif.msg}
        </div>
      )}

      {/* En-tête */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#2C2C2A" }}>
          Gestion des étudiants
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888780" }}>
          Approuver, refuser ou consulter les dossiers
        </p>
      </div>

      {/* Onglets */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }}
            style={{
              padding: "8px 20px", borderRadius: "20px", border: "none",
              background: tab === t.key ? t.bg : "#F1EFE8",
              color: tab === t.key ? t.color : "#888780",
              fontWeight: tab === t.key ? 700 : 400,
              fontSize: "13px", cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", maxWidth: "420px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") load(tab, search); }}
          placeholder="Rechercher par nom ou prénom…"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={() => load(tab, search)} style={{
          padding: "9px 18px", background: "#185FA5", color: "#fff",
          border: "none", borderRadius: "8px", fontSize: "13px",
          fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
        }}>
          Rechercher
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#888780" }}>Chargement…</div>
      ) : etudiants.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: "14px", border: "1.5px solid #D3D1C7", padding: "48px", textAlign: "center", color: "#888780" }}>
          Aucun étudiant dans cette catégorie.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {etudiants.map((e) => (
            <div key={e.cin} onClick={() => setSelected(e)}
              style={{
                background: "#fff", borderRadius: "12px",
                border: "1.5px solid #D3D1C7", padding: "14px 20px",
                display: "flex", alignItems: "center", gap: "16px",
                cursor: "pointer", transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(ev) => (ev.currentTarget.style.boxShadow = "0 4px 16px rgba(24,95,165,0.10)")}
              onMouseLeave={(ev) => (ev.currentTarget.style.boxShadow = "none")}
            >
              {/* Photo */}
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                overflow: "hidden", flexShrink: 0, background: "#E6F1FB",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #D3D1C7",
              }}>
                {e.photo
                  ? <img src={e.photo} alt={e.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "16px", fontWeight: 700, color: "#185FA5" }}>{e.prenom?.[0]}{e.nom?.[0]}</span>
                }
              </div>

              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "#2C2C2A" }}>{e.prenom} {e.nom}</div>
                <div style={{ fontSize: "12px", color: "#888780", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.niveau || "—"} {e.speciality ? `· ${e.speciality}` : ""} · {e.email}
                </div>
              </div>

              {/* Badge */}
              <span style={{
                background: e.status === "approuve" ? "#EAF3DE" : e.status === "rejete" ? "#FCEBEB" : "#FAEEDA",
                color: e.status === "approuve" ? "#27500A" : e.status === "rejete" ? "#791F1F" : "#633806",
                borderRadius: "20px", padding: "3px 12px", fontSize: "11px", fontWeight: 600,
              }}>
                {e.status === "approuve" ? "Approuvé" : e.status === "rejete" ? "Refusé" : "En attente"}
              </span>

              <div style={{ fontSize: "11px", color: "#B0ADA4", whiteSpace: "nowrap" }}>
                {new Date(e.dateInscription).toLocaleDateString("fr-FR")}
              </div>

              <div style={{ fontSize: "18px", color: "#185FA5" }}>👁</div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          zIndex: 1500, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: "16px",
            width: "100%", maxWidth: "600px",
            maxHeight: "88vh", overflowY: "auto",
            boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
          }}>
            {/* Header */}
            <div style={{
              background: "#185FA5", padding: "20px 24px",
              borderRadius: "16px 16px 0 0",
              display: "flex", alignItems: "center", gap: "14px",
              position: "sticky", top: 0, zIndex: 10,
            }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                overflow: "hidden", flexShrink: 0,
                border: "3px solid rgba(255,255,255,0.4)", background: "#0C447C",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {selected.photo
                  ? <img src={selected.photo} alt={selected.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>{selected.prenom?.[0]}{selected.nom?.[0]}</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "17px", fontWeight: 700, color: "#fff" }}>{selected.prenom} {selected.nom}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>
                  {selected.niveau || "Niveau non renseigné"} {selected.speciality ? `· ${selected.speciality}` : ""}
                </div>
              </div>
              <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: 600 }}>
                {selected.status === "approuve" ? "✅ Approuvé" : selected.status === "rejete" ? "❌ Refusé" : "⏳ En attente"}
              </span>
              <button onClick={() => setSelected(null)} style={{
                background: "rgba(255,255,255,0.15)", border: "none",
                color: "#fff", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "16px",
              }}>✕</button>
            </div>

            {/* Corps */}
            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                {[
                  { label: "CIN",         value: selected.cin },
                  { label: "Email",       value: selected.email },
                  { label: "Téléphone",   value: selected.telephone || "—" },
                  { label: "Adresse",     value: selected.adresse   || "—" },
                  { label: "Niveau",      value: selected.niveau    || "—" },
                  { label: "Inscription", value: new Date(selected.dateInscription).toLocaleDateString("fr-FR") },
                ].map((f) => (
                  <div key={f.label} style={{ background: "#FAFAF8", borderRadius: "10px", padding: "12px 14px", border: "1px solid #F1EFE8" }}>
                    <div style={{ fontSize: "11px", color: "#888780", fontWeight: 600, marginBottom: "4px" }}>{f.label}</div>
                    <div style={{ fontSize: "13px", color: "#2C2C2A", fontWeight: 600, wordBreak: "break-all" }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* Photo CIN */}
              {selected.photoCin && (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#888780", marginBottom: "8px" }}>Photo CIN</div>
                  <img src={selected.photoCin} alt="CIN" style={{
                    width: "100%", maxHeight: "160px", objectFit: "contain",
                    borderRadius: "10px", border: "1.5px solid #D3D1C7", background: "#F1EFE8",
                  }} />
                </div>
              )}

              {/* Boutons action */}
              {selected.status === "en_attente" && (
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => handleAction(selected.cin, "approuver")} disabled={!!acting}
                    style={{
                      flex: 1, border: "none", borderRadius: "10px", padding: "13px",
                      fontSize: "14px", fontWeight: 700,
                      cursor: acting ? "not-allowed" : "pointer",
                      background: acting ? "#C0DD97" : "#3B6D11", color: "#fff",
                    }}>
                    {acting === selected.cin + "approuver" ? "Envoi en cours…" : "✅ Approuver"}
                  </button>
                  <button onClick={() => handleAction(selected.cin, "rejeter")} disabled={!!acting}
                    style={{
                      flex: 1, border: "none", borderRadius: "10px", padding: "13px",
                      fontSize: "14px", fontWeight: 700,
                      cursor: acting ? "not-allowed" : "pointer",
                      background: acting ? "#F7C1C1" : "#A32D2D", color: "#fff",
                    }}>
                    {acting === selected.cin + "rejeter" ? "Envoi en cours…" : "❌ Refuser"}
                  </button>
                </div>
              )}

              {selected.status === "approuve" && (
                <div style={{ background: "#EAF3DE", color: "#27500A", borderRadius: "10px", padding: "14px 16px", fontSize: "13px", fontWeight: 600, textAlign: "center" }}>
                  ✅ Cet étudiant a été approuvé — il peut se connecter à son espace.
                </div>
              )}

              {selected.status === "rejete" && (
                <div style={{ background: "#FCEBEB", color: "#791F1F", borderRadius: "10px", padding: "14px 16px", fontSize: "13px", fontWeight: 600, textAlign: "center" }}>
                  ❌ Cet étudiant a été refusé.
                </div>
              )}
            </div>
          </div>
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