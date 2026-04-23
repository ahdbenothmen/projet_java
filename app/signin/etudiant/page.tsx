"use client";
import { useState } from "react";

const NIVEAUX = ["Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2"];

export default function SigninEtudiant() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    cin: "",
    nom: "",
    prenom: "",
    email: "",
    password: "",
    adresse: "",
    telephone: "",
    niveau: "",
    photoCin: null as File | null,
    photoEtd: null as File | null,
  });

  const [previewCin, setPreviewCin] = useState<string | null>(null);
  const [previewEtd, setPreviewEtd] = useState<string | null>(null);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (field: "photoCin" | "photoEtd") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, [field]: file }));
      const previewUrl = URL.createObjectURL(file);
      if (field === "photoCin") {
        setPreviewCin(previewUrl);
      } else {
        setPreviewEtd(previewUrl);
      }
    }
  };

  const handleNext = () => {
    // Valider les champs de l'étape 1
    if (!form.cin || !form.nom || !form.prenom || !form.email || !form.password) {
      alert("Veuillez remplir tous les champs obligatoires (CIN, Nom, Prénom, Email, Mot de passe)");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.niveau || !form.photoCin || !form.photoEtd) {
      alert("Veuillez remplir tous les champs obligatoires (Niveau, Photo CIN, Photo étudiant)");
      return;
    }
    console.log(form);
    alert("Compte créé avec succès !");
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "#185FA5");
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "#D3D1C7");

  return (
    <div
      id="signin-page"
      style={{
        minHeight: "100vh",
        background: "#E6F1FB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "32px 16px",
      }}
    >
      <div
        id="signin-card"
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(24,95,165,0.12)",
          padding: "40px 36px",
          width: "100%",
          maxWidth: "480px",
        }}
      >
        {/* Header */}
        <div id="signin-header" style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            id="signin-logo"
            style={{
              width: "52px",
              height: "52px",
              background: "#185FA5",
              borderRadius: "14px",
              margin: "0 auto 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" fill="#fff" />
            </svg>
          </div>
          <h1 style={{ color: "#2C2C2A", fontSize: "20px", fontWeight: 700, margin: 0 }}>
            Créer un compte Étudiant
          </h1>
          <p style={{ color: "#888780", fontSize: "13px", marginTop: "5px" }}>
            Étape {step} sur 2
          </p>
          {/* Progress bar */}
          <div style={{ marginTop: "12px", background: "#E6E4DC", borderRadius: "10px", height: "6px", overflow: "hidden" }}>
            <div style={{ width: step === 1 ? "50%" : "100%", height: "100%", background: "#185FA5", transition: "width 0.3s" }}></div>
          </div>
        </div>

        {/* Form */}
        <form id="signin-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* ÉTAPE 1 : Données personnelles */}
          {step === 1 && (
            <div id="step1-fields" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Ligne CIN */}
              <div id="field-cin">
                <label htmlFor="cin" style={labelStyle}>Numéro CIN <span style={{ color: "red" }}>*</span></label>
                <input id="cin" type="text" placeholder="Ex: 12345678" value={form.cin}
                  onChange={set("cin")} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              {/* Ligne Nom / Prénom */}
              <div style={{ display: "flex", gap: "12px" }}>
                <div id="field-nom" style={{ flex: 1 }}>
                  <label htmlFor="nom" style={labelStyle}>Nom <span style={{ color: "red" }}>*</span></label>
                  <input id="nom" type="text" placeholder="Ben " value={form.nom}
                    onChange={set("nom")} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div id="field-prenom" style={{ flex: 1 }}>
                  <label htmlFor="prenom" style={labelStyle}>Prénom <span style={{ color: "red" }}>*</span></label>
                  <input id="prenom" type="text" placeholder="Mohamed" value={form.prenom}
                    onChange={set("prenom")} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              {/* Email */}
              <div id="field-email">
                <label htmlFor="email" style={labelStyle}>Email <span style={{ color: "red" }}>*</span></label>
                <input id="email" type="email" placeholder="etudiant@univ.tn" value={form.email}
                  onChange={set("email")} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              {/* Password */}
              <div id="field-password">
                <label htmlFor="password" style={labelStyle}>Mot de passe <span style={{ color: "red" }}>*</span></label>
                <input id="password" type="password" placeholder="••••••••" value={form.password}
                  onChange={set("password")} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              {/* Téléphone */}
              <div id="field-telephone">
                <label htmlFor="telephone" style={labelStyle}>Téléphone</label>
                <input id="telephone" type="tel" placeholder="Ex: 22 123 456" value={form.telephone}
                  onChange={set("telephone")} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              {/* Adresse */}
              <div id="field-adresse">
                <label htmlFor="adresse" style={labelStyle}>Adresse</label>
                <input id="adresse" type="text" placeholder="Tunis, Tunisie" value={form.adresse}
                  onChange={set("adresse")} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : Niveau et photos */}
          {step === 2 && (
            <div id="step2-fields" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Niveau */}
              <div id="field-niveau">
                <label htmlFor="niveau" style={labelStyle}>Niveau d'études <span style={{ color: "red" }}>*</span></label>
                <select id="niveau" value={form.niveau} onChange={set("niveau")} required
                  style={{ ...inputStyle, color: form.niveau ? "#2C2C2A" : "#888780", cursor: "pointer" }}
                  onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="" disabled>Sélectionner un niveau</option>
                  {NIVEAUX.map((n) => (
                    <option key={n} value={n} style={{ color: "#2C2C2A" }}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Photo CIN */}
              <div id="field-photocin">
                <label htmlFor="photocin" style={labelStyle}>Photo CIN <span style={{ color: "red" }}>*</span></label>
                <input 
                  id="photocin" 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange("photoCin")} 
                  required 
                  style={fileInputStyle} 
                />
                {previewCin && (
                  <div style={{ marginTop: "8px" }}>
                    <img src={previewCin} alt="Aperçu CIN" style={{ width: "100%", maxHeight: "120px", objectFit: "cover", borderRadius: "8px" }} />
                  </div>
                )}
              </div>

              {/* Photo Étudiant */}
              <div id="field-photoetd">
                <label htmlFor="photoetd" style={labelStyle}>Photo d'identité <span style={{ color: "red" }}>*</span></label>
                <input 
                  id="photoetd" 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange("photoEtd")} 
                  required 
                  style={fileInputStyle} 
                />
                {previewEtd && (
                  <div style={{ marginTop: "8px" }}>
                    <img src={previewEtd} alt="Aperçu étudiant" style={{ width: "100%", maxHeight: "120px", objectFit: "cover", borderRadius: "8px" }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {step === 2 && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  flex: 1,
                  background: "#E6E4DC",
                  color: "#2C2C2A",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#D3D1C7")}
                onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#E6E4DC")}
              >
                ← Retour
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  flex: 1,
                  background: "#185FA5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#134d87")}
                onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#185FA5")}
              >
                Suivant →
              </button>
            )}

            {step === 2 && (
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: "#185FA5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#134d87")}
                onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#185FA5")}
              >
                Créer mon compte
              </button>
            )}
          </div>

          {/* Login link */}
          <p style={{ textAlign: "center", fontSize: "13px", color: "#888780", margin: 0 }}>
            Déjà un compte ?{" "}
            <a href="/login" id="login-link" style={{ color: "#185FA5", textDecoration: "none", fontWeight: 600 }}>
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#2C2C2A",
  fontSize: "13px",
  fontWeight: 600,
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid #D3D1C7",
  borderRadius: "9px",
  fontSize: "14px",
  color: "#2C2C2A",
  background: "#F1EFE8",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  appearance: "none",
};

const fileInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 14px",
  border: "1.5px solid #D3D1C7",
  borderRadius: "9px",
  fontSize: "13px",
  color: "#2C2C2A",
  background: "#F1EFE8",
  outline: "none",
  boxSizing: "border-box",
  cursor: "pointer",
};