"use client";
import { useState } from "react";

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
}

export default function DashboardEtudiant() {
  const [activeTab, setActiveTab] = useState<"disponibles" | "inscrits">("disponibles");
  const [selectedModuleDetail, setSelectedModuleDetail] = useState<Module | null>(null);

  const etudiant = {
    nom: "Ben Mohamed",
    cin: "12345678",
    email: "mohamed.ben@etudiant.tn",
    specialite: "Informatique",
    niveau: "L3",
    photo: "👨‍🎓"
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
      ]
    },
    {
      id: "6",
      nom: "Structures de Données",
      semestre: "S4",
      matieres: [
        { id: "m16", nom: "Arbres & Tas", coefficient: 2, professeur: "Dr. Amira Khaled" },
        { id: "m17", nom: "Graphes & Algorithmes", coefficient: 2, professeur: "Dr. Amira Khaled" },
        { id: "m18", nom: "Complexité algorithmique", coefficient: 1, professeur: "Dr. Amira Khaled" },
      ]
    }
  ];

  const selectedModules = modulesDisponibles.map(m => m.id);

  const handleInscrire = () => {
    alert(`Inscription confirmée pour ${selectedModules.length} module(s)`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#E6F1FB", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#185FA5", color: "#fff", padding: "24px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>Portail Étudiant</h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", opacity: 0.9 }}>Gestion des inscriptions aux modules</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{etudiant.nom}</div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>{etudiant.niveau} - {etudiant.specialite}</div>
            </div>
            <div style={{ width: "48px", height: "48px", background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
              {etudiant.photo}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>

        {/* Stats Cards */}
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
          <button
            onClick={() => { setActiveTab("disponibles"); setSelectedModuleDetail(null); }}
            style={{ padding: "12px 24px", background: activeTab === "disponibles" ? "#185FA5" : "#fff", color: activeTab === "disponibles" ? "#fff" : "#2C2C2A", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            📚 Modules disponibles
          </button>
          <button
            onClick={() => { setActiveTab("inscrits"); setSelectedModuleDetail(null); }}
            style={{ padding: "12px 24px", background: activeTab === "inscrits" ? "#185FA5" : "#fff", color: activeTab === "inscrits" ? "#fff" : "#2C2C2A", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            ✅ Mes inscriptions
          </button>
        </div>

        {/* ===== MODULES DISPONIBLES ===== */}
        {activeTab === "disponibles" && (
          <div>
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#2C2C2A" }}>Modules disponibles - Semestre 5</h2>
              <button
                onClick={handleInscrire}
                style={{ padding: "10px 20px", background: "#28a745", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
                onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#218838")}
                onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#28a745")}
              >
                S'inscrire ({selectedModules.length})
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {modulesDisponibles.map((module) => (
                <div key={module.id} style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 12px rgba(24,95,165,0.2)", border: "2px solid #185FA5" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "start" }}>
                    <input type="checkbox" checked={true} readOnly disabled style={{ width: "20px", height: "20px", marginTop: "4px", cursor: "not-allowed" }} />
                    <div style={{ flex: 1 }}>
                      
                      <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 700, color: "#2C2C2A" }}>{module.nom}</h3>

                      {/* Matières */}
                      <div style={{ borderTop: "1px solid #E6E4DC", paddingTop: "12px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#185FA5", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== MODULES INSCRITS ===== */}
        {activeTab === "inscrits" && (
          <div>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700, color: "#2C2C2A" }}>Mes modules inscrits - Semestre 4</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {modulesInscrits.map((module) => {
                const isOpen = selectedModuleDetail?.id === module.id;
                return (
                  <div key={module.id}>
                    {/* Carte module cliquable */}
                    <div
                      onClick={() => setSelectedModuleDetail(isOpen ? null : module)}
                      style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: isOpen ? "0 4px 16px rgba(24,95,165,0.2)" : "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer", border: isOpen ? "2px solid #185FA5" : "2px solid transparent", transition: "all 0.2s" }}
                    >
                      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                        <div style={{ width: "48px", height: "48px", background: "#28a745", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>✓</div>
                        <div style={{ flex: 1 }}>
                          
                          <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 700, color: "#2C2C2A" }}>{module.nom}</h3>
                        </div>
                        <div style={{ fontSize: "20px", color: "#185FA5", flexShrink: 0, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                          ▾
                        </div>
                      </div>
                    </div>

                    {/* Grand rectangle détail matières */}
                    {isOpen && (
                      <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", marginTop: "8px", boxShadow: "0 4px 20px rgba(24,95,165,0.15)", border: "2px solid #185FA5" }}>
                        {/* En-tête module */}
                        <div style={{ textAlign: "center", marginBottom: "28px", paddingBottom: "24px", borderBottom: "2px solid #E6F1FB" }}>
                          <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: 800, color: "#2C2C2A" }}>{module.nom}</h2>
                        </div>

                        {/* Liste des matières */}
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#185FA5", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                            📖 Matières du module
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {module.matieres.map((matiere, index) => (
                              <div key={matiere.id} style={{ display: "flex", alignItems: "center", gap: "16px", background: "#F5F9FF", borderRadius: "10px", padding: "16px 20px", border: "1px solid #E6F1FB" }}>
                                <div style={{ width: "36px", height: "36px", background: "#185FA5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: 700, flexShrink: 0 }}>
                                  {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#2C2C2A", marginBottom: "4px" }}>{matiere.nom}</div>
                                  <div style={{ fontSize: "12px", color: "#888780" }}>
                                    👨‍🏫 {matiere.professeur}
                                  </div>
                                </div>
                                <div style={{ background: "#185FA5", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, flexShrink: 0 }}>
                                  Coeff. {matiere.coefficient}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total crédits */}
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