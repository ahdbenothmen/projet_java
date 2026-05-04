"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_PROFIL = "http://localhost:8080/universite-backend/api/etudiant/profile";
const NIVEAUX    = ["Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2"];
const SPECIALITES = ["Informatique", "Mathématiques", "Physique", "Chimie", "Biologie", "Économie", "Droit", "Médecine"];

interface ProfilData {
  cin: string; nom: string; prenom: string; email: string;
  adresse: string; telephone: string; niveau: string;
  specialite: string; statut: string;
}

export default function ProfilEtudiant() {
  const router = useRouter();
  const [profil, setProfil]           = useState<ProfilData | null>(null);
  const [form, setForm]               = useState<ProfilData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [message, setMessage]         = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [editMode, setEditMode]       = useState(false);

  const getToken = () => localStorage.getItem("etudiantToken") ?? "";

  useEffect(() => {
    const token = localStorage.getItem("etudiantToken");
    if (!token) { router.replace("/login/etudiant"); return; }
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
    try {
      const res = await fetch(API_PROFIL, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) { router.replace("/login/etudiant"); return; }
      const data = await res.json();
      // Le GET retourne directement l'objet (pas enveloppé dans success/data)
      if (data.cin) {
        setProfil(data);
        setForm(data);
      } else {
        setMessage("❌ " + (data.message || "Erreur de chargement"));
        setMessageType("error");
      }
    } catch {
      setMessage("❌ Erreur de connexion au serveur");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfilData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (!form) return;
      setForm({ ...form, [field]: e.target.value });
    };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(API_PROFIL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setProfil(form);
        setEditMode(false);
        setMessage("✅ Profil mis à jour avec succès !");
        setMessageType("success");
        setTimeout(() => setMessage(""), 4000);
      } else {
        setMessage("❌ " + (data.message || "Erreur"));
        setMessageType("error");
      }
    } catch {
      setMessage("❌ Erreur de connexion au serveur");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(profil);
    setEditMode(false);
    setMessage("");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#185FA5", fontSize: "16px" }}>Chargement...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#E6F1FB", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#185FA5", color: "#fff", padding: "20px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => router.push("/dashboard/etudiant")}
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              ← Retour
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>Mon Profil</h1>
              <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>Gérez vos informations personnelles</p>
            </div>
          </div>
          <div style={{ width: "48px", height: "48px", background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#185FA5" }}>
            {form?.prenom?.charAt(0)}{form?.nom?.charAt(0)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "800px", margin: "32px auto", padding: "0 16px" }}>

        {/* Message */}
        {message && (
          <div style={{
            background: messageType === "success" ? "#E8F5E9" : "#FFEBEE",
            border: `1.5px solid ${messageType === "success" ? "#66BB6A" : "#EF5350"}`,
            borderRadius: "10px", padding: "14px 16px", marginBottom: "20px",
            fontSize: "14px", fontWeight: 500,
            color: messageType === "success" ? "#1B5E20" : "#B71C1C",
          }}>
            {message}
          </div>
        )}

        {/* Carte profil */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 16px rgba(24,95,165,0.1)" }}>

          {/* En-tête carte */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", paddingBottom: "20px", borderBottom: "2px solid #E6F1FB" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "72px", height: "72px", background: "#185FA5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, color: "#fff" }}>
                {form?.prenom?.charAt(0)}{form?.nom?.charAt(0)}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#2C2C2A" }}>
                  {form?.prenom} {form?.nom}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888780" }}>CIN : {form?.cin}</p>
                <span style={{
                  display: "inline-block", marginTop: "6px",
                  background: form?.statut === "approuve" ? "#E8F5E9" : form?.statut === "rejete" ? "#FFEBEE" : "#FFF8E1",
                  color: form?.statut === "approuve" ? "#28a745" : form?.statut === "rejete" ? "#EF5350" : "#E65100",
                  padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                }}>
                  {form?.statut === "approuve" ? "✅ Approuvé" : form?.statut === "rejete" ? "❌ Rejeté" : "⏳ En attente"}
                </span>
              </div>
            </div>

            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                style={{ background: "#185FA5", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                ✏️ Modifier
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handleCancel}
                  style={{ background: "#E6E4DC", color: "#2C2C2A", border: "none", borderRadius: "10px", padding: "10px 16px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                  Annuler
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ background: saving ? "#A5C8A5" : "#28a745", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Enregistrement…" : "💾 Sauvegarder"}
                </button>
              </div>
            )}
          </div>

          {/* Informations personnelles */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              👤 Informations personnelles
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

              {/* Nom */}
              <div>
                <label style={labelStyle}>Nom</label>
                {editMode
                  ? <input value={form?.nom || ""} onChange={handleChange("nom")} style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#185FA5")}
                      onBlur={(e)  => (e.target.style.borderColor = "#D3D1C7")} />
                  : <div style={valueStyle}>{form?.nom}</div>}
              </div>

              {/* Prénom */}
              <div>
                <label style={labelStyle}>Prénom</label>
                {editMode
                  ? <input value={form?.prenom || ""} onChange={handleChange("prenom")} style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#185FA5")}
                      onBlur={(e)  => (e.target.style.borderColor = "#D3D1C7")} />
                  : <div style={valueStyle}>{form?.prenom}</div>}
              </div>

              {/* Email */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Email</label>
                {editMode
                  ? <input type="email" value={form?.email || ""} onChange={handleChange("email")} style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#185FA5")}
                      onBlur={(e)  => (e.target.style.borderColor = "#D3D1C7")} />
                  : <div style={valueStyle}>{form?.email}</div>}
              </div>

              {/* Téléphone */}
              <div>
                <label style={labelStyle}>Téléphone</label>
                {editMode
                  ? <input value={form?.telephone || ""} onChange={handleChange("telephone")} style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#185FA5")}
                      onBlur={(e)  => (e.target.style.borderColor = "#D3D1C7")} />
                  : <div style={valueStyle}>{form?.telephone || "—"}</div>}
              </div>

              {/* Adresse */}
              <div>
                <label style={labelStyle}>Adresse</label>
                {editMode
                  ? <input value={form?.adresse || ""} onChange={handleChange("adresse")} style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#185FA5")}
                      onBlur={(e)  => (e.target.style.borderColor = "#D3D1C7")} />
                  : <div style={valueStyle}>{form?.adresse || "—"}</div>}
              </div>

            </div>
          </div>

          {/* Informations académiques */}
          <div>
            <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              🎓 Informations académiques
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

              {/* Niveau */}
              <div>
                <label style={labelStyle}>Niveau</label>
                {editMode
                  ? <select value={form?.niveau || ""} onChange={handleChange("niveau")}
                      style={{ ...inputStyle, cursor: "pointer" }}
                      onFocus={(e) => (e.target.style.borderColor = "#185FA5")}
                      onBlur={(e)  => (e.target.style.borderColor = "#D3D1C7")}>
                      <option value="">Sélectionner</option>
                      {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  : <div style={valueStyle}>{form?.niveau || "—"}</div>}
              </div>

              {/* Spécialité */}
              <div>
                <label style={labelStyle}>Spécialité</label>
                {editMode
                  ? <select value={form?.specialite || ""} onChange={handleChange("specialite")}
                      style={{ ...inputStyle, cursor: "pointer" }}
                      onFocus={(e) => (e.target.style.borderColor = "#185FA5")}
                      onBlur={(e)  => (e.target.style.borderColor = "#D3D1C7")}>
                      <option value="">Sélectionner</option>
                      {SPECIALITES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  : <div style={valueStyle}>{form?.specialite || "—"}</div>}
              </div>

              {/* CIN — non modifiable */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>CIN</label>
                <div style={{ ...valueStyle, color: "#888780" }}>{form?.cin} <span style={{ fontSize: "11px" }}>(non modifiable)</span></div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", color: "#888780", fontSize: "12px",
  fontWeight: 600, marginBottom: "6px",
  textTransform: "uppercase", letterSpacing: "0.3px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  border: "1.5px solid #D3D1C7", borderRadius: "9px",
  fontSize: "14px", color: "#2C2C2A", background: "#F1EFE8",
  outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s", appearance: "none",
};

const valueStyle: React.CSSProperties = {
  padding: "10px 14px", background: "#F5F9FF",
  borderRadius: "9px", fontSize: "14px",
  color: "#2C2C2A", fontWeight: 500, minHeight: "42px",
};