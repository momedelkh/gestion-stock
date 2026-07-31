import React, { useState, useEffect } from "react";

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

    // Formulaire des réglages personnels du SuperAdmin
    const [myNom, setMyNom] = useState("SuperAdmin Maître");
    const [myEmail, setMyEmail] = useState(localStorage.getItem("userEmail") || "admin@tijarapro.com");
    const [myPassword, setMyPassword] = useState("admin");
    const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
    const [profileErrorMsg, setProfileErrorMsg] = useState("");

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

    const handleUpdateUserEmail = async (user) => {
        const newEmail = prompt(`Saisissez la nouvelle adresse email pour ${user.nom || "cet utilisateur"} (ancien: ${user.email}) :`, user.email);
        if (!newEmail || !newEmail.trim() || newEmail.trim() === user.email) return;

        try {
            setError("");
            setMessage("");
            const res = await fetch(`${API}/update-user-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id || user._id,
                    oldEmail: user.email,
                    newEmail: newEmail.trim()
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setMessage(`L'adresse email a été modifiée avec succès : ${newEmail.trim()}`);
                fetchAllUsers();
            } else {
                alert(data.error || "Erreur lors de la modification de l'email.");
            }
        } catch (e) {
            alert("Erreur de connexion au serveur.");
        }
    };

    const handleDeleteCompany = async (companyName) => {
        if (!companyName) return;
        const confirmation = window.confirm(
            `⚠️ ATTENTION ACTION CRITIQUE !\n\nVoulez-vous vraiment supprimer l'entreprise "${companyName}" ainsi que TOUTES ses données (produits, stock, employés, clients et historiques) ?\n\nCette suppression est DEFINITIVE et IRRÉVERSIBLE.`
        );
        if (!confirmation) return;

        try {
            setError("");
            setMessage("");
            const res = await fetch(`${API}/delete-company`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entreprise: companyName })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setMessage(data.message || `L'entreprise "${companyName}" a été supprimée avec succès.`);
                fetchAllUsers();
            } else {
                alert(data.error || "Erreur lors de la suppression de l'entreprise.");
            }
        } catch (e) {
            alert("Erreur lors de la suppression.");
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.nom || user.email} ?`)) return;
        try {
            const res = await fetch(`${API}/delete-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id || user._id, email: user.email })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setMessage(`L'utilisateur ${user.email} a été supprimé.`);
                fetchAllUsers();
            } else {
                alert(data.error || "Erreur lors de la suppression.");
            }
        } catch (e) {
            alert("Erreur réseau.");
        }
    };

    const handleSaveSuperAdminProfile = async (e) => {
        e.preventDefault();
        if (!myEmail.trim() || !myPassword.trim()) {
            setProfileErrorMsg("Veuillez remplir l'email et le mot de passe.");
            return;
        }
        try {
            setProfileErrorMsg("");
            setProfileSuccessMsg("");
            const res = await fetch(`${API}/update-superadmin-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: myEmail.trim(),
                    password: myPassword.trim(),
                    newNom: myNom.trim()
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setProfileSuccessMsg("Vos identifiants SuperAdmin ont été enregistrés avec succès ! Utilise-les lors de vos prochaines connexions.");
                localStorage.setItem("userEmail", myEmail.trim());
            } else {
                setProfileErrorMsg(data.error || "Erreur de mise à jour des réglages.");
            }
        } catch (e) {
            setProfileErrorMsg("Erreur de connexion au serveur.");
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

    // Extraction des entreprises uniques pour affichage et gestion
    const entreprisesUniques = Array.from(new Set(users.map(u => u.entreprise).filter(Boolean)));

    return (
        <div style={container}>
            {/* EN-TÊTE SUPERADMIN */}
            <div style={headerCard}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={badgeIcon}>👑</div>
                    <div>
                        <h1 style={{ margin: "0", fontSize: "24px", color: "#0f172a" }}>Console SuperAdmin — TIJARA PRO</h1>
                        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
                            Gestion globale des entreprises, modification des emails, suppression des comptes & réglages SuperAdmin.
                        </p>
                    </div>
                </div>
            </div>

            {message && <div style={successBanner}>✅ {message}</div>}
            {error && <div style={errorBanner}>⚠️ {error}</div>}

            <div style={grid}>
                {/* 1. NOUVEAU : RÉGLAGES DU PROFIL SUPERADMIN */}
                <div style={card}>
                    <h2 style={cardTitle}>⚙️ Mes Réglages SuperAdmin</h2>
                    <p style={cardSubtitle}>Modifiez votre propre email et mot de passe de connexion SuperAdmin.</p>

                    {profileSuccessMsg && <div style={{ ...successBanner, fontSize: "12px", padding: "8px 12px" }}>✅ {profileSuccessMsg}</div>}
                    {profileErrorMsg && <div style={{ ...errorBanner, fontSize: "12px", padding: "8px 12px" }}>⚠️ {profileErrorMsg}</div>}

                    <form onSubmit={handleSaveSuperAdminProfile}>
                        <div style={fieldGroup}>
                            <label style={label}>Mon Nom / Identité</label>
                            <input
                                style={input}
                                value={myNom}
                                onChange={(e) => setMyNom(e.target.value)}
                            />
                        </div>

                        <div style={fieldGroup}>
                            <label style={label}>Mon Email SuperAdmin</label>
                            <input
                                style={input}
                                type="email"
                                value={myEmail}
                                onChange={(e) => setMyEmail(e.target.value)}
                            />
                        </div>

                        <div style={fieldGroup}>
                            <label style={label}>Nouveau Mot de passe SuperAdmin</label>
                            <input
                                style={input}
                                type="text"
                                value={myPassword}
                                onChange={(e) => setMyPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" style={settingsBtn}>
                            💾 Enregistrer Mes Identifiants
                        </button>
                    </form>
                </div>

                {/* 2. FORMULAIRE DE CRÉATION D'ENTREPRISE */}
                <div style={card}>
                    <h2 style={cardTitle}>🏢 Créer un Nouvel Espace Entreprise</h2>
                    <p style={cardSubtitle}>Création directe d'un accès Directeur pour une nouvelle société.</p>

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
                            🚀 Valider et Créer l'Entreprise
                        </button>
                    </form>
                </div>

                {/* 3. REPERTOIRE ENTREPRISES & COMPTES UTILISATEURS */}
                <div style={{ ...card, flex: "1 1 100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <h2 style={cardTitle}>🔑 Répertoire Général, Mails & Entreprises ({users.length})</h2>
                            <p style={cardSubtitle}>Gérez les emails, réinitialisez les mots de passe et supprimez les entreprises si besoin.</p>
                        </div>
                        <input
                            style={{ ...input, width: "260px", padding: "8px 12px" }}
                            placeholder="🔍 Chercher entreprise, nom, mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* BANDEAU GESTION RAPIDE DES ENTREPRISES */}
                    {entreprisesUniques.length > 0 && (
                        <div style={{ background: "#f8fafc", padding: "12px 15px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "15px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                                🗑️ Suppression d'Entreprises ({entreprisesUniques.length}) :
                            </span>
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                {entreprisesUniques.map(entName => (
                                    <div key={entName} style={{ display: "flex", alignItems: "center", background: "#ffffff", padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", gap: "8px" }}>
                                        <span style={{ fontWeight: "bold", fontSize: "13px", color: "#0f172a" }}>🏢 {entName}</span>
                                        <button
                                            style={{ padding: "3px 8px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                                            onClick={() => handleDeleteCompany(entName)}
                                            title="Supprimer l'entreprise et toutes ses données"
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={tableWrapper}>
                        <table style={table}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={th}>Entreprise</th>
                                    <th style={th}>Utilisateur / Role</th>
                                    <th style={th}>Email (Modifiable)</th>
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
                                        <tr key={u.id || u._id || i} style={tr}>
                                            <td style={td}>
                                                <strong style={{ color: "#0284c7" }}>{u.entreprise || "TIJARA PRO"}</strong>
                                                <br/>
                                                <button
                                                    onClick={() => handleDeleteCompany(u.entreprise)}
                                                    style={{ background: "none", border: "none", color: "#ef4444", fontSize: "11px", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                                                >
                                                    🗑️ Supprimer Entreprise
                                                </button>
                                            </td>
                                            <td style={td}>
                                                <div style={{ fontWeight: "600", color: "#0f172a" }}>{u.nom || "Utilisateur"}</div>
                                                <span style={badgeRole}>{u.poste || u.role || "Directeur"}</span>
                                            </td>
                                            <td style={td}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <span>{u.email}</span>
                                                    <button
                                                        onClick={() => handleUpdateUserEmail(u)}
                                                        style={editEmailBtn}
                                                        title="Modifier cette adresse email"
                                                    >
                                                        ✏️ Modif Mail
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={td}>
                                                <code style={codeBg}>{u.password || "••••••••"}</code>
                                            </td>
                                            <td style={td}>
                                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
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
                                                    <button
                                                        onClick={() => handleDeleteUser(u)}
                                                        style={deleteUserBtn}
                                                        title="Supprimer cet utilisateur"
                                                    >
                                                        ❌ Supprimer
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

const settingsBtn = {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
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

const editEmailBtn = {
    padding: "3px 8px",
    background: "#f1f5f9",
    color: "#0284c7",
    border: "1px solid #bae6fd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
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

const deleteUserBtn = {
    padding: "6px 10px",
    background: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fca5a5",
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
