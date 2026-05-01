"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8080/backend-universite/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("adminNomUtilisateur", data.nomUtilisateur);
        localStorage.setItem("adminEmail", data.email);
        localStorage.setItem("adminToken", data.token);

        router.push("/dashboard/admin");
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage("Erreur de connexion au serveur");
      console.error(error);
    }

  };

  return (
    <div
      id="login-page"
      style={{
        minHeight: "100vh",
        background: "#E6F1FB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div
        id="login-card"
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(24,95,165,0.12)",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <div id="login-header" style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            id="login-logo"
            style={{
              width: "56px",
              height: "56px",
              background: "#185FA5",
              borderRadius: "14px",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" fill="#fff" />
            </svg>
          </div>


          <h1 style={{ color: "#2C2C2A", fontSize: "22px", fontWeight: 700, margin: 0 }}>
            Espace Administrateur
          </h1>

          <p style={{ color: "#888780", fontSize: "14px", marginTop: "6px", marginBottom: "6px" }}>
            Connectez-vous à votre espace {"d'administration"}
          </p>

          {errorMessage && (
            <p
              style={{
                color: "red",
                fontSize: "13px",
                marginTop: "4px",
                marginBottom: "0",
              }}
            >
              {errorMessage}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>

            <label htmlFor="email" style={labelStyle}>Email administrateur</label>
            <input
              id="email"
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="password" style={labelStyle}>Mot de passe</label>
            <input
              id="password"
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

          {/* Forgot */}
          <div style={{ textAlign: "right", marginTop: "-10px" }}>
            <a href="#" id="forgot-link" style={{ color: "#185FA5", fontSize: "13px", textDecoration: "none" }}>
              Mot de passe oublié ?
            </a>
          </div>

          {/* Submit */}
          <button
            id="btn-submit"
            />

          <button
            type="submit"
            style={{
              background: "#185FA5",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "4px",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => ((e.target as HTMLButtonElement).style.background = "#134d87")}
            onMouseOut={(e) => ((e.target as HTMLButtonElement).style.background = "#185FA5")}
            

          >
            Se connecter
          </button>
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