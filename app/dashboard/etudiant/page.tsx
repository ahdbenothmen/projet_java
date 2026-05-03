"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_MODULES = "http://localhost:8080/universite-backend/api/etudiant/modules";
const API_INSCRIRE = "http://localhost:8080/universite-backend/api/etudiant/modules/inscrire";

interface Prerequis {
  id: number;
  nom: string;
  obligatoire: boolean;
  checked: boolean;
}

interface Module {
  id: number;
  nom: string;
  coefficient: number;
  professeur: string;
  inscrit: boolean;
  prerequis: Prerequis[];
}

interface EtudiantData {
  cin: string;
  nom: string;
  prenom: string;
  email: string;
  niveau: string;
  statut: string;
  role: string;
}

export default function DashboardEtudiant() {
  const router = useRouter();
  const [etudiant, setEtudiant]     = useState<EtudiantData | null>(null);
  const [modules, setModules]       = useState<Module[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<"disponibles" | "inscrits">("disponibles");
  const [modulePopup, setModulePopup] = useState<Module | null>(null);
  const [saving, setSaving]         = useState(false);
  const [notif, setNotif]           = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const getToken = () => localStorage.getItem("etudiantToken") ?? "";

  useEffect(() => {
  const token = localStorage.getItem("etudiantToken");
  if (!token) { router.replace("/login/etudiant"); return; }

  // Charger le profil depuis le backend
  fetch("http://localhost:8080/universite-backend/api/etudiant/profile", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (res.status === 401) { router.replace("/login/etudiant"); return null; }
      return res.json();
    })
    .then((data) => {
      if (data) setEtudiant(data);
    })
    .catch(() => router.replace("/login/etudiant"));
}, []);

  useEffect(() => {
    if (etudiant) chargerModules();
  }, [etudiant]);

  const chargerModules = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_MODULES, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      // Ajouter checked: false à chaque prérequis
      const modulesAvecCheck = (Array.isArray(data) ? data : []).map((m: Module) => ({
        ...m,
        prerequis: m.prerequis.map((p) => ({ ...p, checked: false })),
      }));
      setModules(modulesAvecCheck);
    } catch {
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotif = (msg: string, type: "success" | "error") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const handleOuvrirPopup = (module: Module) => {
    setModulePopup({
      ...module,
      prerequis: module.prerequis.map((p) => ({ ...p, checked: false })),
    });
  };

  const handleCheckPrerequis = (id: number) => {
    if (!modulePopup) return;
    setModulePopup({
      ...modulePopup,
      prerequis: modulePopup.prerequis.map((p) =>
        p.id === id ? { ...p, checked: !p.checked } : p
      ),
    });
  };

  const handleValiderInscription = async () => {
    if (!modulePopup) return;

    // Vérifier prérequis obligatoires
    const nonCoche = modulePopup.prerequis.find((p) => p.obligatoire && !p.checked);
    if (nonCoche) {
      showNotif(`❌ Le prérequis obligatoire "${nonCoche.nom}" n'est pas validé.`, "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(API_INSCRIRE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ moduleId: modulePopup.id }),
      });
      const data = await res.json();
      if (data.success) {
        showNotif(`✅ Inscription au module "${modulePopup.nom}" réussie !`, "success");
        setModulePopup(null);
        await chargerModules();
      } else {
        showNotif(data.message || "Erreur", "error");
      }
    } catch {
      showNotif("Impossible de contacter le serveur.", "error");
    } finally {
      setSaving(false);
    }
  };

  const API_DESINSCRIRE = "http://localhost:8080/universite-backend/api/etudiant/modules";

const handleDesinscrire = async (module: Module) => {
  if (!confirm(`Se désinscrire du module "${module.nom}" ?`)) return;

  try {
    const res = await fetch(`${API_DESINSCRIRE}?moduleId=${module.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (data.success) {
      showNotif(`✅ Désinscription du module "${module.nom}" réussie.`, "success");
      await chargerModules();
    } else {
      showNotif(data.message || "Erreur lors de la désinscription.", "error");
    }
  } catch {
    showNotif("Impossible de contacter le serveur.", "error");
  }
};
 const handleLogout = () => {
  localStorage.removeItem("etudiantToken");
  router.replace("/login/etudiant");
};

  if (!etudiant) return null;

  const modulesDisponibles = modules.filter((m) => !m.inscrit);
  const modulesInscrits    = modules.filter((m) => m.inscrit);

  return (
    <div style={{ minHeight: "100vh", background: "#E6F1FB", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Toast */}
      {notif && (
        <div style={{
          position: "fixed", top: "24px", right: "28px", zIndex: 2000,
          background: notif.type === "success" ? "#EAF3DE" : "#FCEBEB",
          color: notif.type === "success" ? "#27500A" : "#791F1F",
          border: `1.5px solid ${notif.type === "success" ? "#C0DD97" : "#F7C1C1"}`,
          borderRadius: "12px", padding: "14px 20px",
          fontSize: "13px", fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxWidth: "380px",
        }}>
          {notif.msg}
        </div>
      )}

      {/* Popup prérequis */}
      {modulePopup && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
        }}>
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "32px",
            maxWidth: "500px", width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 700, color: "#2C2C2A" }}>
              S&apos;inscrire au module
            </h2>
            <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#185FA5", fontWeight: 600 }}>
              {modulePopup.nom}
            </p>

            {/* Prérequis */}
            {modulePopup.prerequis.length > 0 ? (
              <div style={{ marginBottom: "24px" }}>
                <p style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: 700, color: "#2C2C2A", textTransform: "uppercase" }}>
                  📋 Prérequis à valider :
                </p>
                {modulePopup.prerequis.map((p) => (
                  <div key={p.id} onClick={() => handleCheckPrerequis(p.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 16px", marginBottom: "8px",
                      background: p.checked ? "#E8F5E9" : "#F5F9FF",
                      border: `1.5px solid ${p.checked ? "#66BB6A" : p.obligatoire ? "#EF5350" : "#D3D1C7"}`,
                      borderRadius: "10px", cursor: "pointer", transition: "all 0.2s",
                    }}>
                    {/* Checkbox custom */}
                    <div style={{
                      width: "22px", height: "22px", borderRadius: "6px",
                      border: `2px solid ${p.checked ? "#66BB6A" : "#D3D1C7"}`,
                      background: p.checked ? "#66BB6A" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {p.checked && <span style={{ color: "#fff", fontSize: "14px" }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "#2C2C2A" }}>
                      {p.nom}
                    </div>
                    {p.obligatoire && (
                      <span style={{
                        fontSize: "11px", fontWeight: 700,
                        background: "#FFEBEE", color: "#EF5350",
                        padding: "3px 8px", borderRadius: "6px",
                      }}>
                        Obligatoire
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginBottom: "24px", padding: "14px", background: "#EAF3DE", borderRadius: "10px", fontSize: "13px", color: "#27500A", fontWeight: 600 }}>
                ✅ Aucun prérequis pour ce module.
              </div>
            )}

            {/* Boutons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setModulePopup(null)} style={{
                flex: 1, background: "#E6E4DC", color: "#2C2C2A",
                border: "none", borderRadius: "10px", padding: "12px",
                fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}>
                Annuler
              </button>
              <button onClick={handleValiderInscription} disabled={saving} style={{
                flex: 1, background: saving ? "#A0BEDD" : "#185FA5", color: "#fff",
                border: "none", borderRadius: "10px", padding: "12px",
                fontSize: "14px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
              }}>
                {saving ? "En cours…" : "Confirmer l'inscription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#185FA5", color: "#fff", padding: "24px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>Portail Étudiant</h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", opacity: 0.9 }}>Gestion des inscriptions aux modules</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{etudiant.prenom} {etudiant.nom}</div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>{etudiant.niveau} — {etudiant.email}</div>
            </div>
            <div style={{
              width: "48px", height: "48px", background: "#fff",
              borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#185FA5",
            }}>
              {etudiant.prenom?.charAt(0)}{etudiant.nom?.charAt(0)}
            </div>
            <button onClick={handleLogout} style={{
              background: "rgba(255,255,255,0.15)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.4)", borderRadius: "8px",
              padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
            }}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "13px", color: "#888780", marginBottom: "6px" }}>Modules inscrits</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#185FA5" }}>{modulesInscrits.length}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "13px", color: "#888780", marginBottom: "6px" }}>Modules disponibles</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#185FA5" }}>{modulesDisponibles.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: "24px", display: "flex", gap: "8px" }}>
          <button onClick={() => setActiveTab("disponibles")} style={{
            padding: "12px 24px",
            background: activeTab === "disponibles" ? "#185FA5" : "#fff",
            color: activeTab === "disponibles" ? "#fff" : "#2C2C2A",
            border: "none", borderRadius: "10px", fontSize: "14px",
            fontWeight: 600, cursor: "pointer",
          }}>
            📚 Modules disponibles
          </button>
          <button onClick={() => setActiveTab("inscrits")} style={{
            padding: "12px 24px",
            background: activeTab === "inscrits" ? "#185FA5" : "#fff",
            color: activeTab === "inscrits" ? "#fff" : "#2C2C2A",
            border: "none", borderRadius: "10px", fontSize: "14px",
            fontWeight: 600, cursor: "pointer",
          }}>
            ✅ Mes inscriptions
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#888780" }}>Chargement…</div>
        ) : (
          <>
            {/* Modules disponibles */}
            {activeTab === "disponibles" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {modulesDisponibles.length === 0 ? (
                  <div style={{ background: "#fff", borderRadius: "12px", padding: "48px", textAlign: "center", color: "#888780" }}>
                    Tous les modules sont déjà complétés.
                  </div>
                ) : modulesDisponibles.map((module) => (
                  <div key={module.id} style={{
                    background: "#fff", borderRadius: "12px", padding: "20px",
                    boxShadow: "0 4px 12px rgba(24,95,165,0.1)",
                    border: "2px solid #E6E4DC",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#2C2C2A" }}>{module.nom}</h3>
                        <div style={{ fontSize: "12px", color: "#888780", marginTop: "4px" }}>
                          👨‍🏫 {module.professeur} · Coeff. {module.coefficient}
                        </div>
                      </div>
                      <button onClick={() => handleOuvrirPopup(module)} style={{
                        background: "#185FA5", color: "#fff",
                        border: "none", borderRadius: "8px",
                        padding: "8px 16px", fontSize: "13px",
                        fontWeight: 600, cursor: "pointer",
                      }}>
                        S&apos;inscrire
                      </button>
                    </div>

                    {/* Prérequis résumé */}
                    {module.prerequis.length > 0 && (
                      <div style={{ borderTop: "1px solid #E6E4DC", paddingTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {module.prerequis.map((p) => (
                          <span key={p.id} style={{
                            background: p.obligatoire ? "#FFEBEE" : "#EAF3DE",
                            color: p.obligatoire ? "#EF5350" : "#27500A",
                            borderRadius: "20px", padding: "3px 10px",
                            fontSize: "11px", fontWeight: 600,
                          }}>
                            {p.obligatoire ? "⚠ " : "✓ "}{p.nom}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Modules inscrits */}
            {modulesInscrits.map((module) => (
  <div key={module.id} style={{
    background: "#fff", borderRadius: "12px", padding: "20px",
    border: "2px solid #66BB6A",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{
          width: "40px", height: "40px", background: "#EAF3DE",
          borderRadius: "10px", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "20px",
        }}>✅</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#2C2C2A" }}>{module.nom}</div>
          <div style={{ fontSize: "12px", color: "#888780", marginTop: "2px" }}>
            👨‍🏫 {module.professeur} · Coeff. {module.coefficient}
          </div>
        </div>
      </div>

      {/* Bouton désinscription */}
      <button onClick={() => handleDesinscrire(module)} style={{
        background: "#FFEBEE", color: "#EF5350",
        border: "1.5px solid #EF5350", borderRadius: "8px",
        padding: "8px 14px", fontSize: "13px",
        fontWeight: 600, cursor: "pointer",
      }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#EF5350";
          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#FFEBEE";
          (e.currentTarget as HTMLButtonElement).style.color = "#EF5350";
        }}
      >
        Se désinscrire
      </button>
    </div>
  </div>
))}
          </>
        )}
      </div>
    </div>
  );
}