"use client";
import { useState } from "react";
import Image from "next/image";

const NIVEAUX = ["Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2"];
const SPECIALITES = ["Informatique", "Mathématiques", "Physique", "Chimie", "Biologie", "Économie", "Droit", "Médecine"];

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
    specialite: "",
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
      if (field === "photoCin") setPreviewCin(previewUrl);
      else setPreviewEtd(previewUrl);
    }
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!form.cin || !form.nom || !form.prenom || !form.email || !form.password) {
      alert("Veuillez remplir tous les champs obligatoires (CIN, Nom, Prénom, Email, Mot de passe)");
      return;
    }
    setStep(2);
  };

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.niveau || !form.photoCin || !form.photoEtd) {
      alert("Veuillez remplir tous les champs obligatoires (Niveau, Photo CIN, Photo étudiant)");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("cin", form.cin);
      formData.append("nom", form.nom);
      formData.append("prenom", form.prenom);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("adresse", form.adresse);
      formData.append("telephone", form.telephone);
      formData.append("niveau", form.niveau);
      formData.append("specialite", form.specialite);
      formData.append("photoCin", form.photoCin);
      formData.append("photoEtd", form.photoEtd);

 const res = await fetch("http://localhost:8080/universite-backend/api/signin/etudiant", {
  method: "POST",
  body: formData,
});
      const data = await res.json();

      if (data.success) {
        alert("✅ " + data.message);
        setForm({
          cin: "", nom: "", prenom: "", email: "", password: "",
          adresse: "", telephone: "", niveau: "", specialite: "",
          photoCin: null, photoEtd: null,
        });
        setPreviewCin(null);
        setPreviewEtd(null);
        setStep(1);
        window.location.replace("/login/etudiant");
      } else {
        alert("❌ " + data.message);
      }
      } catch {
      alert("❌ Erreur de connexion au serveur. Vérifiez que le backend Java tourne.");
    }
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "#185FA5");
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "#D3D1C7");

  return (
    <div id="signin-page" style={{
      minHeight: "100vh", background: "#E6F1FB", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif", padding: "32px 16px",
    }}>
      <div id="signin-card" style={{
        background: "#FFFFFF", borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(24,95,165,0.12)",
        padding: "40px 36px", width: "100%", maxWidth: "480px",
      }}>
        {/* Header */}
        <div id="signin-header" style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "52px", height: "52px", background: "#185FA5",
            borderRadius: "14px", margin: "0 auto 14px", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
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
          <div style={{ marginTop: "12px", background: "#E6E4DC", borderRadius: "10px", height: "6px", overflow: "hidden" }}>
            <div style={{ width: step === 1 ? "50%" : "100%", height: "100%", background: "#185FA5", transition: "width 0.3s" }}></div>
          </div>
        </div>

        <form id="signin-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* ÉTAPE 1 */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Numéro CIN <span style={{ color: "red" }}>*</span></label>
                <input id="cin" type="text" placeholder="Ex: 12345678" value={form.cin}
                  onChange={set("cin")} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Nom <span style={{ color: "red" }}>*</span></label>
                  <input id="nom" type="text" placeholder="Ben" value={form.nom}
                    onChange={set("nom")} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Prénom <span style={{ color: "red" }}>*</span></label>
                  <input id="prenom" type="text" placeholder="Mohamed" value={form.prenom}
                    onChange={set("prenom")} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email <span style={{ color: "red" }}>*</span></label>
                <input id="email" type="email" placeholder="etudiant@univ.tn" value={form.email}
                  onChange={set("email")} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>Mot de passe <span style={{ color: "red" }}>*</span></label>
                <input id="password" type="password" placeholder="••••••••" value={form.password}
                  onChange={set("password")} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>Téléphone</label>
                <input id="telephone" type="tel" placeholder="Ex: 22 123 456" value={form.telephone}
                  onChange={set("telephone")} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>Adresse</label>
                <input id="adresse" type="text" placeholder="Tunis, Tunisie" value={form.adresse}
                  onChange={set("adresse")} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>
          )}

          {/* ÉTAPE 2 */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Niveau */}
              <div>
                <label style={labelStyle}>Niveau d&#39;études <span style={{ color: "red" }}>*</span></label>
                <select value={form.niveau} onChange={set("niveau")}
                  style={{ ...inputStyle, color: form.niveau ? "#2C2C2A" : "#888780", cursor: "pointer" }}
                  onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="" disabled>Sélectionner un niveau</option>
                  {NIVEAUX.map((n) => (
                    <option key={n} value={n} style={{ color: "#2C2C2A" }}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Spécialité ← NOUVEAU */}
              <div>
                <label style={labelStyle}>Spécialité</label>
                <select value={form.specialite} onChange={set("specialite")}
                  style={{ ...inputStyle, color: form.specialite ? "#2C2C2A" : "#888780", cursor: "pointer" }}
                  onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="" disabled>Sélectionner une spécialité</option>
                  {SPECIALITES.map((s) => (
                    <option key={s} value={s} style={{ color: "#2C2C2A" }}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Photo CIN */}
              <div>
                <label style={labelStyle}>Photo CIN <span style={{ color: "red" }}>*</span></label>
                <input id="photocin" type="file" accept="image/*"
                  onChange={handleFileChange("photoCin")} style={fileInputStyle} />
                {previewCin && (
                  <div style={{ marginTop: "8px", position: "relative", width: "100%", height: "120px" }}>
                    <Image src={previewCin} alt="Aperçu CIN" fill style={{ objectFit: "cover", borderRadius: "8px" }} unoptimized />
                  </div>
                )}
              </div>

              {/* Photo identité */}
              <div>
                <label style={labelStyle}>Photo d&#39;étudiant <span style={{ color: "red" }}>*</span></label>

                <input id="photoetd" type="file" accept="image/*"
                  onChange={handleFileChange("photoEtd")} style={fileInputStyle} />
                {previewEtd && (
                  <div style={{ marginTop: "8px", position: "relative", width: "100%", height: "120px" }}>
                    <Image src={previewEtd} alt="Aperçu étudiant" fill style={{ objectFit: "cover", borderRadius: "8px" }} unoptimized />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {step === 2 && (
              <button type="button" onClick={(e) => handleBack(e)}
                style={{ flex: 1, background: "#E6E4DC", color: "#2C2C2A", border: "none", borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#D3D1C7")}
                onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#E6E4DC")}
              >← Retour</button>
            )}

            {step === 1 && (
              <button type="button" onClick={(e) => handleNext(e)}
                style={{ flex: 1, background: "#185FA5", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#134d87")}
                onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#185FA5")}
              >Suivant →</button>
            )}

            {step === 2 && (
              <button type="submit"
                style={{ flex: 1, background: "#185FA5", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#134d87")}
                onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#185FA5")}
              >Créer mon compte</button>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#888780", margin: 0 }}>
            Déjà un compte ?{" "}
            <a href="/login/etudiant" style={{ color: "#185FA5", textDecoration: "none", fontWeight: 600 }}>
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", color: "#2C2C2A", fontSize: "13px", fontWeight: 600, marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", border: "1.5px solid #D3D1C7",
  borderRadius: "9px", fontSize: "14px", color: "#2C2C2A", background: "#F1EFE8",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", appearance: "none",
};

const fileInputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 14px", border: "1.5px solid #D3D1C7",
  borderRadius: "9px", fontSize: "13px", color: "#2C2C2A", background: "#F1EFE8",
  outline: "none", boxSizing: "border-box", cursor: "pointer",
};