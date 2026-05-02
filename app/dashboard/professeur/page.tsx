/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState } from "react";

interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  cin: string;
}

interface Classe {
  id: string;
  nom: string;
  niveau: string;
  specialite: string;
  semestre: string;
  module: string;
  couleur: string;
  etudiants: Etudiant[];
}

type Page = "dashboard" | "classes" | "notes" | "statistiques" | "planning";

export default function DashboardProfesseur() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
  const [notes, setNotes] = useState<Record<string, { cc: string; ds: string; examen: string }>>({});
  const [savedMsg, setSavedMsg] = useState(false);

  const professeur = {
    nom: "Dr. Salma Trabelsi",
    specialite: "Développement Web",
    grade: "Maître de Conférences",
    photo: "👩‍🏫",
  };

  const classes: Classe[] = [
    {
      id: "c1",
      nom: "L3 Info A",
      niveau: "Licence 3",
      specialite: "Informatique",
      semestre: "S5",
      module: "Développement Web Avancé",
      couleur: "#185FA5",
      etudiants: [
        { id: "e1",  nom: "nom1",  prenom: "prenom1",  cin: "00000001" },
        { id: "e2",  nom: "nom2",  prenom: "prenom2",  cin: "00000002" },
        { id: "e3",  nom: "nom3",  prenom: "prenom3",  cin: "00000003" },
        { id: "e4",  nom: "nom4",  prenom: "prenom4",  cin: "00000004" },
        { id: "e5",  nom: "nom5",  prenom: "prenom5",  cin: "00000005" },
        { id: "e6",  nom: "nom6",  prenom: "prenom6",  cin: "00000006" },
      ]
    },
    {
      id: "c2",
      nom: "L3 Info B",
      niveau: "Licence 3",
      specialite: "Informatique",
      semestre: "S5",
      module: "Développement Web Avancé",
      couleur: "#28a745",
      etudiants: [
        { id: "e7",  nom: "nom7",  prenom: "prenom7",  cin: "00000007" },
        { id: "e8",  nom: "nom8",  prenom: "prenom8",  cin: "00000008" },
        { id: "e9",  nom: "nom9",  prenom: "prenom9",  cin: "00000009" },
        { id: "e10", nom: "nom10", prenom: "prenom10", cin: "00000010" },
        { id: "e11", nom: "nom11", prenom: "prenom11", cin: "00000011" },
      ]
    },
    {
      id: "c3",
      nom: "M1 GL",
      niveau: "Master 1",
      specialite: "Génie Logiciel",
      semestre: "S1",
      module: "Architectures Web",
      couleur: "#e67e22",
      etudiants: [
        { id: "e12", nom: "nom12", prenom: "prenom12", cin: "00000012" },
        { id: "e13", nom: "nom13", prenom: "prenom13", cin: "00000013" },
        { id: "e14", nom: "nom14", prenom: "prenom14", cin: "00000014" },
        { id: "e15", nom: "nom15", prenom: "prenom15", cin: "00000015" },
      ]
    }
  ];

  const getNote = (id: string, type: "cc" | "ds" | "examen") =>
    notes[id]?.[type] ?? "";

  const setNote = (id: string, type: "cc" | "ds" | "examen", value: string) => {
    if (value !== "" && (parseFloat(value) < 0 || parseFloat(value) > 20)) return;
    setNotes(prev => ({ ...prev, [id]: { ...prev[id], [type]: value } }));
    setSavedMsg(false);
  };

  const getMoyenne = (id: string) => {
    const cc = parseFloat(getNote(id, "cc"));
    const ds = parseFloat(getNote(id, "ds"));
    const ex = parseFloat(getNote(id, "examen"));
    if (isNaN(cc) || isNaN(ds) || isNaN(ex)) return null;
    return ((cc * 0.2) + (ds * 0.3) + (ex * 0.5)).toFixed(2);
  };

  const moyColor = (m: string | null) => {
    if (!m) return "#aaa";
    const n = parseFloat(m);
    if (n >= 14) return "#28a745";
    if (n >= 10) return "#f0a500";
    return "#dc3545";
  };

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const totalEtudiants = classes.reduce((s, c) => s + c.etudiants.length, 0);

  const navItems: { label: string; page: Page; icon: string }[] = [
    { label: "Tableau de bord", page: "dashboard",     icon: "🏠" },
    { label: "Mes classes",     page: "classes",       icon: "🏫" },
    { label: "Statistiques",    page: "statistiques",  icon: "📊" },
    { label: "Planning",        page: "planning",      icon: "📅" },
  ];

  // ─── STYLES ────────────────────────────────────────────────────────────────
  const inputStyle = {
    width: "72px",
    padding: "6px 8px",
    border: "1.5px solid #d0dce8",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center" as const,
    outline: "none",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#2C2C2A",
    background: "#fff",
  };

  // ─── NAVBAR ────────────────────────────────────────────────────────────────
  const Navbar = () => (
    <div style={{
      background: "#185FA5",
      color: "#fff",
      padding: "0 32px",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo + nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "0.3px" }}>Portail Professeur</div>
          <div style={{ fontSize: "11px", opacity: 0.8 }}>Espace enseignant</div>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => { setCurrentPage(item.page); setSelectedClasse(null); }}
              style={{
                background: currentPage === item.page ? "rgba(255,255,255,0.2)" : "transparent",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: currentPage === item.page ? 700 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "background 0.2s",
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profil */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>{professeur.nom}</div>
          <div style={{ fontSize: "11px", opacity: 0.8 }}>{professeur.grade}</div>
        </div>
        <div style={{
          width: "42px", height: "42px",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px",
        }}>
          {professeur.photo}
        </div>
      </div>
    </div>
  );

  // ─── PAGE DASHBOARD ────────────────────────────────────────────────────────
  const PageDashboard = () => (
    <div style={{ padding: "32px" }}>
      <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: 800, color: "#2C2C2A" }}>
        Bonjour, {professeur.nom} 👋
      </h2>
      <p style={{ margin: "0 0 32px 0", color: "#888780", fontSize: "14px" }}>
        Voici un aperçu de votre activité pour ce semestre.
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Classes assignées",    value: classes.length,  icon: "🏫", color: "#185FA5" },
          { label: "Total étudiants",       value: totalEtudiants,  icon: "👨‍🎓", color: "#28a745" },
          { label: "Matiéres enseignés",     value: 2,               icon: "📚", color: "#e67e22" },
          { label: "Séances cette semaine", value: 6,               icon: "📅", color: "#8e44ad" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "22px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
            borderLeft: `5px solid ${s.color}`,
          }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.icon}</div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "13px", color: "#888780", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Accès rapide classes */}
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2C2C2A", marginBottom: "16px" }}>
        Accès rapide — Mes classes
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {classes.map(cl => (
          <div
            key={cl.id}
            onClick={() => { setSelectedClasse(cl); setCurrentPage("notes"); }}
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
              cursor: "pointer",
              borderTop: `4px solid ${cl.couleur}`,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; }}
            onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: "18px", color: "#2C2C2A" }}>{cl.nom}</div>
                <div style={{ fontSize: "12px", color: "#888780", marginTop: "2px" }}>{cl.niveau} · {cl.specialite}</div>
              </div>
              <span style={{ background: cl.couleur, color: "#fff", borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>
                {cl.semestre}
              </span>
            </div>
            <div style={{ marginTop: "14px", fontSize: "13px", color: "#555" }}>📚 {cl.module}</div>
            <div style={{ marginTop: "8px", fontSize: "13px", color: "#555" }}>👨‍🎓 {cl.etudiants.length} étudiants</div>
            <div style={{ marginTop: "14px", fontSize: "12px", color: cl.couleur, fontWeight: 600 }}>
              Saisir les notes →
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2C2C2A", margin: "32px 0 16px 0" }}>
        💡 Fonctionnalités disponibles
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
        {[
          { icon: "📤", titre: "Export des résultats",   desc: "Télécharger les notes en PDF ou Excel" },
        ].map((f, i) => (
          <div key={i} style={{
            background: "#F5F9FF",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid #d8e8f5",
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{f.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#2C2C2A", marginBottom: "4px" }}>{f.titre}</div>
            <div style={{ fontSize: "12px", color: "#888780" }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── PAGE CLASSES ──────────────────────────────────────────────────────────
  const PageClasses = () => (
    <div style={{ padding: "32px" }}>
      <h2 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: 800, color: "#2C2C2A" }}>🏫 Mes classes</h2>
      <p style={{ margin: "0 0 28px 0", color: "#888780", fontSize: "14px" }}>Cliquez sur une classe pour accéder à la liste des étudiants et saisir les notes.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {classes.map(cl => (
          <div
            key={cl.id}
            onClick={() => { setSelectedClasse(cl); setCurrentPage("notes"); }}
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "22px 26px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
              cursor: "pointer",
              border: "2px solid transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.2s",
            }}
            onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.border = `2px solid ${cl.couleur}`; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; }}
            onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.border = "2px solid transparent"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div style={{
                width: "56px", height: "56px",
                background: cl.couleur,
                borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px", color: "#fff", fontWeight: 800,
              }}>
                {cl.nom.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "17px", color: "#2C2C2A" }}>{cl.nom}</div>
                <div style={{ fontSize: "13px", color: "#888780", marginTop: "2px" }}>{cl.niveau} · {cl.specialite} · {cl.semestre}</div>
                <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>📚 {cl.module}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "26px", fontWeight: 800, color: cl.couleur }}>{cl.etudiants.length}</div>
                <div style={{ fontSize: "11px", color: "#888780" }}>étudiants</div>
              </div>
              <div style={{ fontSize: "22px", color: cl.couleur }}>→</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── PAGE NOTES (attribution des notes) ───────────────────────────────────
  const PageNotes = () => {
    if (!selectedClasse) return (
      <div style={{ padding: "32px" }}>
        <p style={{ color: "#888780" }}>Veuillez sélectionner une classe depuis "Mes classes".</p>
      </div>
    );

    const cl = selectedClasse;

    return (
      <div style={{ padding: "32px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "13px", color: "#888780" }}>
          <span
            style={{ cursor: "pointer", color: "#185FA5", fontWeight: 600 }}
            onClick={() => setCurrentPage("classes")}
          >
            Mes classes
          </span>
          <span>›</span>
          <span style={{ color: "#2C2C2A", fontWeight: 700 }}>{cl.nom}</span>
        </div>

        {/* Header classe */}
        <div style={{
          background: cl.couleur,
          borderRadius: "16px",
          padding: "24px 28px",
          color: "#fff",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800 }}>{cl.nom}</div>
            <div style={{ fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>{cl.niveau} · {cl.specialite} · {cl.semestre}</div>
            <div style={{ fontSize: "13px", opacity: 0.9, marginTop: "2px" }}>📚 {cl.module}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "36px", fontWeight: 800 }}>{cl.etudiants.length}</div>
            <div style={{ fontSize: "12px", opacity: 0.85 }}>étudiants</div>
          </div>
        </div>

        {/* Légende coefficients */}
        <div style={{
          background: "#F5F9FF",
          border: "1px solid #d8e8f5",
          borderRadius: "10px",
          padding: "12px 18px",
          marginBottom: "20px",
          display: "flex",
          gap: "24px",
          fontSize: "13px",
          color: "#555",
          flexWrap: "wrap",
        }}>
          <span>ℹ️ Pondération :</span>
          <span><strong>CC</strong> × 20%</span>
          <span><strong>DS</strong> × 30%</span>
          <span><strong>Examen</strong> × 50%</span>
          <span style={{ color: "#888780" }}>· Notes sur 20</span>
        </div>

        {/* Tableau des notes */}
        <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {/* En-tête tableau */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 110px 100px 100px 120px 110px",
            gap: "0",
            background: "#F0F5FB",
            padding: "14px 20px",
            borderBottom: "2px solid #d8e8f5",
            fontSize: "12px",
            fontWeight: 700,
            color: "#185FA5",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            <div>#</div>
            <div>Étudiant</div>
            <div style={{ textAlign: "center" }}>CC (20%)</div>
            <div style={{ textAlign: "center" }}>DS (30%)</div>
            <div style={{ textAlign: "center" }}>Examen (50%)</div>
            <div style={{ textAlign: "center" }}>Moyenne</div>
          </div>

          {/* Lignes étudiants */}
          {cl.etudiants.map((etudiant, idx) => {
            const moy = getMoyenne(etudiant.id);
            const admis = moy !== null && parseFloat(moy) >= 10;
            return (
              <div
                key={etudiant.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 110px 100px 100px 120px 110px",
                  gap: "0",
                  padding: "14px 20px",
                  borderBottom: "1px solid #f0f0f0",
                  alignItems: "center",
                  background: idx % 2 === 0 ? "#fff" : "#fafcff",
                  transition: "background 0.15s",
                }}
                onMouseOver={e => (e.currentTarget as HTMLDivElement).style.background = "#EFF6FF"}
                onMouseOut={e => (e.currentTarget as HTMLDivElement).style.background = idx % 2 === 0 ? "#fff" : "#fafcff"}
              >
                {/* Numéro */}
                <div style={{ fontSize: "13px", color: "#aaa", fontWeight: 600 }}>{idx + 1}</div>

                {/* Nom étudiant */}
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#2C2C2A" }}>
                    {etudiant.prenom} {etudiant.nom}
                  </div>
                  <div style={{ fontSize: "11px", color: "#aaa" }}>CIN : {etudiant.cin}</div>
                </div>

                {/* CC */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <input
                    type="number"
                    min={0} max={20} step={0.25}
                    placeholder="—"
                    value={getNote(etudiant.id, "cc")}
                    onChange={e => setNote(etudiant.id, "cc", e.target.value)}
                    style={{ ...inputStyle, borderColor: getNote(etudiant.id, "cc") ? "#185FA5" : "#d0dce8" }}
                  />
                </div>

                {/* DS */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <input
                    type="number"
                    min={0} max={20} step={0.25}
                    placeholder="—"
                    value={getNote(etudiant.id, "ds")}
                    onChange={e => setNote(etudiant.id, "ds", e.target.value)}
                    style={{ ...inputStyle, borderColor: getNote(etudiant.id, "ds") ? "#185FA5" : "#d0dce8" }}
                  />
                </div>

                {/* Examen */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <input
                    type="number"
                    min={0} max={20} step={0.25}
                    placeholder="—"
                    value={getNote(etudiant.id, "examen")}
                    onChange={e => setNote(etudiant.id, "examen", e.target.value)}
                    style={{ ...inputStyle, borderColor: getNote(etudiant.id, "examen") ? "#185FA5" : "#d0dce8" }}
                  />
                </div>

                {/* Moyenne */}
                <div style={{ textAlign: "center" }}>
                  {moy ? (
                    <span style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: moyColor(moy),
                    }}>
                      {moy}
                    </span>
                  ) : (
                    <span style={{ fontSize: "13px", color: "#ccc" }}>—</span>
                  )}
                </div>

                {/* Résultat */}
                <div style={{ textAlign: "center" }}>
                  {moy ? (
                    <span style={{
                      background: admis ? "#e8f5e9" : "#fdecea",
                      color: admis ? "#28a745" : "#dc3545",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 700,
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

        {/* Bouton sauvegarder */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", gap: "12px", alignItems: "center" }}>
          {savedMsg && (
            <span style={{ fontSize: "13px", color: "#28a745", fontWeight: 600 }}>
              ✅ Notes enregistrées avec succès !
            </span>
          )}
          <button
            onClick={handleSave}
            style={{
              background: "#185FA5",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(24,95,165,0.3)",
              transition: "background 0.2s",
            }}
            onMouseOver={e => (e.currentTarget.style.background = "#144d8a")}
            onMouseOut={e => (e.currentTarget.style.background = "#185FA5")}
          >
            💾 Enregistrer les notes
          </button>
        </div>
      </div>
    );
  };

  // ─── PAGE STATISTIQUES ─────────────────────────────────────────────────────
  const PageStatistiques = () => (
    <div style={{ padding: "32px" }}>
      <h2 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: 800, color: "#2C2C2A" }}>📊 Statistiques</h2>
      <p style={{ margin: "0 0 28px 0", color: "#888780", fontSize: "14px" }}>Vue d'ensemble des résultats par classe.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {classes.map(cl => {
          const moyennes = cl.etudiants.map(e => getMoyenne(e.id)).filter(Boolean) as string[];
          const admis = moyennes.filter(m => parseFloat(m) >= 10).length;
          const avg = moyennes.length
            ? (moyennes.reduce((s, m) => s + parseFloat(m), 0) / moyennes.length).toFixed(2)
            : null;
          return (
            <div key={cl.id} style={{ background: "#fff", borderRadius: "14px", padding: "22px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", borderTop: `4px solid ${cl.couleur}` }}>
              <div style={{ fontWeight: 800, fontSize: "16px", color: "#2C2C2A", marginBottom: "4px" }}>{cl.nom}</div>
              <div style={{ fontSize: "12px", color: "#888780", marginBottom: "16px" }}>{cl.etudiants.length} étudiants · {cl.module}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: cl.couleur }}>{avg ?? "—"}</div>
                  <div style={{ fontSize: "11px", color: "#888780" }}>Moyenne générale</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: "#28a745" }}>{admis}</div>
                  <div style={{ fontSize: "11px", color: "#888780" }}>Admis</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: "#dc3545" }}>{moyennes.length - admis}</div>
                  <div style={{ fontSize: "11px", color: "#888780" }}>Ajournés</div>
                </div>
              </div>
              {moyennes.length === 0 && (
                <div style={{ marginTop: "12px", fontSize: "12px", color: "#bbb", textAlign: "center" }}>
                  Aucune note saisie pour l'instant
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

 

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#E6F1FB", fontFamily: "'Segoe UI', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {currentPage === "dashboard"    && <PageDashboard />}
        {currentPage === "classes"      && <PageClasses />}
        {currentPage === "notes"        && <PageNotes />}
        {currentPage === "statistiques" && <PageStatistiques />}
      </div>
    </div>
  );
}