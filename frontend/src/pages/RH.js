import React, { useState, useEffect } from "react";
import { t } from "../i18n";

function RH() {
    const API = process.env.REACT_APP_API_URL || "https://gestion-stock-de-mon-entreprise.onrender.com";
    const role = localStorage.getItem("role") || "directeur";
    const entreprise = localStorage.getItem("entreprise") || "L'Entreprise";

    const [employes, setEmployes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editEmploye, setEditEmploye] = useState(null);

    // Formulaire Ajout
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [poste, setPoste] = useState("Vendeur");
    const [roleType, setRoleType] = useState("employe");
    const [salaire, setSalaire] = useState("0");
    const [canEdit, setCanEdit] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Formulaire Édition
    const [editStatut, setEditStatut] = useState("Actif");
    const [editSalaire, setEditSalaire] = useState("0");
    const [editCanEdit, setEditCanEdit] = useState(false);
    const [editPoste, setEditPoste] = useState("");

    const fetchEmployes = () => {
        fetch(`${API}/users?entreprise=${encodeURIComponent(entreprise)}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setEmployes(data);
                }
            })
            .catch(err => console.error("Erreur chargement utilisateurs:", err));
    };

    useEffect(() => {
        fetchEmployes();
    }, []);

    const resetAddForm = () => {
        setNom("");
        setEmail("");
        setPassword("");
        setPoste("Vendeur");
        setRoleType("employe");
        setSalaire("0");
        setCanEdit(false);
        setErrorMsg("");
    };

    const handleCreateEmploye = (e) => {
        e.preventDefault();
        setErrorMsg("");

        let finalEmail = email.trim();
        let finalPassword = password.trim();

        if (roleType === "technicien_surface") {
            finalEmail = `tech_${Date.now()}@interne.local`;
            finalPassword = "NO_LOGIN";
        } else {
            if (!finalEmail || !finalPassword) {
                setErrorMsg("Veuillez saisir l'email et le mot de passe de connexion.");
                return;
            }
        }

        if (!nom.trim()) {
            setErrorMsg("Veuillez saisir le nom complet de l'employé.");
            return;
        }

        fetch(`${API}/users/ajouter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: finalEmail,
                password: finalPassword,
                nom: nom.trim(),
                poste: poste.trim() || "Employé",
                role: roleType,
                salaire: salaire || "0",
                statut: "Actif",
                canEdit: roleType === "technicien_surface" ? false : canEdit,
                entreprise
            })
        }).then(res => res.json())
        .then(data => {
            if (data.error) {
                setErrorMsg(data.error);
            } else {
                setShowAddModal(false);
                resetAddForm();
                fetchEmployes();
            }
        }).catch(() => {
            fetchEmployes();
            setShowAddModal(false);
            resetAddForm();
        });
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (!editEmploye) return;

        const targetId = editEmploye.id || editEmploye._id;

        fetch(`${API}/users/modifier/${targetId}?entreprise=${encodeURIComponent(entreprise)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                statut: editStatut,
                salaire: editSalaire,
                poste: editPoste,
                canEdit: editCanEdit,
                entreprise
            })
        }).then(() => {
            setEditEmploye(null);
            fetchEmployes();
        }).catch(() => {
            setEditEmploye(null);
            fetchEmployes();
        });
    };

    const handleRoleTypeChange = (type) => {
        setRoleType(type);
        if (type === "technicien_surface") {
            setPoste("Technicien de Surface");
            setCanEdit(false);
        } else if (type === "directeur") {
            setPoste("Directeur Adjoint");
            setCanEdit(true);
        } else {
            setPoste("Vendeur Caissier");
            setCanEdit(false);
        }
    };

    return (
        <div style={container}>
            <div style={pageHeader}>
                <h2 style={{ margin: 0, fontWeight: "normal", color: "#333" }}>👥 {t("Ressources Humaines")}</h2>
                <span style={{color: "#777", fontSize: "14px"}}>{t("Gestion du Personnel et de la Paie")} — {entreprise}</span>
            </div>

            {role === "directeur" && (
                <div style={{...panel, borderTopColor: "#00a65a", padding:"20px", display:"flex", alignItems:"center"}}>
                    <h3 style={{margin:0, flex:1, color:"#333"}}>Masse Salariale Mensuelle Totale :</h3>
                    <h2 style={{margin:0, color:"#00a65a"}}>
                        {employes.reduce((sum, e) => sum + (Number(String(e.salaire || "0").replace(/[^0-9.-]+/g, "")) || 0), 0).toLocaleString()} FCFA
                    </h2>
                </div>
            )}

            <div style={{...panel, borderTopColor: "#f39c12"}}>
                <div style={{...panelHeader, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <span>📁 {t("Registre du Personnel & Équipe")} ({employes.length})</span>
                    {role === "directeur" && (
                        <button style={btnSuccess} onClick={() => { resetAddForm(); setShowAddModal(true); }}>
                            ➕ {t("Créer un Membre / Accès Employé")}
                        </button>
                    )}
                </div>
                <div style={panelBody}>
                    <div className="table-responsive">
                    <table style={table}>
                        <thead>
                            <tr>
                                <th style={th}>{t("RÉF.")}</th>
                                <th style={th}>{t("NOM COMPLET")}</th>
                                <th style={th}>{t("EMAIL (LOGIN)")}</th>
                                <th style={th}>{t("POSTE OCCUPÉ")}</th>
                                <th style={th}>{t("SALAIRE")}</th>
                                <th style={th}>{t("ACCÈS ÉDITION")}</th>
                                <th style={{textAlign: "center", ...th}}>{t("STATUT")}</th>
                                {role === "directeur" && <th style={{textAlign: "right", ...th}}>{t("ACTIONS")}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {employes.map((e, index) => {
                                const idDisplay = e.id || e._id || index;
                                return (
                                    <tr key={idDisplay} style={{ transition: "background 0.2s" }} onMouseOver={(evt)=>evt.currentTarget.style.backgroundColor="#f4f6f9"} onMouseOut={(evt)=>evt.currentTarget.style.backgroundColor="transparent"}>
                                        <td style={td}>USR-{String(idDisplay).slice(-4)}</td>
                                        <td style={td}><b>{e.nom || "Utilisateur Système"}</b></td>
                                        <td style={td}>{e.email}</td>
                                        <td style={td}>{e.poste || (e.role ? e.role.toUpperCase() : "Employé")}</td>
                                        <td style={td}><b>{Number(e.salaire || 0).toLocaleString()} FCFA</b></td>
                                        <td style={td}>
                                            {e.role === "directeur" ? (
                                                <span style={{color: "green", fontWeight: "bold"}}>Total</span>
                                            ) : (e.role === "technicien_surface" ? (
                                                <span style={{color:"gray"}}>Aucun (Personnel de surface)</span>
                                            ) : (e.canEdit ? (
                                                <span style={{color: "#0284c7", fontWeight: "bold"}}>Autorisé (Éditeur)</span>
                                            ) : (
                                                <span style={{color: "#64748b"}}>Lecture Seule</span>
                                            )))}
                                        </td>
                                        <td style={{textAlign: "center", ...td}}>
                                            <span style={{ 
                                                backgroundColor: e.statut === "Actif" ? "#00a65a" : "#f39c12", 
                                                color: "white", padding: "4px 10px", borderRadius: "10px", fontWeight: "bold", fontSize:"12px"
                                            }}>
                                                {e.statut || "Actif"}
                                            </span>
                                        </td>
                                        {role === "directeur" && (
                                            <td style={{textAlign: "right", ...td}}>
                                                <button 
                                                    style={btnEdit} 
                                                    onClick={() => {
                                                        setEditEmploye(e);
                                                        setEditStatut(e.statut || "Actif");
                                                        setEditSalaire(e.salaire || "0");
                                                        setEditPoste(e.poste || "Vendeur");
                                                        setEditCanEdit(e.canEdit || false);
                                                    }}
                                                >
                                                    ✏️ Modifier
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                            {employes.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{textAlign:"center", padding:"30px", color:"#94a3b8"}}>
                                        Aucun membre d'équipe enregistré pour l'instant. Cliquez sur "+ Créer un Membre" ci-dessus.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

            {/* MODALE DE CRÉATION D'EMPLOYÉ / ÉQUIPE (SANS FREEZE BROWSER) */}
            {showAddModal && (
                <div style={modalOverlay}>
                    <div style={modalCard}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                            <h3 style={{ margin: 0, color: "#0f172a" }}>➕ Ajouter un Membre à l'Équipe</h3>
                            <button style={closeBtn} onClick={() => setShowAddModal(false)}>✖</button>
                        </div>

                        {errorMsg && <div style={errorBanner}>⚠️ {errorMsg}</div>}

                        <form onSubmit={handleCreateEmploye}>
                            <div style={fieldGroup}>
                                <label style={label}>Type de Profil & Rôle</label>
                                <select
                                    style={selectStyle}
                                    value={roleType}
                                    onChange={(e) => handleRoleTypeChange(e.target.value)}
                                >
                                    <option value="employe">🛒 Vendeur / Caissier (Accès Informatique)</option>
                                    <option value="technicien_surface">🧹 Technicien de Surface (Personnel sans accès PC)</option>
                                    <option value="directeur">🔑 Gérant / Directeur Adjoint</option>
                                </select>
                            </div>

                            <div style={fieldGroup}>
                                <label style={label}>Nom Complet de l'Employé *</label>
                                <input
                                    style={inputStyle}
                                    placeholder="Ex: Moussa Traoré"
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    required
                                />
                            </div>

                            {roleType !== "technicien_surface" && (
                                <>
                                    <div style={fieldGroup}>
                                        <label style={label}>Email de Connexion *</label>
                                        <input
                                            style={inputStyle}
                                            type="email"
                                            placeholder="vendeur@entreprise.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div style={fieldGroup}>
                                        <label style={label}>Mot de passe Temporaire *</label>
                                        <input
                                            style={inputStyle}
                                            type="text"
                                            placeholder="Saisir un mot de passe"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div style={{ display: "flex", gap: "10px" }}>
                                <div style={{ ...fieldGroup, flex: 1 }}>
                                    <label style={label}>Poste Occupé</label>
                                    <input
                                        style={inputStyle}
                                        value={poste}
                                        onChange={(e) => setPoste(e.target.value)}
                                    />
                                </div>

                                <div style={{ ...fieldGroup, flex: 1 }}>
                                    <label style={label}>Salaire Mensuel (FCFA)</label>
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        value={salaire}
                                        onChange={(e) => setSalaire(e.target.value)}
                                    />
                                </div>
                            </div>

                            {roleType !== "technicien_surface" && roleType !== "directeur" && (
                                <div style={{ margin: "10px 0 20px 0", background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#334155", fontWeight: "bold" }}>
                                        <input
                                            type="checkbox"
                                            checked={canEdit}
                                            onChange={(e) => setCanEdit(e.target.checked)}
                                        />
                                        Autoriser cet employé à modifier/supprimer les produits du stock
                                    </label>
                                </div>
                            )}

                            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                                <button type="button" style={cancelBtn} onClick={() => setShowAddModal(false)}>Annuler</button>
                                <button type="submit" style={submitBtn}>Enregistrer l'Employé</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODALE D'ÉDITION D'EMPLOYÉ */}
            {editEmploye && (
                <div style={modalOverlay}>
                    <div style={modalCard}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                            <h3 style={{ margin: 0, color: "#0f172a" }}>✏️ Modifier l'Employé : {editEmploye.nom}</h3>
                            <button style={closeBtn} onClick={() => setEditEmploye(null)}>✖</button>
                        </div>

                        <form onSubmit={handleSaveEdit}>
                            <div style={fieldGroup}>
                                <label style={label}>Poste Occupé</label>
                                <input
                                    style={inputStyle}
                                    value={editPoste}
                                    onChange={(e) => setEditPoste(e.target.value)}
                                />
                            </div>

                            <div style={fieldGroup}>
                                <label style={label}>Statut du Compte</label>
                                <select
                                    style={selectStyle}
                                    value={editStatut}
                                    onChange={(e) => setEditStatut(e.target.value)}
                                >
                                    <option value="Actif">🟢 Actif</option>
                                    <option value="En congé">🟡 En congé</option>
                                    <option value="Inactif">🔴 Inactif / Suspendu</option>
                                </select>
                            </div>

                            <div style={fieldGroup}>
                                <label style={label}>Salaire Mensuel (FCFA)</label>
                                <input
                                    style={inputStyle}
                                    type="number"
                                    value={editSalaire}
                                    onChange={(e) => setEditSalaire(e.target.value)}
                                />
                            </div>

                            {editEmploye.role !== "technicien_surface" && editEmploye.role !== "directeur" && (
                                <div style={{ margin: "10px 0 20px 0", background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#334155", fontWeight: "bold" }}>
                                        <input
                                            type="checkbox"
                                            checked={editCanEdit}
                                            onChange={(e) => setEditCanEdit(e.target.checked)}
                                        />
                                        Droits d'Édition du Stock
                                    </label>
                                </div>
                            )}

                            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                                <button type="button" style={cancelBtn} onClick={() => setEditEmploye(null)}>Annuler</button>
                                <button type="submit" style={submitBtn}>Enregistrer les Modifications</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// STYLES
const container = { display: "flex", flexDirection: "column", gap: "20px" };
const pageHeader = { display: "flex", alignItems: "baseline", gap: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" };
const panel = { backgroundColor: "white", borderTop: "3px solid #d2d6de", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderRadius: "3px" };
const panelHeader = { padding: "12px 15px", borderBottom: "1px solid #f4f4f4", fontSize: "16px", fontWeight: "bold", color: "#444" };
const panelBody = { padding: "20px" };
const table = { width: "100%", borderCollapse: "collapse" };
const th = { backgroundColor: "#f9f9f9", padding: "12px", borderBottom: "2px solid #ddd", textAlign: "left", fontSize: "13px", color: "#555", fontWeight:"bold" };
const td = { padding: "12px", borderBottom: "1px solid #f4f4f4", fontSize: "14px", color: "#333", verticalAlign: "middle" };
const btnEdit = { backgroundColor: "#f39c12", color: "white", border: "none", padding: "6px 12px", borderRadius: "3px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" };
const btnSuccess = { backgroundColor: "#00a65a", color: "white", border: "none", padding: "8px 15px", borderRadius: "3px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" };

const modalOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px"
};

const modalCard = {
    background: "white",
    borderRadius: "8px",
    padding: "25px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
};

const fieldGroup = {
    marginBottom: "12px"
};

const label = {
    display: "block",
    marginBottom: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#475569"
};

const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none"
};

const selectStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    background: "white"
};

const submitBtn = {
    flex: 1,
    padding: "10px",
    background: "#00a65a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px"
};

const cancelBtn = {
    padding: "10px 15px",
    background: "#f1f5f9",
    color: "#64748b",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px"
};

const closeBtn = {
    border: "none",
    background: "none",
    fontSize: "18px",
    cursor: "pointer"
};

const errorBanner = {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "12px",
    fontSize: "13px"
};

export default RH;
