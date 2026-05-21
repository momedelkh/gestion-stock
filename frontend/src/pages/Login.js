import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const login = async () => {
        try {
            const API = process.env.REACT_APP_API_URL || "https://gestion-stock-backend-xs74.onrender.com";
            const res = await fetch(`${API}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem("user", data.email);
                localStorage.setItem("role", data.role);
                localStorage.setItem("canEdit", data.canEdit === true ? "true" : "false");
                navigate("/");
                window.location.reload();
            } else {
                setError(data.message || "Identifiants incorrects.");
            }
        } catch (e) {
            setError("Erreur de connexion au serveur.");
        }
    };

    return (
        <div style={container}>
            <div style={box}>
                
                <div style={brandSection}>
                    <div style={icon}>🏢</div>
                    <h1 style={titleBold}>L'Entreprise</h1>
                    <h2 style={titleSmall}>Gestion d'entreprise</h2>
                </div>

                <p style={subtitle}>Veuillez vous identifier pour continuer</p>

                {error && <div style={errorStyle}>{error}</div>}

                <div style={inputContainer}>
                    <label style={label}>Identifiant (Email)</label>
                    <input
                        style={input}
                        placeholder="exemple@entreprise.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div style={inputContainer}>
                    <label style={label}>Mot de passe</label>
                    <input
                        style={input}
                        type="password"
                        placeholder="••••••••"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button 
                  style={button} 
                  onClick={login}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#367fa9"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3c8dbc"}
                >
                    Connexion Sécurisée
                </button>

                <div style={footerLogin}>
                    <a 
                        href="#" 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            alert("Veuillez contacter l'administrateur système (admin@entreprise.com) pour réinitialiser vos accès."); 
                        }}
                        style={linkStyle}
                    >
                        Mot de passe oublié ?
                    </a>

                    <span style={demoText}>
                        Accès Démos : admin@entreprise.com (Mdp: admin)
                    </span>
                </div>
            </div>
        </div>
    );
}

/* 🎨 STYLES : DESIGN CORPORATE / ADMIN LTE */

const footerLogin = {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
};

const linkStyle = {
    fontSize: "13px",
    color: "#3c8dbc",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "color 0.2s",
};

const demoText = {
    fontSize: "11px",
    color: "#aaa",
    fontStyle: "italic"
};

const container = {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d2d6de", // Classic clear admin background
    fontFamily: "Arial, sans-serif"
};

const box = {
    background: "#fff",
    padding: "40px",
    borderRadius: "4px",
    textAlign: "center",
    width: "360px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    borderTop: "4px solid #3c8dbc"
};

const brandSection = {
    marginBottom: "25px"
};

const icon = {
    fontSize: "45px",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "5px"
};

const titleBold = {
    color: "#333",
    fontSize: "24px",
    margin: "0",
    fontWeight: "900",
    letterSpacing: "0.5px"
};

const titleSmall = {
    color: "#777",
    fontSize: "11px",
    margin: "5px 0 0 0",
    letterSpacing: "1px"
};

const subtitle = {
    color: "#666",
    fontSize: "14px",
    marginBottom: "25px",
    fontWeight: "normal"
};

const inputContainer = {
    marginBottom: "15px",
    textAlign: "left"
};

const label = {
    display: "block",
    marginBottom: "5px",
    fontSize: "13px",
    color: "#555",
    fontWeight: "bold"
};

const input = {
    width: "100%",
    padding: "12px 10px",
    boxSizing: "border-box", // Very necessary
    borderRadius: "2px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "14px",
};

const button = {
    width: "100%",
    padding: "12px",
    background: "#3c8dbc",
    color: "#fff",
    border: "none",
    borderRadius: "2px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
    marginTop: "10px",
    transition: "background 0.2s"
};

const errorStyle = {
    color: "#dd4b39",
    background: "#f2dede",
    border: "1px solid #ebccd1",
    padding: "10px",
    borderRadius: "2px",
    marginBottom: "20px",
    fontSize: "13px"
};

export default Login;