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
    photoCin: null as File | null,
  });

  const [previewDiplome, setPreviewDiplome] = useState<string | null>(null);
  const [previewProf, setPreviewProf] = useState<string | null>(null);
  const [previewCin, setPreviewCin] = useState<string | null>(null);
  const [diplomeName, setDiplomeName] = useState<string>("");

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (field: "photoProf" | "diplomeImage" | "photoCin") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setForm((prev) => ({ ...prev, [field]: file }));
        const previewUrl = URL.createObjectURL(file);
        if (field === "photoProf") setPreviewProf(previewUrl);
        else if (field === "photoCin") setPreviewCin(previewUrl);
        else { setPreviewDiplome(previewUrl); setDiplomeName(file.name); }
      }
    };

  const handleNext = () => {
    if (!form.cin || !form.nom || !form.prenom || !form.email || !form.password) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (!form.photoCin) {
      alert("Veuillez ajouter la photo de votre CIN");
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.diplome || !form.diplomeImage || !form.specialite || !form.photoProf) {
      alert("Veuillez remplir tous les champs obligatoires");
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
      formData.append("diplomes", form.diplome);
      formData.append("speciality", form.specialite);
      if (form.photoProf)    formData.append("photo", form.photoProf);
      if (form.photoCin)     formData.append("photoCin", form.photoCin);
      if (form.diplomeImage) formData.append("diplomePdf", form.diplomeImage);

      const response = await fetch(
        "http://localhost:8080/universite-backend/api/signin/professeur",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Compte créé avec succès ! En attente d'approbation.");
        window.location.href = "/login/professeur";
      } else {
        alert(data.message || "Erreur lors de la création du compte");
      }
    } catch (error) {
      alert("Erreur de connexion au serveur. Vérifiez que Tomcat est lancé.");
    }
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "#185FA5");
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "#D3D1C7");

  return (
    <div style={{
      minHeight: "100vh", background: "#E6F1FB", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif", padding: "32px 16px",
    }}>
      <div style={{
        background: "#FFFFFF", borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(24,95,165,0.12)",
        padding: "40px 36px", width: "100%", maxWidth: "480px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "52px", height: "52px", background: "#185FA5",
            borderRadius: "14px", margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
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
          <div style={{ marginTop: "12px", background: "#E6E4DC", borderRadius: "10px", height: "6px", overflow: "hidden" }}>
            <div style={{ width: step === 1 ? "50%" : "100%", height: "100%", background: "#185FA5", transition: "width 0.3s" }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          <div>
  <label style={labelStyle}>Numéro CIN <span style={{ color: "red" }}>*</span></label>
  <input
    type="number"
    placeholder="Ex: 12345678"
    value={form.cin}
    onChange={(e) => {
      const val = e.target.value;
      if (val.length <= 8) set("cin")(e);
    }}
    required
    min="10000000"
    max="99999999"
    autoComplete="new-password"
    style={{
      ...inputStyle,
      MozAppearance: "textfield" as any,
    }}
    onFocus={focusStyle}
    onBlur={(e) => {
      blurStyle(e);
      const val = parseInt(e.target.value);
      if (e.target.value && (val < 10000000 || val > 99999999)) {
        e.target.style.borderColor = "red";
        alert("Le CIN doit être entre 10000000 et 99999999");
      }
    }}
    onWheel={(e) => e.currentTarget.blur()}
  />
</div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Nom <span style={{ color: "red" }}>*</span></label>
                  <input type="text" placeholder="Ben" value={form.nom}
                    onChange={set("nom")} required
                    style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Prénom <span style={{ color: "red" }}>*</span></label>
                  <input type="text" placeholder="Mohamed" value={form.prenom}
                    onChange={set("prenom")} required
                    style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email <span style={{ color: "red" }}>*</span></label>
                <input type="email" placeholder="professeur@univ.tn" value={form.email}
                  onChange={set("email")} required
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>Mot de passe <span style={{ color: "red" }}>*</span></label>
                <input type="password" placeholder="••••••••" value={form.password}
                  onChange={set("password")} required
                  autoComplete="new-password"
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>Téléphone</label>
                <input type="tel" placeholder="Ex: 22 123 456" value={form.telephone}
                  onChange={set("telephone")}
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>Adresse</label>
                <input type="text" placeholder="Tunis, Tunisie" value={form.adresse}
                  onChange={set("adresse")}
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>Photo CIN <span style={{ color: "red" }}>*</span></label>
                <input type="file" accept="image/*"
                  onChange={handleFileChange("photoCin")} style={fileInputStyle} />
                {previewCin && (
                  <div style={{ marginTop: "8px" }}>
                    <img src={previewCin} alt="Aperçu CIN"
                      style={{ width: "100%", maxHeight: "120px", objectFit: "cover", borderRadius: "8px" }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              <div>
                <label style={labelStyle}>Diplôme <span style={{ color: "red" }}>*</span></label>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <input type="text" placeholder="Ex: Doctorat, Master, Licence"
                      value={form.diplome} onChange={set("diplome")} required
                      style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="file" accept="application/pdf"
                      onChange={handleFileChange("diplomeImage")} style={fileInputStyle} />
                    {previewDiplome && diplomeName && (
                      <div style={{
                        marginTop: "8px", padding: "10px", background: "#F1EFE8",
                        borderRadius: "6px", border: "1px solid #D3D1C7",
                        display: "flex", flexDirection: "column", gap: "6px"
                      }}>
                        <div style={{ fontSize: "12px", color: "#2C2C2A", fontWeight: 600 }}>
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {diplomeName}
                          </span>
                        </div>
                        <a href={previewDiplome} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: "12px", color: "#185FA5", textDecoration: "none", fontWeight: 600 }}>
                          Visualiser le PDF
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Spécialité <span style={{ color: "red" }}>*</span></label>
                <input type="text" placeholder="Ex: Informatique, Mathématiques, Physique"
                  value={form.specialite} onChange={set("specialite")} required
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div>
                <label style={labelStyle}>Photo du professeur <span style={{ color: "red" }}>*</span></label>
                <input type="file" accept="image/*"
                  onChange={handleFileChange("photoProf")} style={fileInputStyle} />
                {previewProf && (
                  <div style={{ marginTop: "8px" }}>
                    <img src={previewProf} alt="Aperçu professeur"
                      style={{ width: "100%", maxHeight: "120px", objectFit: "cover", borderRadius: "8px" }} />
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {step === 2 && (
              <button type="button" onClick={handleBack}
                style={{ flex: 1, background: "#E6E4DC", color: "#2C2C2A", border: "none",
                  borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#D3D1C7")}
                onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#E6E4DC")}
              >
                Retour
              </button>
            )}
            {step === 1 && (
              <button type="button" onClick={handleNext}
                style={{ flex: 1, background: "#185FA5", color: "#fff", border: "none",
                  borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#134d87")}
                onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#185FA5")}
              >
                Suivant
              </button>
            )}
            {step === 2 && (
              <button type="submit"
                style={{ flex: 1, background: "#185FA5", color: "#fff", border: "none",
                  borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#134d87")}
                onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#185FA5")}
              >
                Créer mon compte
              </button>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#888780", margin: 0 }}>
            Déjà un compte ?{" "}
            <a href="/login/professeur" style={{ color: "#185FA5", textDecoration: "none", fontWeight: 600 }}>
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