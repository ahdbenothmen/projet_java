"use client";
import { useState } from "react";

export default function SigninProfesseur() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    cin: "",
    nom: "",
    prenom: "",
    email: "",
    password: "",
    adresse: "",
    telephone: "",
    diplome: "",
    diplomeImage: null as File | null,
    specialite: "",
    photoProf: null as File | null,
  });

  const [previewDiplome, setPreviewDiplome] = useState<string | null>(null);
  const [previewProf, setPreviewProf] = useState<string | null>(null);
  const [diplomeName, setDiplomeName] = useState<string>("");

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (field: "photoProf" | "diplomeImage") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, [field]: file }));
      const previewUrl = URL.createObjectURL(file);
      if (field === "photoProf") {
        setPreviewProf(previewUrl);
      } else {
        setPreviewDiplome(previewUrl);
        setDiplomeName(file.name);
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
    if (!form.diplome || !form.diplomeImage || !form.specialite || !form.photoProf) {
      alert("Veuillez remplir tous les champs obligatoires (Diplôme, Image du diplôme, Spécialité, Photo)");
      return;
    }
    console.log(form);
    alert("Compte professeur créé avec succès !");
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
              <path d="M9 10h6v2H9v-2zm0 4h6v2H9v-2z" fill="#fff"/>
              <path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm11 16H4V8h16v12z" fill="#fff"/>
            </svg>
          </div>
          <h1 style={{ color: "#2C2C2A", fontSize: "20px", fontWeight: 700, margin: 0 }}>
            Créer un compte Professeur
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
                  <input id="nom" type="text" placeholder="Ben" value={form.nom}
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
                <input id="email" type="email" placeholder="professeur@univ.tn" value={form.email}
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

          {/* ÉTAPE 2 : Diplôme (nom + PDF), Spécialité et Photo */}
          {step === 2 && (
            <div id="step2-fields" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Diplôme - Nom et PDF alignés */}
              <div id="field-diplome">
                <label style={labelStyle}>Diplôme <span style={{ color: "red" }}>*</span></label>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="text" 
                      placeholder="Ex: Doctorat, Master, Licence" 
                      value={form.diplome}
                      onChange={set("diplome")} 
                      required 
                      style={inputStyle} 
                      onFocus={focusStyle} 
                      onBlur={blurStyle} 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="file" 
                      accept="application/pdf"
                      onChange={handleFileChange("diplomeImage")} 
                      required 
                      style={fileInputStyle} 
                    />
                    {previewDiplome && diplomeName && (
                      <div style={{ 
                        marginTop: "8px", 
                        padding: "10px", 
                        background: "#F1EFE8", 
                        borderRadius: "6px", 
                        border: "1px solid #D3D1C7",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                      }}>
                        <div style={{ fontSize: "12px", color: "#2C2C2A", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "16px" }}>📄</span>
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {diplomeName}
                          </span>
                        </div>
                        <a 
                          href={previewDiplome} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "12px",
                            color: "#185FA5",
                            textDecoration: "none",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer"
                          }}
                        >
                          👁️ Visualiser le PDF
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Spécialité */}
              <div id="field-specialite">
                <label htmlFor="specialite" style={labelStyle}>Spécialité <span style={{ color: "red" }}>*</span></label>
                <input 
                  id="specialite" 
                  type="text" 
                  placeholder="Ex: Informatique, Mathématiques, Physique" 
                  value={form.specialite}
                  onChange={set("specialite")} 
                  required 
                  style={inputStyle} 
                  onFocus={focusStyle} 
                  onBlur={blurStyle} 
                />
              </div>

              {/* Photo Professeur */}
              <div id="field-photoprof">
                <label htmlFor="photoprof" style={labelStyle}>Photo du professeur <span style={{ color: "red" }}>*</span></label>
                <input 
                  id="photoprof" 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange("photoProf")} 
                  required 
                  style={fileInputStyle} 
                />
                {previewProf && (
                  <div style={{ marginTop: "8px" }}>
                    <img src={previewProf} alt="Aperçu professeur" style={{ width: "100%", maxHeight: "120px", objectFit: "cover", borderRadius: "8px" }} />
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