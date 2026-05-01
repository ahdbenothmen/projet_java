"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Prerequis {
  id: number;
  nom: string;
  obligatoire: boolean;
  checked: boolean;
}

interface Matiere {
  id: string;
  nom: string;
  coefficient: number;
  professeur: string;
}

interface Module {
  id: string;
  nom: string;
  semestre: string;
  matieres: Matiere[];
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
  const [etudiant, setEtudiant] = useState<EtudiantData | null>(null);
  const [activeTab, setActiveTab] = useState<"disponibles" | "inscrits">("disponibles");
  const [selectedModuleDetail, setSelectedModuleDetail] = useState<Module | null>(null);
  const [modulePopup, setModulePopup] = useState<Module | null>(null);
  const [modulesInscritsIds, setModulesInscritsIds] = useState<string[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("etudiant");
    if (!data) {
      router.replace("/login/etudiant");
      return;
    }
    setEtudiant(JSON.parse(data));
  }, []);

  if (!etudiant) return null;

  const handleLogout = () => {
    localStorage.removeItem("etudiant");
    router.replace("/login/etudiant");
  };

  const modulesDisponibles: Module[] = [
    {
      id: "1",
      nom: "Base de données avancées",
      semestre: "S5",
      matieres: [
        { id: "m1", nom: "SQL Avancé", coefficient: 2, professeur: "Dr. Foulen Ben Foulen" },
        { id: "m2", nom: "Bases de données NoSQL", coefficient: 2, professeur: "Dr. Foulen Ben Foulen" },
        { id: "m3", nom: "Optimisation des requêtes", coefficient: 2, professeur: "Dr. Foulen Ben Foulen" },
      ],
      prerequis: [
        { id: 1, nom: "SQL Avancé", obligatoire: true, checked: false },
        { id: 2, nom: "Bases de données relationnelles", obligatoire: false, checked: false },
      ]
    },
    {
      id: "2",
      nom: "Développement Web Avancé",
      semestre: "S5",
      matieres: [
        { id: "m4", nom: "React & Next.js", coefficient: 2, professeur: "Dr. Salma Trabelsi" },
        { id: "m5", nom: "Node.js & Express", coefficient: 2, professeur: "Dr. Salma Trabelsi" },
        { id: "m6", nom: "APIs REST & GraphQL", coefficient: 2, professeur: "Dr. Salma Trabelsi" },
      ],
      prerequis: [
        { id: 3, nom: "HTML/CSS de base", obligatoire: true, checked: false },
        { id: 4, nom: "JavaScript", obligatoire: true, checked: false },
      ]
    },
    {
      id: "3",
      nom: "Intelligence Artificielle",
      semestre: "S5",
      matieres: [
        { id: "m7", nom: "Machine Learning", coefficient: 2, professeur: "Pr. Ahmed Gharbi" },
        { id: "m8", nom: "Réseaux de neurones", coefficient: 2, professeur: "Pr. Ahmed Gharbi" },
        { id: "m9", nom: "Vision par ordinateur", coefficient: 2, professeur: "Pr. Ahmed Gharbi" },
      ],
      prerequis: [
        { id: 5, nom: "Mathématiques (Algèbre linéaire)", obligatoire: true, checked: false },
        { id: 6, nom: "Python de base", obligatoire: true, checked: false },
        { id: 7, nom: "Statistiques", obligatoire: false, checked: false },
      ]
    },
    {
      id: "4",
      nom: "Sécurité Informatique",
      semestre: "S5",
      matieres: [
        { id: "m10", nom: "Cryptographie", coefficient: 2, professeur: "Dr. Leila Mansour" },
        { id: "m11", nom: "Sécurité réseau", coefficient: 2, professeur: "Dr. Leila Mansour" },
        { id: "m12", nom: "Audit & Conformité", coefficient: 1, professeur: "Dr. Leila Mansour" },
      ],
      prerequis: [
        { id: 8, nom: "Réseaux informatiques", obligatoire: true, checked: false },
        { id: 9, nom: "Systèmes d'exploitation", obligatoire: false, checked: false },
      ]
    }
  ];

  const modulesInscrits: Module[] = [
    {
      id: "5",
      nom: "Programmation Orientée Objet",
      semestre: "S4",
      matieres: [
        { id: "m13", nom: "Java Avancé", coefficient: 2, professeur: "Dr. Karim Ben Salem" },
        { id: "m14", nom: "C++ & Templates", coefficient: 2, professeur: "Dr. Karim Ben Salem" },
        { id: "m15", nom: "Design Patterns", coefficient: 2, professeur: "Dr. Karim Ben Salem" },
      ],
      prerequis: []
    },
    {
      id: "6",
      nom: "Structures de Données",
      semestre: "S4",
      matieres: [
        { id: "m16", nom: "Arbres & Tas", coefficient: 2, professeur: "Dr. Amira Khaled" },
        { id: "m17", nom: "Graphes & Algorithmes", coefficient: 2, professeur: "Dr. Amira Khaled" },
        { id: "m18", nom: "Complexité algorithmique", coefficient: 1, professeur: "Dr. Amira Khaled" },
      ],
      prerequis: []
    }
  ];

  // Ouvrir le popup prérequis
  const handleOuvrirPopup = (module: Module) => {
    const moduleAvecPrerequisReset = {
      ...module,
      prerequis: module.prerequis.map(p => ({ ...p, checked: false }))
    };
    setModulePopup(moduleAvecPrerequisReset);
  };

  // Cocher/décocher un prérequis
  const handleCheckPrerequis = (id: number) => {
    if (!modulePopup) return;
    setModulePopup({
      ...modulePopup,
      prerequis: modulePopup.prerequis.map(p =>
        p.id === id ? { ...p, checked: !p.checked } : p
      )
    });
  };

  // Valider l'inscription au module
  const handleValiderInscription = () => {
    if (!modulePopup) return;

    // Vérifier les prérequis obligatoires
    const prerequisObligatoireNonCoche = modulePopup.prerequis.find(
      p => p.obligatoire && !p.checked
    );

    if (prerequisObligatoireNonCoche) {
      alert(`❌ Vous ne pouvez pas vous inscrire ! Le prérequis obligatoire "${prerequisObligatoireNonCoche.nom}" n'est pas validé.`);
      return;
    }

    // Inscription réussie
    setModulesInscritsIds(prev => [...prev, modulePopup.id]);
    setModulePopup(null);
    alert(`✅ Vous êtes inscrit au module "${modulePopup.nom}" avec succès !`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#E6F1FB", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ===== POPUP PREREQUIS ===== */}
      {modulePopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px"
        }}>
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "32px",
            maxWidth: "500px", width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            {/* Titre popup */}
            <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 700, color: "#2C2C2A" }}>
              S'inscrire au module
            </h2>
            <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#185FA5", fontWeight: 600 }}>
              {modulePopup.nom}
            </p>

            {/* Liste prérequis */}
            <div style={{ marginBottom: "24px" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: 700, color: "#2C2C2A", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                📋 Prérequis à valider :
              </p>
              {modulePopup.prerequis.map(p => (
                <div key={p.id}
                  onClick={() => handleCheckPrerequis(p.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 16px", marginBottom: "8px",
                    background: p.checked ? "#E8F5E9" : "#F5F9FF",
                    border: `1.5px solid ${p.checked ? "#66BB6A" : p.obligatoire ? "#EF5350" : "#D3D1C7"}`,
                    borderRadius: "10px", cursor: "pointer",
                    transition: "all 0.2s"
                  }}>
                  {/* Checkbox custom */}
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "6px",
                    border: `2px solid ${p.checked ? "#66BB6A" : "#D3D1C7"}`,
                    background: p.checked ? "#66BB6A" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.2s"
                  }}>
                    {p.checked && <span style={{ color: "#fff", fontSize: "14px" }}>✓</span>}
                  </div>

                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#2C2C2A" }}>
                      {p.nom}
                    </span>
                  </div>

                  {/* Badge obligatoire */}
                  {p.obligatoire && (
                    <span style={{
                      fontSize: "11px", fontWeight: 700,
                      background: "#FFEBEE", color: "#EF5350",
                      padding: "3px 8px", borderRadius: "6px"
                    }}>
                      Obligatoire
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Boutons popup */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setModulePopup(null)}
                style={{
                  flex: 1, background: "#E6E4DC", color: "#2C2C2A",
                  border: "none", borderRadius: "10px", padding: "12px",
                  fontSize: "14px", fontWeight: 600, cursor: "pointer"
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleValiderInscription}
                style={{
                  flex: 1, background: "#185FA5", color: "#fff",
                  border: "none", borderRadius: "10px", padding: "12px",
                  fontSize: "14px", fontWeight: 600, cursor: "pointer"
                }}
                onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#134d87")}
                onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#185FA5")}
              >
                Confirmer l'inscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#185FA5", color: "#fff", padding: "24px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
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
            <div style={{ width: "48px", height: "48px", background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#185FA5" }}>
              {etudiant.prenom?.charAt(0)}{etudiant.nom?.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "13px", color: "#888780", marginBottom: "6px" }}>Modules inscrits</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#185FA5" }}>{modulesInscrits.length + modulesInscritsIds.length}</div>
          </div>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "13px", color: "#888780", marginBottom: "6px" }}>Modules disponibles</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#185FA5" }}>{modulesDisponibles.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: "24px", display: "flex", gap: "8px" }}>
          <button onClick={() => { setActiveTab("disponibles"); setSelectedModuleDetail(null); }}
            style={{ padding: "12px 24px", background: activeTab === "disponibles" ? "#185FA5" : "#fff", color: activeTab === "disponibles" ? "#fff" : "#2C2C2A", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            📚 Modules disponibles
          </button>
          <button onClick={() => { setActiveTab("inscrits"); setSelectedModuleDetail(null); }}
            style={{ padding: "12px 24px", background: activeTab === "inscrits" ? "#185FA5" : "#fff", color: activeTab === "inscrits" ? "#fff" : "#2C2C2A", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            ✅ Mes inscriptions
          </button>
        </div>

        {/* MODULES DISPONIBLES */}
        {activeTab === "disponibles" && (
          <div>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700, color: "#2C2C2A" }}>
              Modules disponibles - Semestre 5
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {modulesDisponibles.map((module) => {
                const dejaInscrit = modulesInscritsIds.includes(module.id);
                return (
                  <div key={module.id} style={{
                    background: "#fff", borderRadius: "12px", padding: "20px",
                    boxShadow: "0 4px 12px rgba(24,95,165,0.1)",
                    border: dejaInscrit ? "2px solid #28a745" : "2px solid #E6E4DC"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#2C2C2A" }}>
                        {module.nom}
                      </h3>
                      {/* Bouton S'inscrire par module */}
                      {dejaInscrit ? (
                        <span style={{
                          background: "#E8F5E9", color: "#28a745",
                          padding: "8px 16px", borderRadius: "8px",
                          fontSize: "13px", fontWeight: 600
                        }}>
                          ✅ Inscrit
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOuvrirPopup(module)}
                          style={{
                            background: "#185FA5", color: "#fff",
                            border: "none", borderRadius: "8px",
                            padding: "8px 16px", fontSize: "13px",
                            fontWeight: 600, cursor: "pointer",
                            transition: "background 0.2s"
                          }}
                          onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#134d87")}
                          onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#185FA5")}
                        >
                          S'inscrire
                        </button>
                      )}
                    </div>

                    {/* Matières */}
                    <div style={{ borderTop: "1px solid #E6E4DC", paddingTop: "12px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#185FA5", marginBottom: "8px", textTransform: "uppercase" }}>
                        📖 Matières ({module.matieres.length})
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {module.matieres.map((matiere) => (
                          <div key={matiere.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F5F9FF", borderRadius: "8px", padding: "8px 12px" }}>
                            <span style={{ fontSize: "13px", color: "#2C2C2A", fontWeight: 500 }}>{matiere.nom}</span>
                            <span style={{ fontSize: "12px", background: "#E6F1FB", color: "#185FA5", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>Coeff. {matiere.coefficient}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODULES INSCRITS */}
        {activeTab === "inscrits" && (
          <div>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700, color: "#2C2C2A" }}>Mes modules inscrits</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {modulesInscrits.map((module) => {
                const isOpen = selectedModuleDetail?.id === module.id;
                return (
                  <div key={module.id}>
                    <div onClick={() => setSelectedModuleDetail(isOpen ? null : module)}
                      style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: isOpen ? "0 4px 16px rgba(24,95,165,0.2)" : "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer", border: isOpen ? "2px solid #185FA5" : "2px solid transparent" }}>
                      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                        <div style={{ width: "48px", height: "48px", background: "#28a745", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>✓</div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#2C2C2A" }}>{module.nom}</h3>
                        </div>
                        <div style={{ fontSize: "20px", color: "#185FA5", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</div>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", marginTop: "8px", border: "2px solid #185FA5" }}>
                        <h2 style={{ textAlign: "center", margin: "0 0 24px 0", fontSize: "22px", fontWeight: 800, color: "#2C2C2A" }}>{module.nom}</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {module.matieres.map((matiere, index) => (
                            <div key={matiere.id} style={{ display: "flex", alignItems: "center", gap: "16px", background: "#F5F9FF", borderRadius: "10px", padding: "16px 20px" }}>
                              <div style={{ width: "36px", height: "36px", background: "#185FA5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: 700 }}>{index + 1}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "15px", fontWeight: 700, color: "#2C2C2A" }}>{matiere.nom}</div>
                                <div style={{ fontSize: "12px", color: "#888780" }}>👨‍🏫 {matiere.professeur}</div>
                              </div>
                              <div style={{ background: "#185FA5", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: 700 }}>Coeff. {matiere.coefficient}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}