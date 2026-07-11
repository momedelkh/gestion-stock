import React, { useState, useEffect } from "react";
import { t } from "../i18n";

function CRM() {
    const API = process.env.REACT_APP_API_URL || "https://gestion-stock-de-mon-entreprise.onrender.com";

    const [clients, setClients] = useState([]);
    const [nom, setNom] = useState("");
    const [contact, setContact] = useState("");
    const [volumeAchats, setVolumeAchats] = useState("");
    const [niveau, setNiveau] = useState("Standard");
    const [editId, setEditId] = useState(null);

    const role = localStorage.getItem("role") || "directeur";
    const canEdit = localStorage.getItem("canEdit") === "true";

    const fetchClients = () => {
        fetch(`${API}/clients`)
            .then(res => res.json())
            .then(data => setClients(data));
    };

    const logAction = (actionDesc) => {
        const email = localStorage.getItem("user") || "Inconnu";
        fetch(`${API}/logs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: actionDesc, user: email })
        });
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const ajouterOuModifier = () => {
        if (!nom) return alert("Le nom du client (raison sociale) est requis.");
        
        const endpoint = editId ? `${API}/clients/modifier/${editId}` : `${API}/clients/ajouter`;
        const actionDesc = editId ? `A modifié la fiche du client : ${nom}` : `A ajouté un nouveau partenaire : ${nom}`;

        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nom, contact, volume_achats: volumeAchats, niveau })
        }).then(() => {
            fetchClients();
            logAction(actionDesc);
            reset();
        });
    };

    const supprimerClient = (c) => {
        if(window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le client : ${c.nom} ?`)) {
            fetch(`${API}/clients/supprimer/${c.id}`).then(() => {
                fetchClients();
                logAction(`A supprimé le client : ${c.nom}`);
            });
        }
    };

    const preparerModification = (c) => {
        setNom(c.nom || "");
        setContact(c.contact || "");
        setVolumeAchats(c.volume_achats || "");
        setNiveau(c.niveau || "Standard");
        setEditId(c.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const reset = () => {
        setNom(""); setContact(""); setVolumeAchats(""); setNiveau("Standard"); setEditId(null);
    };

    return (
        <div style={container}>
            <div style={pageHeader}>
                <h2 style={{ margin: 0, fontWeight: "normal", color: "#333" }}>🤝 {t("Gestion Relation Client (CRM)")}</h2>
                <span style={{color: "#777", fontSize: "14px"}}>{t("Portefeuille Clientèle")}</span>
            </div>

            {(role === "directeur" || canEdit) && (
                <div style={{...panel, borderTopColor: "#f39c12"}}>
                    <div style={panelHeader}>✨ {editId ? t("Modifier la Fiche Client") : t("Ajouter un Nouveau Partenaire")}</div>
                    <div style={{ ...panelBody, display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "flex-end" }}>
                        <div style={inputGroup}>
                            <label style={label}>{t("Raison Sociale *")}</label>
                            <input style={input} placeholder="Ex: Tech Solutions S.A." value={nom} onChange={(e) => setNom(e.target.value)} />
                        </div>
                        <div style={inputGroup}>
                            <label style={label}>{t("Email / Tel de Contact")}</label>
                            <input style={input} placeholder="Ex: contact@techsolutions.com" value={contact} onChange={(e) => setContact(e.target.value)} />
                        </div>
                        <div style={inputGroup}>
                            <label style={label}>{t("Volume d'Affaires")}</label>
                            <input style={input} placeholder="Ex: 5 000 000 FCFA" value={volumeAchats} onChange={(e) => setVolumeAchats(e.target.value)} />
                        </div>
                        <div style={inputGroup}>
                            <label style={label}>{t("Catégorie")}</label>
                            <select style={input} value={niveau} onChange={(e) => setNiveau(e.target.value)}>
                                <option value="Standard">Standard</option>
                                <option value="Premium">Premium</option>
                                <option value="VIP">VIP</option>
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "10px", marginTop:"10px", width:"100%" }}>
                            <button style={btnSave} onClick={ajouterOuModifier}>{editId ? t("💾 Enregistrer la Fiche") : t("➕ Ajouter à la Base")}</button>
                            {editId && <button style={btnCancel} onClick={reset}>{t("Annuler")}</button>}
                        </div>
                    </div>
                </div>
            )}

            <div style={{...panel, borderTopColor: "#3c8dbc"}}>
                <div style={panelHeader}>📋 {t("Base de données Clients Actifs")}</div>
                <div style={panelBody}>
                    <div className="table-responsive">
                    <table style={table}>
                        <thead>
                            <tr>
                                <th style={th}>{t("CODE CLIENT")}</th>
                                <th style={th}>{t("RAISON SOCIALE")}</th>
                                <th style={th}>{t("EMAIL DE CONTACT")}</th>
                                <th style={th}>{t("VOLUME D'AFFAIRES")}</th>
                                <th style={{textAlign: "center", ...th}}>{t("CATÉGORIE")}</th>
                                <th style={{textAlign: "right", ...th}}>{t("ACTIONS")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((c) => (
                                <tr key={c.id} style={{ transition: "background 0.2s" }} onMouseOver={(evt)=>evt.currentTarget.style.backgroundColor="#f4f6f9"} onMouseOut={(evt)=>evt.currentTarget.style.backgroundColor="transparent"}>
                                    <td style={td}>CLT-{c.id}</td>
                                    <td style={td}><b>{c.nom}</b></td>
                                    <td style={{...td, color: "#3c8dbc", textDecoration: "underline", cursor:"pointer"}}>{c.contact}</td>
                                    <td style={td}>{c.volume_achats}</td>
                                    <td style={{textAlign: "center", ...td}}>
                                        <span style={{ 
                                            backgroundColor: c.niveau === "VIP" ? "#dd4b39" : (c.niveau === "Premium" ? "#f39c12" : "#777"), 
                                            color: "white", padding: "4px 10px", borderRadius: "10px", fontWeight: "bold", fontSize:"12px"
                                        }}>
                                            {c.niveau}
                                        </span>
                                    </td>
                                    <td style={{textAlign: "right", ...td}}>
                                        {(role === "directeur" || canEdit) && (
                                            <>
                                                <button style={{...btnEdit, marginRight:"5px"}} onClick={() => preparerModification(c)}>{t("✏️ Éditer")}</button>
                                                <button style={btnDelete} onClick={() => supprimerClient(c)}>{t("🗑️ Supprimer")}</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Styles partagés (similaires à Home.js pour maintenir la cohérence de l'ERP)
const container = { display: "flex", flexDirection: "column", gap: "20px" };
const pageHeader = { display: "flex", alignItems: "baseline", gap: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" };
const infoBanner = { backgroundColor: "#d9edf7", color: "#31708f", padding: "15px", borderRadius: "4px", border: "1px solid #bce8f1", fontSize: "14px" };
const panel = { backgroundColor: "white", borderTop: "3px solid #d2d6de", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderRadius: "3px" };
const panelHeader = { padding: "12px 15px", borderBottom: "1px solid #f4f4f4", fontSize: "16px", fontWeight: "bold", color: "#444" };
const panelBody = { padding: "20px" };
const table = { width: "100%", borderCollapse: "collapse" };
const th = { backgroundColor: "#f9f9f9", padding: "12px", borderBottom: "2px solid #ddd", textAlign: "left", fontSize: "13px", color: "#555", fontWeight:"bold" };
const td = { padding: "12px", borderBottom: "1px solid #f4f4f4", fontSize: "14px", color: "#333", verticalAlign: "middle" };
const btnEdit = { backgroundColor: "#f39c12", color: "white", border: "none", padding: "6px 12px", borderRadius: "3px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" };
const btnDelete = { backgroundColor: "#dd4b39", color: "white", border: "none", padding: "6px 12px", borderRadius: "3px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" };
const label = { display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "13px", color: "#555" };
const input = { width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "3px", fontSize: "14px", boxSizing: "border-box" };
const inputGroup = { flex: "1 1 200px", minWidth: "200px" };
const btnSave = { backgroundColor: "#3c8dbc", color: "white", border: "none", padding: "10px 20px", borderRadius: "3px", cursor: "pointer", fontWeight: "bold" };
const btnCancel = { backgroundColor: "#f4f4f4", color: "#444", border: "1px solid #ddd", padding: "10px 20px", borderRadius: "3px", cursor: "pointer", fontWeight: "bold" };

export default CRM;
