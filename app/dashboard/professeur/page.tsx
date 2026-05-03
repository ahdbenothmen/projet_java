/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";

interface Etudiant {
  cin: string;
  nom: string;
  prenom: string;
  email: string;
  note?: number | null;
}

interface Module {
  id: number;
  nom: string;
  coefficient: number;
  nbEtudiants: number;
  couleur?: string;
}

type Page = "dashboard" | "modules" | "notes" | "statistiques";

interface ProfesseurSession {
  cin: string;
  nom: string;
  prenom: string;
  email: string;
  token: string;
}

// Stats calculées pour un module
interface ModuleStat {
  moduleId: number;
  etudiants: Etudiant[];
  loading: boolean;
}

const COULEURS = ["#185FA5", "#28a745", "#e67e22", "#8e44ad", "#e74c3c", "#16a085", "#2980b9", "#d35400"];

export default function DashboardProfesseur() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [prof, setProf] = useState<ProfesseurSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Modules
  const [modules, setModules] = useState<Module[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState<string | null>(null);

  // Module sélectionné + étudiants
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [etudiantsLoading, setEtudiantsLoading] = useState(false);

  // Notes par étudiant : cin -> valeur string
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savedMsg, setSavedMsg] = useState(false);

  // ─── STATS : moduleId -> { etudiants, loading } ───────────────────────────
  const [statsData, setStatsData] = useState<Record<number, ModuleStat>>({});

  // ─── SESSION ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const session = localStorage.getItem("professeur");
    if (!session) { window.location.href = "/login/professeur"; return; }
    try {
      const parsed = JSON.parse(session) as ProfesseurSession;
      setProf(parsed);
      fetchModules(parsed.cin);
    } catch {
      localStorage.removeItem("professeur");
      window.location.href = "/login/professeur";
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── FETCH MODULES ─────────────────────────────────────────────────────────
  const fetchModules = async (cin: string) => {
    setModulesLoading(true);
    setModulesError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/universite-backend/api/modules/professeur?cin=${cin}`,
        { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } }
      );
      const text = await res.text();
      if (text.trim().startsWith("<")) {
        setModulesError("Impossible de charger les modules.");
        return;
      }
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        const colored = data.map((m: Module, i: number) => ({ ...m, couleur: COULEURS[i % COULEURS.length] }));
        setModules(colored);
        // Fetch stats pour chaque module dès le chargement
        colored.forEach((m: Module) => fetchStatsModule(m.id));
      } else {
        setModulesError("Réponse inattendue du serveur.");
      }
    } catch {
      setModulesError("Erreur de connexion.");
    } finally {
      setModulesLoading(false);
    }
  };

  // ─── FETCH ÉTUDIANTS D'UN MODULE POUR LES STATS ───────────────────────────
  const fetchStatsModule = async (moduleId: number) => {
    setStatsData(prev => ({
      ...prev,
      [moduleId]: { moduleId, etudiants: prev[moduleId]?.etudiants ?? [], loading: true }
    }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/universite-backend/api/etudiants/module?moduleId=${moduleId}`,
        { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } }
      );
      const text = await res.text();
      if (text.trim().startsWith("<")) return;
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        setStatsData(prev => ({
          ...prev,
          [moduleId]: { moduleId, etudiants: data, loading: false }
        }));
      }
    } catch {
      setStatsData(prev => ({
        ...prev,
        [moduleId]: { moduleId, etudiants: [], loading: false }
      }));
    }
  };

  // ─── FETCH ÉTUDIANTS DU MODULE SÉLECTIONNÉ (avec leurs notes existantes) ──
  const fetchEtudiants = async (moduleId: number) => {
    setEtudiantsLoading(true);
    setEtudiants([]);
    setNotes({});
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/universite-backend/api/etudiants/module?moduleId=${moduleId}`,
        { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } }
      );
      const text = await res.text();
      if (text.trim().startsWith("<")) return;
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        setEtudiants(data);
        // ✅ FIX : note !== null && note !== undefined couvre aussi note=0
        //    on parse en Number pour éviter les surprises de type string "20.00"
        const initialNotes: Record<string, string> = {};
        data.forEach((e: Etudiant) => {
          const raw = e.note as unknown;
          if (raw !== null && raw !== undefined && raw !== "") {
            const num = Number(raw);
            if (!isNaN(num)) initialNotes[e.cin] = String(num);
          }
        });
        setNotes(initialNotes);
      }
    } catch (err) {
      console.error("Erreur étudiants:", err);
    } finally {
      setEtudiantsLoading(false);
    }
  };

  const handleSelectModule = (mod: Module) => {
    setSelectedModule(mod);
    fetchEtudiants(mod.id);
    setSavedMsg(false);
    setCurrentPage("notes");
  };

  // ─── LOGOUT ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("professeur");
    localStorage.removeItem("token");
    window.location.href = "/login/professeur";
  };

  // ─── GESTION NOTES ─────────────────────────────────────────────────────────
  const getNote = (cin: string) => notes[cin] ?? "";

  const setNote = (cin: string, value: string) => {
    if (value !== "" && (parseFloat(value) < 0 || parseFloat(value) > 20)) return;
    setNotes(prev => ({ ...prev, [cin]: value }));
    setSavedMsg(false);
  };

  const noteColor = (val: string) => {
    if (!val) return "#aaa";
    const n = parseFloat(val);
    if (n >= 14) return "#28a745";
    if (n >= 10) return "#f0a500";
    return "#dc3545";
  };

  // ─── SAUVEGARDER les notes ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedModule) return;
    try {
      const token = localStorage.getItem("token");
      const payload = etudiants.map(e => ({
        etudiantCin: e.cin,
        moduleId: selectedModule.id,
        note: getNote(e.cin) !== "" ? parseFloat(getNote(e.cin)) : null,
      }));
      const res = await fetch(
        `http://localhost:8080/universite-backend/api/notes/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        // ✅ FIX 1 : Sync etudiants avec les notes saisies → elles restent affichées
        const updatedEtudiants = etudiants.map(e => ({
          ...e,
          note: getNote(e.cin) !== "" ? parseFloat(getNote(e.cin)) : null,
        }));
        setEtudiants(updatedEtudiants);

        // ✅ FIX 2 : Mettre à jour statsData pour ce module aussi
        setStatsData(prev => ({
          ...prev,
          [selectedModule.id]: {
            moduleId: selectedModule.id,
            etudiants: updatedEtudiants,
            loading: false,
          }
        }));

        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
      } else {
        console.error("Erreur lors de la sauvegarde");
      }
    } catch (e) {
      console.error("Erreur save:", e);
    }
  };

  // ─── CALCUL STATS D'UN MODULE ──────────────────────────────────────────────
  const calcStats = (moduleId: number) => {
    const stat = statsData[moduleId];
    if (!stat || stat.loading || stat.etudiants.length === 0) {
      return { moyenne: null, admis: 0, ajournes: 0, sansNote: 0, total: stat?.etudiants.length ?? 0 };
    }
    const avecNote = stat.etudiants.filter(e => e.note != null);
    const admis = avecNote.filter(e => (e.note ?? 0) >= 10).length;
    const ajournes = avecNote.filter(e => (e.note ?? 0) < 10).length;
    const sansNote = stat.etudiants.length - avecNote.length;
    const moyenne = avecNote.length > 0
      ? avecNote.reduce((sum, e) => sum + (e.note ?? 0), 0) / avecNote.length
      : null;
    return { moyenne, admis, ajournes, sansNote, total: stat.etudiants.length };
  };

  // ✅ FIX 3 : Total étudiants dynamique depuis statsData (ou nbEtudiants fallback)
  const totalEtudiants = modules.reduce((s, m) => {
    const stat = statsData[m.id];
    return s + (stat ? stat.etudiants.length : m.nbEtudiants);
  }, 0);

  const navItems: { label: string; page: Page; icon: string }[] = [
    { label: "Tableau de bord", page: "dashboard",    icon: "🏠" },
    { label: "Mes modules",     page: "modules",      icon: "📚" },
    { label: "Statistiques",    page: "statistiques", icon: "📊" },
  ];

  const inputStyle = {
    width: "72px", padding: "6px 8px", border: "1.5px solid #d0dce8",
    borderRadius: "8px", fontSize: "14px", textAlign: "center" as const,
    outline: "none", fontFamily: "'Segoe UI', sans-serif", color: "#2C2C2A", background: "#fff",
  };

  // ─── LOADING ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: "center", color: "#185FA5" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
        <div style={{ fontSize: "15px", fontWeight: 600 }}>Vérification de la session...</div>
      </div>
    </div>
  );

  if (!prof) return null;

  // ─── MODAL LOGOUT ──────────────────────────────────────────────────────────
  const LogoutModal = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "32px 36px", maxWidth: "380px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>👋</div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 800, color: "#2C2C2A" }}>Se déconnecter ?</h3>
        <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#888780" }}>Toutes les notes non enregistrées seront perdues.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={() => setShowLogoutConfirm(false)} style={{ background: "#F1EFE8", color: "#2C2C2A", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Annuler</button>
          <button onClick={handleLogout} style={{ background: "#dc3545", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Se déconnecter</button>
        </div>
      </div>
    </div>
  );

  // ─── NAVBAR ────────────────────────────────────────────────────────────────
  const Navbar = () => (
    <div style={{ background: "#185FA5", color: "#fff", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "0.3px" }}>Portail Professeur</div>
          <div style={{ fontSize: "11px", opacity: 0.8 }}>Espace enseignant</div>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {navItems.map(item => (
            <button key={item.page}
              onClick={() => { setCurrentPage(item.page); setSelectedModule(null); }}
              style={{ background: currentPage === item.page ? "rgba(255,255,255,0.2)" : "transparent", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: currentPage === item.page ? 700 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "background 0.2s" }}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>{prof.prenom} {prof.nom}</div>
          <div style={{ fontSize: "11px", opacity: 0.8 }}>{prof.email}</div>
        </div>
        <div style={{ width: "42px", height: "42px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>👨‍🏫</div>
        <button onClick={() => setShowLogoutConfirm(true)}
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          onMouseOver={e => (e.currentTarget.style.background = "rgba(220,53,69,0.7)")}
          onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}>
          🚪 Déconnexion
        </button>
      </div>
    </div>
  );

  // ─── ERREUR MODULES ────────────────────────────────────────────────────────
  const ModulesErrorBanner = () => (
    <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ fontSize: "20px" }}>⚠️</span>
      <div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#856404" }}>Erreur de chargement des modules</div>
        <div style={{ fontSize: "13px", color: "#856404", marginTop: "2px" }}>{modulesError}</div>
      </div>
      <button onClick={() => prof && fetchModules(prof.cin)}
        style={{ marginLeft: "auto", background: "#ffc107", color: "#856404", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
        🔄 Réessayer
      </button>
    </div>
  );

  // ─── PAGE DASHBOARD ────────────────────────────────────────────────────────
  const PageDashboard = () => (
    <div style={{ padding: "32px" }}>
      <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: 800, color: "#2C2C2A" }}>
        Bonjour, {prof.prenom} {prof.nom} 👋
      </h2>
      <p style={{ margin: "0 0 32px 0", color: "#888780", fontSize: "14px" }}>
        Voici un aperçu de votre activité pour ce semestre.
      </p>
      {modulesError && <ModulesErrorBanner />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Modules assignés",     value: modules.length, icon: "📚", color: "#185FA5" },
          { label: "Total étudiants",       value: totalEtudiants, icon: "👨‍🎓", color: "#28a745" },
          { label: "Séances cette semaine", value: 6,              icon: "📅", color: "#8e44ad" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "22px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: `5px solid ${s.color}` }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.icon}</div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "13px", color: "#888780", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2C2C2A", marginBottom: "16px" }}>Accès rapide — Mes modules</h3>
      {modulesLoading ? (
        <div style={{ color: "#888780", fontSize: "14px" }}>⏳ Chargement...</div>
      ) : modules.length === 0 && !modulesError ? (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", textAlign: "center", color: "#888780", fontSize: "14px" }}>Aucun module assigné.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {modules.map(mod => (
            <div key={mod.id} onClick={() => handleSelectModule(mod)}
              style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", cursor: "pointer", borderTop: `4px solid ${mod.couleur}`, transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ fontWeight: 800, fontSize: "17px", color: "#2C2C2A" }}>{mod.nom}</div>
                <span style={{ background: mod.couleur, color: "#fff", borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>Coeff. {mod.coefficient}</span>
              </div>
              <div style={{ marginTop: "14px", fontSize: "13px", color: "#555" }}>
                👨‍🎓 {statsData[mod.id] ? statsData[mod.id].etudiants.length : mod.nbEtudiants} étudiants
              </div>
              <div style={{ marginTop: "14px", fontSize: "12px", color: mod.couleur, fontWeight: 600 }}>Voir les étudiants →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── PAGE MODULES ──────────────────────────────────────────────────────────
  const PageModules = () => (
    <div style={{ padding: "32px" }}>
      <h2 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: 800, color: "#2C2C2A" }}>📚 Mes modules</h2>
      <p style={{ margin: "0 0 28px 0", color: "#888780", fontSize: "14px" }}>Cliquez sur un module pour voir les étudiants et saisir les notes.</p>
      {modulesError && <ModulesErrorBanner />}
      {modulesLoading ? (
        <div style={{ color: "#888780" }}>⏳ Chargement des modules...</div>
      ) : modules.length === 0 && !modulesError ? (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", textAlign: "center", color: "#888780" }}>Aucun module assigné pour l'instant.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {modules.map(mod => (
            <div key={mod.id} onClick={() => handleSelectModule(mod)}
              style={{ background: "#fff", borderRadius: "14px", padding: "22px 26px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", cursor: "pointer", border: "2px solid transparent", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}
              onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.border = `2px solid ${mod.couleur}`; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.border = "2px solid transparent"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                <div style={{ width: "56px", height: "56px", background: mod.couleur, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", color: "#fff" }}>📖</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "17px", color: "#2C2C2A" }}>{mod.nom}</div>
                  <div style={{ fontSize: "13px", color: "#888780", marginTop: "4px" }}>Coefficient : {mod.coefficient}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: mod.couleur }}>
                    {statsData[mod.id] ? statsData[mod.id].etudiants.length : mod.nbEtudiants}
                  </div>
                  <div style={{ fontSize: "11px", color: "#888780" }}>étudiants</div>
                </div>
                <div style={{ fontSize: "22px", color: mod.couleur }}>→</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── PAGE NOTES ────────────────────────────────────────────────────────────
  const PageNotes = () => {
    if (!selectedModule) return (
      <div style={{ padding: "32px" }}><p style={{ color: "#888780" }}>Sélectionnez un module depuis "Mes modules".</p></div>
    );
    const mod = selectedModule;
    return (
      <div style={{ padding: "32px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "13px", color: "#888780" }}>
          <span style={{ cursor: "pointer", color: "#185FA5", fontWeight: 600 }} onClick={() => setCurrentPage("modules")}>Mes modules</span>
          <span>›</span>
          <span style={{ color: "#2C2C2A", fontWeight: 700 }}>{mod.nom}</span>
        </div>

        {/* Header module */}
        <div style={{ background: mod.couleur, borderRadius: "16px", padding: "24px 28px", color: "#fff", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800 }}>{mod.nom}</div>
            <div style={{ fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>Coefficient : {mod.coefficient}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "36px", fontWeight: 800 }}>{etudiants.length}</div>
            <div style={{ fontSize: "12px", opacity: 0.85 }}>étudiants</div>
          </div>
        </div>

        {/* Info */}
        <div style={{ background: "#F5F9FF", border: "1px solid #d8e8f5", borderRadius: "10px", padding: "12px 18px", marginBottom: "20px", display: "flex", gap: "12px", fontSize: "13px", color: "#555", alignItems: "center" }}>
          <span>ℹ️</span>
          <span>Saisissez ou modifiez la note de chaque étudiant sur <strong>20</strong>. Les notes existantes sont pré-remplies.</span>
        </div>

        {/* Tableau */}
        {etudiantsLoading ? (
          <div style={{ padding: "32px", textAlign: "center", color: "#888780" }}>⏳ Chargement des étudiants...</div>
        ) : etudiants.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", textAlign: "center", color: "#888780" }}>Aucun étudiant inscrit à ce module.</div>
        ) : (
          <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>

            {/* En-tête */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 130px 120px",
              background: "#F0F5FB",
              padding: "14px 20px",
              borderBottom: "2px solid #d8e8f5",
              fontSize: "12px", fontWeight: 700, color: "#185FA5",
              textTransform: "uppercase", letterSpacing: "0.5px"
            }}>
              <div>#</div>
              <div>Étudiant</div>
              <div style={{ textAlign: "center" }}>Note (/20)</div>
              <div style={{ textAlign: "center" }}>Résultat</div>
            </div>

            {/* Lignes */}
            {etudiants.map((etudiant, idx) => {
              const note = getNote(etudiant.cin);
              const noteNum = note !== "" ? parseFloat(note) : null;
              const admis = noteNum !== null && noteNum >= 10;
              return (
                <div key={etudiant.cin}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 130px 120px",
                    padding: "14px 20px",
                    borderBottom: "1px solid #f0f0f0",
                    alignItems: "center",
                    background: idx % 2 === 0 ? "#fff" : "#fafcff",
                    transition: "background 0.15s"
                  }}
                  onMouseOver={e => (e.currentTarget as HTMLDivElement).style.background = "#EFF6FF"}
                  onMouseOut={e => (e.currentTarget as HTMLDivElement).style.background = idx % 2 === 0 ? "#fff" : "#fafcff"}>

                  {/* # */}
                  <div style={{ fontSize: "13px", color: "#aaa", fontWeight: 600 }}>{idx + 1}</div>

                  {/* Étudiant */}
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#2C2C2A" }}>{etudiant.prenom} {etudiant.nom}</div>
                    <div style={{ fontSize: "11px", color: "#aaa" }}>CIN : {etudiant.cin}</div>
                  </div>

                  {/* Input note — ✅ toujours modifiable, pré-rempli depuis backend */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <input
                      type="number" min={0} max={20} step={0.25}
                      placeholder="—"
                      value={note}
                      onChange={e => setNote(etudiant.cin, e.target.value)}
                      style={{
                        ...inputStyle,
                        borderColor: note ? "#185FA5" : "#d0dce8",
                        color: note ? noteColor(note) : "#2C2C2A",
                        fontWeight: note ? 700 : 400,
                      }}
                    />
                  </div>

                  {/* Résultat */}
                  <div style={{ textAlign: "center" }}>
                    {noteNum !== null ? (
                      <span style={{
                        background: admis ? "#e8f5e9" : "#fdecea",
                        color: admis ? "#28a745" : "#dc3545",
                        padding: "4px 12px", borderRadius: "20px",
                        fontSize: "12px", fontWeight: 700
                      }}>
                        {admis ? "Admis ✓" : "Ajourné ✗"}
                      </span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#ccc" }}>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bouton sauvegarder */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", gap: "12px", alignItems: "center" }}>
          {savedMsg && <span style={{ fontSize: "13px", color: "#28a745", fontWeight: 600 }}>✅ Notes enregistrées avec succès !</span>}
          <button onClick={handleSave}
            style={{ background: "#185FA5", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 28px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(24,95,165,0.3)" }}
            onMouseOver={e => (e.currentTarget.style.background = "#144d8a")}
            onMouseOut={e => (e.currentTarget.style.background = "#185FA5")}>
            💾 Enregistrer les notes
          </button>
        </div>
      </div>
    );
  };

  // ─── PAGE STATISTIQUES (dynamique) ────────────────────────────────────────
  const PageStatistiques = () => (
    <div style={{ padding: "32px" }}>
      <h2 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: 800, color: "#2C2C2A" }}>📊 Statistiques</h2>
      <p style={{ margin: "0 0 28px 0", color: "#888780", fontSize: "14px" }}>Vue d'ensemble des résultats par module.</p>

      {/* Résumé global */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {(() => {
          let totalAdmis = 0, totalAjournes = 0, totalSansNote = 0;
          modules.forEach(m => {
            const s = calcStats(m.id);
            totalAdmis += s.admis;
            totalAjournes += s.ajournes;
            totalSansNote += s.sansNote;
          });
          return [
            { label: "Total étudiants", value: totalEtudiants, icon: "👨‍🎓", color: "#185FA5" },
            { label: "Admis",           value: totalAdmis,     icon: "✅",    color: "#28a745" },
            { label: "Ajournés",        value: totalAjournes,  icon: "❌",    color: "#dc3545" },
            { label: "Sans note",       value: totalSansNote,  icon: "⏳",    color: "#e67e22" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "22px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderLeft: `5px solid ${s.color}` }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{s.icon}</div>
              <div style={{ fontSize: "30px", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "13px", color: "#888780", marginTop: "4px" }}>{s.label}</div>
            </div>
          ));
        })()}
      </div>

      {/* Détail par module */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        {modules.map(mod => {
          const s = calcStats(mod.id);
          const stat = statsData[mod.id];
          const tauxAdmis = s.total > 0 && (s.admis + s.ajournes) > 0
            ? Math.round((s.admis / (s.admis + s.ajournes)) * 100)
            : null;

          return (
            <div key={mod.id} style={{ background: "#fff", borderRadius: "14px", padding: "22px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderTop: `4px solid ${mod.couleur}` }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "16px", color: "#2C2C2A" }}>{mod.nom}</div>
                  <div style={{ fontSize: "12px", color: "#888780", marginTop: "2px" }}>Coeff. {mod.coefficient} · {s.total} étudiants</div>
                </div>
                {stat?.loading && <span style={{ fontSize: "12px", color: "#888780" }}>⏳</span>}
              </div>

              {/* Moyenne */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ fontSize: "13px", color: "#555" }}>Moyenne générale</span>
                <span style={{
                  fontSize: "20px", fontWeight: 800,
                  color: s.moyenne === null ? "#ccc" : s.moyenne >= 10 ? "#28a745" : "#dc3545"
                }}>
                  {s.moyenne === null ? "—" : s.moyenne.toFixed(2) + " /20"}
                </span>
              </div>

              {/* Barre taux d'admission */}
              {tauxAdmis !== null && (
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888780", marginBottom: "6px" }}>
                    <span>Taux d'admission</span>
                    <span style={{ fontWeight: 700, color: mod.couleur }}>{tauxAdmis}%</span>
                  </div>
                  <div style={{ height: "8px", background: "#f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${tauxAdmis}%`, background: tauxAdmis >= 50 ? "#28a745" : "#dc3545", borderRadius: "4px", transition: "width 0.6s ease" }} />
                  </div>
                </div>
              )}

              {/* Admis / Ajournés / Sans note */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "12px" }}>
                {[
                  { label: "Admis",    value: s.admis,    color: "#28a745", bg: "#e8f5e9" },
                  { label: "Ajournés", value: s.ajournes, color: "#dc3545", bg: "#fdecea" },
                  { label: "Sans note",value: s.sansNote, color: "#e67e22", bg: "#fff3e0" },
                ].map((item, i) => (
                  <div key={i} style={{ background: item.bg, borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: "10px", color: item.color, fontWeight: 600, marginTop: "2px" }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Bouton accéder */}
              <button
                onClick={() => handleSelectModule(mod)}
                style={{ marginTop: "16px", width: "100%", background: mod.couleur, color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", opacity: 0.9 }}
                onMouseOver={e => (e.currentTarget.style.opacity = "1")}
                onMouseOut={e => (e.currentTarget.style.opacity = "0.9")}>
                ✏️ Saisir / modifier les notes
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#E6F1FB", fontFamily: "'Segoe UI', sans-serif" }}>
      {showLogoutConfirm && <LogoutModal />}
      <Navbar />
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {currentPage === "dashboard"    && <PageDashboard />}
        {currentPage === "modules"      && <PageModules />}
        {currentPage === "notes"        && <PageNotes />}
        {currentPage === "statistiques" && <PageStatistiques />}
      </div>
    </div>
  );
}