"use client";
import { useState } from "react";

export default function LoginProfesseur() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState<{ type: "warning" | "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/universite-backend/api/login/professeur",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      // Vérification du statut selon la réponse du backend
      if (data.success === false && data.message?.includes("attente")) {
        // Statut = en attente ou en cours
        setAlert({ type: "warning", message: data.message });
      } 
      else if (data.success === false && data.message?.includes("rejet")) {
        // Statut = rejeté
        setAlert({ type: "error", message: data.message });
      }
      else if (data.success === true) {
        // Statut = approuvé → redirection immédiate
        window.location.href = "http://localhost:3000/dashboard/professeur";
      }
      else {
        // Autre erreur (email/mdp incorrect, etc.)
        setAlert({ type: "error", message: data.message || "Email ou mot de passe incorrect." });
      }

    } catch (error) {
      setAlert({ type: "error", message: "Erreur de connexion au serveur." });
    } finally {
      setLoading(false);
    }
  };

  const alertStyles: Record<string, React.CSSProperties> = {
    warning: {
      background: "#FFF8E1",
      border: "1.5px solid #F6C90E",
      color: "#7A5C00",
      borderRadius: "10px",
      padding: "14px 16px",
      fontSize: "13.5px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "20px",
    },
    error: {
      background: "#FFEDED",
      border: "1.5px solid #E53935",
      color: "#B71C1C",
      borderRadius: "10px",
      padding: "14px 16px",
      fontSize: "13.5px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "20px",
    },
    success: {
      background: "#E8F5E9",
      border: "1.5px solid #43A047",
      color: "#1B5E20",
      borderRadius: "10px",
      padding: "14px 16px",
      fontSize: "13.5px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "20px",
    },
  };

  const alertIcons: Record<string, string> = {
    warning: "⏳",
    error: "❌",
    success: "✅",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#E6F1FB",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(24,95,165,0.12)",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "420px",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px", background: "#185FA5",
            borderRadius: "14px", margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" fill="#fff" />
            </svg>
          </div>
          <h1 style={{ color: "#2C2C2A", fontSize: "22px", fontWeight: 700, margin: 0 }}>
            Espace Professeur
          </h1>
          <p style={{ color: "#888780", fontSize: "14px", marginTop: "6px" }}>
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Alerte */}
        {alert && (
          <div style={alertStyles[alert.type]}>
            <span style={{ fontSize: "18px" }}>{alertIcons[alert.type]}</span>
            <span>{alert.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          <div>
            <label style={labelStyle}>Email professionnel</label>
            <input
              type="email"
              placeholder="professeur@universite.tn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#185FA5")}
              onBlur={(e) => (e.target.style.borderColor = "#D3D1C7")}
            />
          </div>

          <div>
            <label style={labelStyle}>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#185FA5")}
              onBlur={(e) => (e.target.style.borderColor = "#D3D1C7")}
            />
          </div>

          <div style={{ textAlign: "right", marginTop: "-10px" }}>
            <a href="#" style={{ color: "#185FA5", fontSize: "13px", textDecoration: "none" }}>
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#7AAED6" : "#185FA5",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "4px",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = "#134d87"; }}
            onMouseOut={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = "#185FA5"; }}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#888780", margin: 0 }}>
            Pas encore de compte ?{" "}
            <a href="/signin/professeur" style={{ color: "#185FA5", textDecoration: "none", fontWeight: 600 }}>
              S'inscrire
            </a>
          </p>

        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", color: "#2C2C2A", fontSize: "13px",
  fontWeight: 600, marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", border: "1.5px solid #D3D1C7",
  borderRadius: "9px", fontSize: "14px", color: "#2C2C2A", background: "#F1EFE8",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", appearance: "none",
};