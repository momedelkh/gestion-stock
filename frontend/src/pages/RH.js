import React, { useState, useEffect } from "react";
import { t } from "../i18n";

function RH() {
    const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
    const role = localStorage.getItem("role") || "directeur";

    const [employes, setEmployes] = useState([]);

    const fetchEmployes = () => {
        fetch(`${API}/users`)
            .then(res => res.json())
            .then(data => setEmployes(data))
            .catch(err => console.error("Erreur chargement utilisateurs:", err));
    };

    useEffect(() => {
        fetchEmployes();
    }, []);

    const editerEmploye = (e) => {
        const nouveauStatut = window.prompt("Modifier le statut de l'employé (ex: Actif, En congé) :", e.statut || "Actif");
        if (nouveauStatut) {
            const modifSalaire = window.prompt("Modifier le Salaire (en FCFA) :", e.salaire || "0");
            const modifDroit = window.confirm(`Cet utilisateur a actuellement le droit d'édition : ${e.canEdit ? "OUI" : "NON"}.\nVoulez-vous inverser ce droit ? (OK = Inverser, Annuler = Ne rien changer)`);
            fetch(`${API}/users/modifier/${e.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ statut: nouveauStatut, salaire: modifSalaire || e.salaire, canEdit: modifDroit ? !e.canEdit : e.canEdit })
            }).then(() => fetchEmployes());
        }
    };

    const ajouterEmploye = () => {
        const estTechnicien = window.confirm("Créer un profil 'Technicien de Surface' (Personnel sans accès informatique) ?\n(OK = Oui, Annuler = Profil Vendeur standard)");
        
        let email = "";
        let password = "";
        let canEdit = false;
        const roleStr = estTechnicien ? "technicien_surface" : "employe";
        const posteDefaut = estTechnicien ? "Technicien de Surface" : "Vendeur";

        if (!estTechnicien) {
            email = window.prompt("Adresse Email de connexion :");
            if(!email) return;
            password = window.prompt("Mot de passe temporaire :");
            if(!password) return;
        } else {
            email = `tech_${Date.now()}@interne.local`;
            password = "NO_LOGIN";
        }

        const nom = window.prompt("Nom complet :");
        const poste = window.prompt("Poste occupé :", posteDefaut);
        const salaire = window.prompt("Salaire Mensuel (en FCFA) :", "0");

        if (!estTechnicien) {
            const reqEdit = window.prompt("Cet employé peut-il modifier ou supprimer l'inventaire ? (tapez ou / oui)", "non");
            canEdit = (reqEdit && (reqEdit.toLowerCase().includes("ou") || reqEdit.toLowerCase().includes("yes"))) ? true : false;
        }

        fetch(`${API}/users/ajouter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, nom, poste, role: roleStr, salaire: salaire || "0", statut: "Actif", canEdit })
        }).then(res => {
            if(res.ok) {
                fetchEmployes();
            } else {
                alert("Erreur: L'email est peut-être déjà utilisé.");
            }
        });
    };

    return (
        <div style={container}>
            <div style={pageHeader}>
                <h2 style={{ margin: 0, fontWeight: "normal", color: "#333" }}>👥 {t("Ressources Humaines")}</h2>
                <span style={{color: "#777", fontSize: "14px"}}>{t("Gestion du Personnel et de la Paie")}</span>
            </div>

            {role === "directeur" && (
                <div style={{...panel, borderTopColor: "#00a65a", padding:"20px", display:"flex", alignItems:"center"}}>
                    <h3 style={{margin:0, flex:1, color:"#333"}}>Masse Salariale Mensuelle :</h3>
                    <h2 style={{margin:0, color:"#dd4b39"}}>
                        {employes.reduce((sum, e) => sum + (Number(String(e.salaire || "0").replace(/[^0-9.-]+/g, "")) || 0), 0).toLocaleString()} FCFA
                    </h2>
                </div>
            )}

            <div style={{...panel, borderTopColor: "#f39c12"}}>
                <div style={{...panelHeader, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <span>📁 {t("Registre des Employés")}</span>
                    {role === "directeur" && (
                        <button style={btnSuccess} onClick={ajouterEmploye}>+ {t("Créer un Accès Employé")}</button>
                    )}
                </div>
                <div style={panelBody}>
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
                            {employes.map((e) => (
                                <tr key={e.id} style={{ transition: "background 0.2s" }} onMouseOver={(evt)=>evt.currentTarget.style.backgroundColor="#f4f6f9"} onMouseOut={(evt)=>evt.currentTarget.style.backgroundColor="transparent"}>
                                    <td style={td}>USR-{e.id.toString().slice(-4)}</td>
                                    <td style={td}><b>{e.nom || "Utilisateur Système"}</b></td>
                                    <td style={td}>{e.email}</td>
                                    <td style={td}>{e.poste || e.role.toUpperCase()}</td>
                                    <td style={td}><b>{e.salaire || "0"} FCFA</b></td>
                                    <td style={td}>
                                        {e.role === "directeur" ? <span style={{color: "green", fontWeight: "bold"}}>Total</span> : (e.role === "technicien_surface" ? <span style={{color:"gray"}}>Aucun (Bloqué)</span> : (e.canEdit ? <span style={{color: "orange", fontWeight: "bold"}}>Oui</span> : <span style={{color: "red"}}>Non</span>))}
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
                                                onClick={() => editerEmploye(e)}
                                            >
                                                {t("✏️ Éditer")}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {employes.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{textAlign:"center", padding:"20px", color:"#999"}}>Aucun utilisateur enregistré.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Styles partagés
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

export default RH;
