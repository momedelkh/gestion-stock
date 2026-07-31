import { useState, useEffect } from "react";

function SuperAdmin() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Formulaire de création d'entreprise par le SuperAdmin
    const [entreprise, setEntreprise] = useState("");
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const API = process.env.REACT_APP_API_URL || "https://gestion-stock-de-mon-entreprise.onrender.com";

    const fetchAllUsers = async () => {
        try {
            const res = await fetch(`${API}/all-users`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (e) {
            setError("Erreur de chargement des utilisateurs.");
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const createCompanyByAdmin = async (e) => {
        e.preventDefault();
        if (!entreprise.trim() || !nom.trim() || !email.trim() || !password.trim()) {
            setError("Veuillez remplir tous les champs du formulaire.");
            return;
        }
        try {
            setError("");
            setMessage("");
            const res = await fetch(`${API}/register-company`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entreprise, nom, email, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setMessage(`L'espace entreprise "${entreprise}" et le compte de ${nom} (${email}) ont été créés avec succès !`);
                setEntreprise("");
                setNom("");
                setEmail("");
                setPassword("");
                fetchAllUsers();
            } else {
                setError(data.error || "Erreur lors de la création de l'entreprise.");
            }
        } catch (e) {
            setError("Erreur de connexion au serveur.");
        }
    };

    const handleResetPassword = async (userEmail) => {
        const newPassword = prompt(`Saisissez le nouveau mot de passe pour ${userEmail} :`);
        if (!newPassword || !newPassword.trim()) return;

        try {
            setError("");
            setMessage("");
            const res = await fetch(`${API}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, newPassword: newPassword.trim() })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert(`Le mot de passe de ${userEmail} a été mis à jour avec succès : "${newPassword.trim()}"`);
                fetchAllUsers();
            } else {
                alert(data.error || "Erreur de mise à jour.");
            }
        } catch (e) {
            alert("Erreur de connexion au serveur.");
        }
    };

    const switchCompanyView = (compName) => {
        localStorage.setItem("entreprise", compName);
        alert(`Vous consultez désormais l'espace de l'entreprise : "${compName}"`);
        window.location.reload();
    };

    const filteredUsers = users.filter(u => 
        (u.entreprise || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.nom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={container}>
            <div style={headerCard}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={badgeIcon}>👑</div>
                    <div>
                        <h1 style={{ margin: "0", fontSize: "24px", color: "#0f172a" }}>Console SuperAdmin — TIJARA PRO</h1>
                        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
                            Gestion centralisée de toutes les entreprises, création d'espaces & réinitialisation des mots de passe.
                        </p>
                    </div>
                </div>
            </div>

            {message && <div style={successBanner}>✅ {message}</div>}
            {error && <div style={errorBanner}>⚠️ {error}</div>}

            <div style={grid}>
                {/* FORMULAIRE SÉCURISÉ DE CRÉATION D'ENTREPRISE */}
                <div style={card}>
                    <h2 style={cardTitle}>🏢 Créer un Nouvel Espace Entreprise</h2>
                    <p style={cardSubtitle}>Seul le SuperAdmin a l'autorité de créer des nouveaux comptes d'entreprise.</p>

                    <form onSubmit={createCompanyByAdmin}>
                        <div style={fieldGroup}>
                            <label style={label}>Nom de l'Entreprise</label>
                            <input
                                style={input}
                                placeholder="Ex: Sarl Atlas Commerce"
                                value={entreprise}
                                onChange={(e) => setEntreprise(e.target.value)}
                            />
                        </div>

                        <div style={fieldGroup}>
                            <label style={label}>Nom du Directeur / Gérant</label>
                            <input
                                style={input}
                                placeholder="Ex: Mohamed Al Khair"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                            />
                        </div>

                        <div style={fieldGroup}>
                            <label style={label}>Adresse Email du Directeur</label>
                            <input
                                style={input}
                                type="email"
                                placeholder="directeur@atlas.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div style={fieldGroup}>
                            <label style={label}>Mot de passe d'Accès Initial</label>
                            <input
                                style={input}
                                type="text"
                                placeholder="Définir un mot de passe fort"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" style={primaryBtn}>
                            🚀 Valider et Créer l'Espace Entreprise
                        </button>
                    </form>
                </div>

                {/* LISTE & GESTION DES MOTS DE PASSE TOUTES ENTREPRISES */}
                <div style={{ ...card, flex: 2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <h2 style={cardTitle}>🔑 Répertoire Général & Réinitialisation</h2>
                            <p style={cardSubtitle}>Consultez ou modifiez les accès de n'importe quelle entreprise en cas d'oubli.</p>
                        </div>
                        <input
                            style={{ ...input, width: "240px", padding: "8px 12px" }}
                            placeholder="🔍 Chercher entreprise, nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={tableWrapper}>
                        <table style={table}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={th}>Entreprise</th>
                                    <th style={th}>Utilisateur / Poste</th>
                                    <th style={th}>Email</th>
                                    <th style={th}>Mot de Passe</th>
                                    <th style={th}>Actions SuperAdmin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                                            Aucun utilisateur trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u, i) => (
                                        <tr key={u.id || i} style={tr}>
                                            <td style={td}>
                                                <strong style={{ color: "#0284c7" }}>{u.entreprise || "TIJARA PRO"}</strong>
                                            </td>
                                            <td style={td}>
                                                <div style={{ fontWeight: "600", color: "#0f172a" }}>{u.nom || "Utilisateur"}</div>
                                                <span style={badgeRole}>{u.poste || u.role || "Directeur"}</span>
                                            </td>
                                            <td style={td}>{u.email}</td>
                                            <td style={td}>
                                                <code style={codeBg}>{u.password || "••••••••"}</code>
                                            </td>
                                            <td style={td}>
                                                <div style={{ display: "flex", gap: "6px" }}>
                                                    <button
                                                        onClick={() => handleResetPassword(u.email)}
                                                        style={resetBtn}
                                                        title="Réinitialiser le mot de passe"
                                                    >
                                                        🔑 Modifier Mdp
                                                    </button>
                                                    <button
                                                        onClick={() => switchCompanyView(u.entreprise || "TIJARA PRO")}
                                                        style={switchBtn}
                                                        title="Inspecter cet espace entreprise"
                                                    >
                                                        🏢 Consulter
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 🎨 STYLES CORPORATE GLASS & SUPERADMIN
const container = {
    padding: "25px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
};

const headerCard = {
    background: "#ffffff",
    padding: "20px 25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    marginBottom: "25px",
    borderLeft: "6px solid #0284c7"
};

const badgeIcon = {
    fontSize: "30px",
    background: "linear-gradient(135deg, #0284c7, #2563eb)",
    color: "#fff",
    padding: "10px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
};

const grid = {
    display: "flex",
    gap: "25px",
    flexWrap: "wrap"
};

const card = {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    flex: "1 1 340px"
};

const cardTitle = {
    fontSize: "18px",
    margin: "0 0 4px 0",
    color: "#0f172a",
    fontWeight: "700"
};

const cardSubtitle = {
    fontSize: "13px",
    color: "#64748b",
    margin: "0 0 20px 0"
};

const fieldGroup = {
    marginBottom: "15px"
};

const label = {
    display: "block",
    marginBottom: "6px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
};

const input = {
    width: "100%",
    padding: "11px 13px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none"
};

const primaryBtn = {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #0284c7, #2563eb)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
};

const tableWrapper = {
    overflowX: "auto"
};

const table = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px"
};

const thRow = {
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0"
};

const th = {
    padding: "12px",
    textAlign: "left",
    color: "#475569",
    fontWeight: "700"
};

const tr = {
    borderBottom: "1px solid #f1f5f9"
};

const td = {
    padding: "12px",
    verticalAlign: "middle"
};

const badgeRole = {
    display: "inline-block",
    fontSize: "10px",
    padding: "2px 8px",
    background: "#e0f2fe",
    color: "#0369a1",
    borderRadius: "4px",
    fontWeight: "600",
    marginTop: "2px"
};

const codeBg = {
    background: "#f1f5f9",
    padding: "4px 8px",
    borderRadius: "4px",
    fontFamily: "monospace",
    color: "#0f172a",
    fontSize: "12px"
};

const resetBtn = {
    padding: "6px 10px",
    background: "#0284c7",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600"
};

const switchBtn = {
    padding: "6px 10px",
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600"
};

const successBanner = {
    background: "#dcfce7",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "600"
};

const errorBanner = {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "600"
};

export default SuperAdmin;
