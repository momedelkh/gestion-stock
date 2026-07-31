import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../background-login.jpg";

function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Login & Common States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    // Registration States
    const [entreprise, setEntreprise] = useState("");
    const [nom, setNom] = useState("");
    
    const navigate = useNavigate();

    const login = async () => {
        if (!email.trim() || !password.trim()) {
            setError("Veuillez saisir votre email et mot de passe.");
            return;
        }
        try {
            const API = process.env.REACT_APP_API_URL || "https://gestion-stock-de-mon-entreprise.onrender.com";
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
                localStorage.setItem("entreprise", data.entreprise || "TIJARA PRO");
                navigate("/");
                window.location.reload();
            } else {
                setError(data.message || "Identifiants incorrects.");
            }
        } catch (e) {
            setError("Erreur de connexion au serveur.");
        }
    };

    const register = async () => {
        if (!entreprise.trim() || !nom.trim() || !email.trim() || !password.trim()) {
            setError("Veuillez remplir tous les champs pour créer l'entreprise.");
            return;
        }
        try {
            const API = process.env.REACT_APP_API_URL || "https://gestion-stock-de-mon-entreprise.onrender.com";
            const res = await fetch(`${API}/register-company`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entreprise, nom, email, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                alert("Votre entreprise a été créée avec succès ! Vous pouvez maintenant vous connecter avec cet email.");
                setIsRegistering(false);
                setError("");
                setEntreprise("");
                setNom("");
            } else {
                setError(data.error || "Erreur lors de la création.");
            }
        } catch (e) {
            setError("Erreur de connexion au serveur.");
        }
    };

    return (
        <div className="login-auth-bg" style={container}>
            <div className="login-box" style={box}>
                
                <div style={brandSection}>
                    <div style={iconBadge}>
                        <span style={{ fontSize: "32px" }}>📦</span>
                    </div>
                    <h1 style={titleBold}>{isRegistering ? "Création Espace" : "TIJARA PRO"}</h1>
                    <h2 style={titleSmall}>{isRegistering ? "Enregistrer une entreprise" : "GESTION ERP & STOCK"}</h2>
                </div>

                <p style={subtitle}>
                    {isRegistering 
                        ? "Configurez l'espace ERP de votre entreprise" 
                        : "Veuillez vous identifier pour continuer"
                    }
                </p>

                {error && <div style={errorStyle}>{error}</div>}

                {isRegistering ? (
                    /* FORMULAIRE DE CRÉATION D'ENTREPRISE */
                    <>
                        <div style={inputContainer}>
                            <label style={label}>Nom de votre Entreprise</label>
                            <input
                                style={input}
                                placeholder="Ex: Boutique Alpha Sarl"
                                value={entreprise}
                                onChange={(e) => setEntreprise(e.target.value)}
                            />
                        </div>

                        <div style={inputContainer}>
                            <label style={label}>Nom complet (Directeur)</label>
                            <input
                                style={input}
                                placeholder="Ex: Mohamed Al Khair"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                            />
                        </div>

                        <div style={inputContainer}>
                            <label style={label}>Adresse Email de Connexion</label>
                            <input
                                style={input}
                                type="email"
                                placeholder="directeur@boutique.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div style={inputContainer}>
                            <label style={label}>Mot de passe</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    style={{ ...input, paddingRight: "42px" }}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={eyeButtonStyle}
                                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <button 
                          style={successButton} 
                          onClick={register}
                          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                          onMouseOut={(e) => e.currentTarget.style.transform = "none"}
                        >
                            Créer mon Espace 🚀
                        </button>

                        <div style={{ marginTop: "18px", textAlign: "center" }}>
                            <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); setIsRegistering(false); setError(""); }}
                                style={linkStyle}
                            >
                                ← Retour à la Connexion
                            </a>
                        </div>
                    </>
                ) : (
                    /* FORMULAIRE DE CONNEXION */
                    <>
                        <div style={inputContainer}>
                            <label style={label}>Identifiant (Email)</label>
                            <input
                                style={input}
                                placeholder="exemple@entreprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div style={inputContainer}>
                            <label style={label}>Mot de passe</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    style={{ ...input, paddingRight: "42px" }}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={eyeButtonStyle}
                                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <button 
                          style={button} 
                          onClick={login}
                          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                          onMouseOut={(e) => e.currentTarget.style.transform = "none"}
                        >
                            Connexion Sécurisée 🔐
                        </button>

                        <div style={{ marginTop: "18px", textAlign: "center" }}>
                            <a 
                                href="#" 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    alert("Veuillez contacter le Responsable Général TIJARA PRO (admin@tijarapro.com) pour la réinitialisation de vos accès."); 
                                }}
                                style={linkStyle}
                            >
                                Mot de passe oublié ?
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* 🎨 STYLES : PREMIUM MODERN GLASSMORPHISM & TIJARA PRO THEME */

const footerLogin = {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
};

const linkStyle = {
    fontSize: "13px",
    color: "#0284c7",
    textDecoration: "none",
    fontWeight: "600",
    transition: "all 0.2s ease"
};

const demoBox = {
    fontSize: "12px",
    color: "#64748b",
    background: "rgba(241, 245, 249, 0.85)",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "10px 12px",
    marginTop: "20px",
    textAlign: "center"
};

const container = {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.65)), url(${bgImage})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    boxSizing: "border-box",
    padding: "20px"
};

const box = {
    background: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 246, 255, 0.92))",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    padding: "42px 36px",
    borderRadius: "18px",
    textAlign: "center",
    width: "390px",
    maxWidth: "92%",
    boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.6)",
    borderTop: "6px solid #0284c7",
    boxSizing: "border-box"
};

const brandSection = {
    marginBottom: "20px"
};

const iconBadge = {
    width: "60px",
    height: "60px",
    margin: "0 auto 12px auto",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.45)"
};

const titleBold = {
    color: "#0f172a",
    fontSize: "28px",
    margin: "0",
    fontWeight: "900",
    letterSpacing: "0.5px"
};

const titleSmall = {
    color: "#0284c7",
    fontSize: "11px",
    margin: "6px 0 0 0",
    fontWeight: "700",
    letterSpacing: "1.5px"
};

const subtitle = {
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "24px",
    fontWeight: "500"
};

const inputContainer = {
    marginBottom: "16px",
    textAlign: "left"
};

const label = {
    display: "block",
    marginBottom: "6px",
    fontSize: "12px",
    color: "#334155",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
};

const input = {
    width: "100%",
    padding: "13px 14px",
    boxSizing: "border-box",
    borderRadius: "8px",
    border: "1.5px solid #cbd5e1",
    outline: "none",
    fontSize: "14px",
    background: "#f8fafc",
    color: "#0f172a",
    transition: "all 0.2s ease"
};

const button = {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    marginTop: "12px",
    boxShadow: "0 8px 20px -4px rgba(2, 132, 199, 0.5)",
    transition: "all 0.2s ease"
};

const successButton = {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    marginTop: "12px",
    boxShadow: "0 8px 20px -4px rgba(16, 185, 129, 0.45)",
    transition: "all 0.2s ease"
};

const errorStyle = {
    color: "#ef4444",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: "11px 14px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "13px",
    fontWeight: "500"
};

const eyeButtonStyle = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    outline: "none",
    userSelect: "none"
};

export default Login;