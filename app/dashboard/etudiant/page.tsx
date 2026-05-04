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
  note: number | null;
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
const [showReleve, setShowReleve] = useState(false);

const calculerMoyenne = () => {
  const inscrits = modulesInscrits.filter((m) => m.note !== null);
  if (inscrits.length === 0) return null;
  const totalCoeff = inscrits.reduce((s, m) => s + m.coefficient, 0);
  const totalPoints = inscrits.reduce((s, m) => s + (m.note ?? 0) * m.coefficient, 0);
  return totalCoeff > 0 ? totalPoints / totalCoeff : null;
};

const telechargerPDF = () => {
  const moyenne = calculerMoyenne();
  const contenu = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #2C2C2A; }
        h1 { color: #185FA5; font-size: 22px; margin-bottom: 4px; }
        .subtitle { color: #888780; font-size: 13px; margin-bottom: 32px; }
        .info { background: #F5F9FF; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
        .info p { margin: 4px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        thead tr { background: #185FA5; color: #fff; }
        th { padding: 12px 14px; text-align: left; font-weight: 600; }
        td { padding: 11px 14px; border-bottom: 1px solid #F1EFE8; }
        tr:nth-child(even) { background: #F5F9FF; }
        .note-admis { color: #27500A; font-weight: 700; }
        .note-ajourn { color: #A32D2D; font-weight: 700; }
        .note-vide { color: #888780; }
        .moyenne-box { margin-top: 24px; background: #185FA5; color: #fff; border-radius: 12px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
        .moyenne-label { font-size: 15px; font-weight: 600; }
        .moyenne-val { font-size: 28px; font-weight: 800; }
        .footer { margin-top: 40px; font-size: 11px; color: #888780; text-align: center; border-top: 1px solid #F1EFE8; padding-top: 16px; }
      </style>
    </head>
    <body>
      <h1>Université de Mannouba</h1>
      <div class="subtitle">Relevé de notes — Année 2025/2026</div>
      <div class="info">
        <p><strong>Étudiant :</strong> ${etudiant?.prenom} ${etudiant?.nom}</p>
        <p><strong>Niveau :</strong> ${etudiant?.niveau || "—"}</p>
        <p><strong>Email :</strong> ${etudiant?.email}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Module</th>
            <th>Coefficient</th>
            <th>Note /20</th>
            <th>Résultat</th>
          </tr>
        </thead>
        <tbody>
          ${modulesInscrits.map((m, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${m.nom}</td>
              <td>${m.coefficient}</td>
              <td class="${m.note !== null ? (m.note >= 10 ? "note-admis" : "note-ajourn") : "note-vide"}">
                ${m.note !== null ? m.note.toFixed(2) : "—"}
              </td>
              <td class="${m.note !== null ? (m.note >= 10 ? "note-admis" : "note-ajourn") : "note-vide"}">
                ${m.note !== null ? (m.note >= 10 ? "Admis ✓" : "Ajourné ✗") : "En attente"}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="moyenne-box">
        <span class="moyenne-label">Moyenne générale pondérée</span>
        <span class="moyenne-val">${moyenne !== null ? moyenne.toFixed(2) + " /20" : "—"}</span>
      </div>
      <div class="footer">
        Document généré le ${new Date().toLocaleDateString("fr-FR")} — Université de Mannouba
      </div>
    </body>
    </html>
  `;

  const fenetre = window.open("", "_blank");
  if (!fenetre) return;
  fenetre.document.write(contenu);
  fenetre.document.close();
  fenetre.focus();
  setTimeout(() => fenetre.print(), 500);
};


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
             <button
            onClick={() => router.push("/dashboard/etudiant/profil")}              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              👤 Mon Profil
            </button>
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
<div style={{ display: "flex", justifyContent: "flex-end" }}>
  <button
    onClick={() => setShowReleve(true)}
    style={{
      background: "rgba(255,255,255,0.15)",
      color: "#000",
      border: "1px solid rgba(12, 12, 12, 0.4)",
      borderRadius: "8px",
      padding: "8px 16px",
      marginBottom: "6px",
      fontSize: "17px",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    📄 Relevé de notes
  </button>
</div>
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
          {activeTab === "inscrits" && (
  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
    {modulesInscrits.length === 0 ? (
      <div style={{ background: "#fff", borderRadius: "12px", padding: "48px", textAlign: "center", color: "#888780" }}>
        Aucune inscription pour le moment.
      </div>
    ) : modulesInscrits.map((module) => (
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
              {/* ← Note ici */}
              {module.note !== null ? (
                <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    background: module.note >= 10 ? "#EAF3DE" : "#FCEBEB",
                    color: module.note >= 10 ? "#27500A" : "#A32D2D",
                    borderRadius: "20px", padding: "3px 10px",
                    fontSize: "12px", fontWeight: 700,
                  }}>
                    Note : {module.note.toFixed(2)} /20
                  </span>
                  <span style={{
                    background: module.note >= 10 ? "#EAF3DE" : "#FCEBEB",
                    color: module.note >= 10 ? "#27500A" : "#A32D2D",
                    borderRadius: "20px", padding: "3px 10px",
                    fontSize: "11px", fontWeight: 600,
                  }}>
                    {module.note >= 10 ? "Admis ✓" : "Ajourné ✗"}
                  </span>
                </div>
              ) : (
                <div style={{ marginTop: "6px", fontSize: "12px", color: "#888780", fontStyle: "italic" }}>
                  ⏳ Note en attente
                </div>
              )}
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
  </div>
)}
          </>
        )}

        {/* Modal relevé de notes */}
{showReleve && (
  <div onClick={() => setShowReleve(false)} style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    zIndex: 1500, display: "flex", alignItems: "center",
    justifyContent: "center", padding: "24px",
  }}>
    <div onClick={(e) => e.stopPropagation()} style={{
      background: "#fff", borderRadius: "16px",
      width: "100%", maxWidth: "680px",
      maxHeight: "90vh", overflowY: "auto",
      boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    }}>
      {/* Header modal */}
      <div style={{
        background: "#185FA5", padding: "20px 24px",
        borderRadius: "16px 16px 0 0",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#fff" }}>
            📄 Relevé de notes
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>
            {etudiant.prenom} {etudiant.nom} — {etudiant.niveau || "—"}
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={telechargerPDF} style={{
            background: "#fff", color: "#185FA5",
            border: "none", borderRadius: "8px",
            padding: "8px 16px", fontSize: "13px",
            fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            ⬇️ Télécharger PDF
          </button>
          <button onClick={() => setShowReleve(false)} style={{
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", borderRadius: "8px",
            padding: "6px 12px", cursor: "pointer", fontSize: "16px",
          }}>✕</button>
        </div>
      </div>

      {/* Corps */}
      <div style={{ padding: "24px" }}>
        {/* Infos étudiant */}
        <div style={{
          background: "#F5F9FF", borderRadius: "10px",
          padding: "14px 18px", marginBottom: "20px",
          border: "1px solid #D8E8F5",
        }}>
          <div style={{ fontSize: "13px", color: "#2C2C2A" }}>
            <strong>Email :</strong> {etudiant.email}
          </div>
          <div style={{ fontSize: "13px", color: "#2C2C2A", marginTop: "4px" }}>
            <strong>Niveau :</strong> {etudiant.niveau || "—"}
          </div>
        </div>

        {/* Tableau des notes */}
        {modulesInscrits.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "#888780" }}>
            Aucun module inscrit.
          </div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#185FA5", color: "#fff" }}>
                  {["#", "Module", "Coefficient", "Note /20", "Résultat"].map((h) => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modulesInscrits.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid #F1EFE8", background: i % 2 === 0 ? "#fff" : "#F5F9FF" }}>
                    <td style={{ padding: "11px 14px", color: "#888780" }}>{i + 1}</td>
                    <td style={{ padding: "11px 14px", fontWeight: 600, color: "#2C2C2A" }}>{m.nom}</td>
                    <td style={{ padding: "11px 14px", color: "#2C2C2A" }}>{m.coefficient}</td>
                    <td style={{ padding: "11px 14px", fontWeight: 700,
                      color: m.note !== null ? (m.note >= 10 ? "#27500A" : "#A32D2D") : "#888780"
                    }}>
                      {m.note !== null ? m.note.toFixed(2) : "—"}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      {m.note !== null ? (
                        <span style={{
                          background: m.note >= 10 ? "#EAF3DE" : "#FCEBEB",
                          color: m.note >= 10 ? "#27500A" : "#A32D2D",
                          borderRadius: "20px", padding: "3px 10px",
                          fontSize: "11px", fontWeight: 700,
                        }}>
                          {m.note >= 10 ? "Admis ✓" : "Ajourné ✗"}
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#888780" }}>En attente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Moyenne générale */}
            {(() => {
              const moyenne = calculerMoyenne();
              const totalCoeff = modulesInscrits.filter(m => m.note !== null).reduce((s, m) => s + m.coefficient, 0);
              return (
                <div style={{
                  marginTop: "20px", background: "#185FA5",
                  borderRadius: "12px", padding: "18px 24px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
                      Moyenne générale pondérée
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                      {totalCoeff > 0 ? `Basée sur ${modulesInscrits.filter(m => m.note !== null).length} module(s) notés — Total coeff. ${totalCoeff}` : "Aucune note disponible"}
                    </div>
                  </div>
                  <div style={{
                    fontSize: "32px", fontWeight: 800, color: "#fff",
                  }}>
                    {moyenne !== null ? moyenne.toFixed(2) + " /20" : "—"}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}