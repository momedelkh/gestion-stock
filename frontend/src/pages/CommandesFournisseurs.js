import React, { useEffect, useState } from "react";

function CommandesFournisseurs() {
    const API = process.env.REACT_APP_API_URL || "https://gestion-stock-de-mon-entreprise.onrender.com";
    const role = localStorage.getItem("role") || "directeur";

    const [commandes, setCommandes] = useState([]);
    const [produits, setProduits] = useState([]);

    // Formulaire
    const [fournisseur, setFournisseur] = useState("");
    const [produitNom, setProduitNom] = useState("");
    const [quantite, setQuantite] = useState("");
    const [prixUnitaire, setPrixUnitaire] = useState("");
    const [notes, setNotes] = useState("");
    const [editId, setEditId] = useState(null);
    const [filtreStatut, setFiltreStatut] = useState("tous");

    const fetchCommandes = () => {
        fetch(`${API}/commandes`)
            .then(res => res.json())
            .then(data => setCommandes(data.reverse()))
            .catch(() => setCommandes([]));
    };

    const fetchProduits = () => {
        fetch(`${API}/produits`)
            .then(res => res.json())
            .then(data => setProduits(data))
            .catch(() => setProduits([]));
    };

    useEffect(() => { fetchCommandes(); fetchProduits(); }, []);

    const creerCommande = () => {
        if (!fournisseur.trim() || !produitNom.trim() || !quantite) {
            alert("Veuillez remplir : Fournisseur, Produit et Quantité.");
            return;
        }
        const montantTotal = Number(prixUnitaire || 0) * Number(quantite);
        fetch(`${API}/commandes/ajouter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fournisseur, produit: produitNom, quantite: Number(quantite),
                prixUnitaire: Number(prixUnitaire || 0), montantTotal,
                notes, creePar: localStorage.getItem("user") || "Système"
            })
        }).then(() => { fetchCommandes(); resetForm(); });
    };

    const changerStatut = (cmd, nouveauStatut) => {
        fetch(`${API}/commandes/modifier/${cmd.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statut: nouveauStatut, dateMaj: new Date().toISOString() })
        }).then(() => fetchCommandes());
    };

    const supprimerCommande = (id) => {
        if (window.confirm("Supprimer cette commande fournisseur ?")) {
            fetch(`${API}/commandes/supprimer/${id}`).then(() => fetchCommandes());
        }
    };

    const resetForm = () => {
        setFournisseur(""); setProduitNom(""); setQuantite("");
        setPrixUnitaire(""); setNotes(""); setEditId(null);
    };

    const exportPDFCommandes = () => {
        const dateExport = new Date().toLocaleString("fr-FR");
        const user = localStorage.getItem("user") || "Système";
        const commandesFiltrees = getCommandesFiltrees();

        let lignesHTML = "";
        commandesFiltrees.forEach(cmd => {
            const couleurStatut = { "En attente": "#f39c12", "Confirmée": "#3c8dbc", "Livrée": "#00a65a", "Annulée": "#dd4b39" }[cmd.statut] || "#aaa";
            lignesHTML += `
                <tr>
                    <td>CMD-${String(cmd.id).slice(-6)}</td>
                    <td>${new Date(cmd.dateCreation).toLocaleDateString("fr-FR")}</td>
                    <td><b>${cmd.fournisseur}</b></td>
                    <td>${cmd.produit}</td>
                    <td style="text-align:center">${cmd.quantite}</td>
                    <td style="text-align:right">${Number(cmd.prixUnitaire||0).toLocaleString()} FCFA</td>
                    <td style="text-align:right"><b>${Number(cmd.montantTotal||0).toLocaleString()} FCFA</b></td>
                    <td><span style="background:${couleurStatut};color:white;padding:2px 8px;border-radius:10px;font-size:11px;">${cmd.statut}</span></td>
                </tr>`;
        });

        const totalMontant = commandesFiltrees.reduce((s, c) => s + Number(c.montantTotal || 0), 0);

        const win = window.open("", "_blank");
        if (!win) { alert("Pop-up bloqué."); return; }
        win.document.write(`
            <html><head><title>Rapport Commandes Fournisseurs</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 30px; color: #333; font-size: 13px; }
                h1 { color: #f39c12; border-bottom: 3px solid #f39c12; padding-bottom: 8px; }
                .meta { color: #777; font-size: 12px; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th { background: #f39c12; color: white; padding: 9px; text-align: left; }
                td { padding: 8px 9px; border-bottom: 1px solid #eee; }
                tr:nth-child(even) { background: #fff8f0; }
                .total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 20px; color: #f39c12; }
                .footer { margin-top: 30px; font-size: 11px; color: #aaa; text-align: center; }
                @media print { body { margin: 10px; } }
            </style></head>
            <body>
                <h1>📦 Rapport des Commandes Fournisseurs</h1>
                <div class="meta">Généré le : ${dateExport} &nbsp;|&nbsp; Par : ${user} &nbsp;|&nbsp; ${commandesFiltrees.length} commande(s)</div>
                <table>
                    <thead><tr><th>N° CMD</th><th>DATE</th><th>FOURNISSEUR</th><th>PRODUIT</th><th>QTÉ</th><th>PRIX U.</th><th>MONTANT</th><th>STATUT</th></tr></thead>
                    <tbody>${lignesHTML}</tbody>
                </table>
                <div class="total">TOTAL COMMANDES : ${totalMontant.toLocaleString()} FCFA</div>
                <div class="footer">Application ERP — Gestion de Stock — Rapport auto-généré</div>
                <script>window.onload = () => window.print();<\/script>
            </body></html>
        `);
        win.document.close();
    };

    const getCommandesFiltrees = () => {
        if (filtreStatut === "tous") return commandes;
        return commandes.filter(c => c.statut === filtreStatut);
    };

    const commandesFiltrees = getCommandesFiltrees();

    const statuts = ["En attente", "Confirmée", "Livrée", "Annulée"];
    const statutColors = { "En attente": "#f39c12", "Confirmée": "#3c8dbc", "Livrée": "#00a65a", "Annulée": "#dd4b39" };

    // KPIs
    const totalCommandes = commandes.length;
    const totalEnAttente = commandes.filter(c => c.statut === "En attente").length;
    const totalLivrees = commandes.filter(c => c.statut === "Livrée").length;
    const montantTotal = commandes.filter(c => c.statut !== "Annulée").reduce((s, c) => s + Number(c.montantTotal || 0), 0);

    // Fournisseurs uniques depuis produits pour autocomplétion
    const fournisseursConnus = [...new Set(produits.map(p => p.fournisseur).filter(Boolean))];
    const produitsConnus = [...new Set(produits.map(p => p.nom).filter(Boolean))];

    return (
        <div style={container}>
            <div style={pageHeader}>
                <h2 style={{ margin: 0, fontWeight: "normal", color: "#333" }}>📦 Commandes Fournisseurs</h2>
                <span style={{ color: "#777", fontSize: "14px" }}>Gestion des approvisionnements et des achats</span>
            </div>

            {/* KPIs */}
            <div className="stats-container" style={{ display: "flex", gap: "15px" }}>
                <div style={{ ...kpiCard, backgroundColor: "#3c8dbc" }}>
                    <div style={kpiNum}>{totalCommandes}</div>
                    <div style={kpiLabel}>Total Commandes</div>
                </div>
                <div style={{ ...kpiCard, backgroundColor: "#f39c12" }}>
                    <div style={kpiNum}>{totalEnAttente}</div>
                    <div style={kpiLabel}>En Attente</div>
                </div>
                <div style={{ ...kpiCard, backgroundColor: "#00a65a" }}>
                    <div style={kpiNum}>{totalLivrees}</div>
                    <div style={kpiLabel}>Livrées</div>
                </div>
                <div style={{ ...kpiCard, backgroundColor: "#605ca8" }}>
                    <div style={kpiNum}>{montantTotal.toLocaleString()}</div>
                    <div style={{ ...kpiLabel, fontSize: "10px" }}>FCFA Engagé</div>
                </div>
            </div>

            {/* Formulaire de création */}
            {role === "directeur" && (
                <div style={{ ...panel, borderTopColor: "#00a65a" }}>
                    <div style={panelHeader}>➕ Créer une Commande Fournisseur</div>
                    <div style={{ ...panelBody, display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div className="form-row" style={{ display: "flex", gap: "12px" }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Fournisseur *</label>
                                <input list="fournisseurs-list" style={input} placeholder="Nom du fournisseur"
                                    value={fournisseur} onChange={e => setFournisseur(e.target.value)} />
                                <datalist id="fournisseurs-list">
                                    {fournisseursConnus.map(f => <option key={f} value={f} />)}
                                </datalist>
                            </div>
                            <div style={{ flex: 2 }}>
                                <label style={labelStyle}>Produit à commander *</label>
                                <input list="produits-list" style={input} placeholder="Nom du produit"
                                    value={produitNom} onChange={e => setProduitNom(e.target.value)} />
                                <datalist id="produits-list">
                                    {produitsConnus.map(p => <option key={p} value={p} />)}
                                </datalist>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Quantité *</label>
                                <input style={input} type="number" placeholder="Quantité"
                                    value={quantite} onChange={e => setQuantite(e.target.value)} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Prix Unitaire (FCFA)</label>
                                <input style={input} type="number" placeholder="0"
                                    value={prixUnitaire} onChange={e => setPrixUnitaire(e.target.value)} />
                            </div>
                        </div>
                        <div className="form-row" style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                            <div style={{ flex: 3 }}>
                                <label style={labelStyle}>Notes / Instructions</label>
                                <input style={input} placeholder="Délai souhaité, conditions, remarques..."
                                    value={notes} onChange={e => setNotes(e.target.value)} />
                            </div>
                            {prixUnitaire && quantite && (
                                <div style={{ flex: 1, padding: "10px", backgroundColor: "#f0f8ff", border: "1px solid #3c8dbc", borderRadius: "3px", textAlign: "center" }}>
                                    <div style={{ fontSize: "11px", color: "#666" }}>Montant estimé</div>
                                    <div style={{ fontWeight: "bold", color: "#3c8dbc", fontSize: "16px" }}>
                                        {(Number(prixUnitaire) * Number(quantite)).toLocaleString()} FCFA
                                    </div>
                                </div>
                            )}
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button style={btnSuccess} onClick={creerCommande}>✅ Enregistrer</button>
                                <button style={btnDefault} onClick={resetForm}>Vider</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Liste des commandes */}
            <div style={{ ...panel, borderTopColor: "#f39c12" }}>
                <div style={{ ...panelHeader, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <span>📋 Registre des Commandes ({commandesFiltrees.length})</span>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <select style={selectInline} value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
                            <option value="tous">Tous les statuts</option>
                            {statuts.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {role === "directeur" && (
                            <button style={btnPDF} onClick={exportPDFCommandes}>🖨️ Exporter PDF</button>
                        )}
                    </div>
                </div>
                <div style={panelBody}>
                    <div className="table-responsive">
                    <table style={table}>
                        <thead>
                            <tr>
                                <th style={th}>N° COMMANDE</th>
                                <th style={th}>DATE</th>
                                <th style={th}>FOURNISSEUR</th>
                                <th style={th}>PRODUIT</th>
                                <th style={{ textAlign: "center", ...th }}>QTÉ</th>
                                <th style={{ textAlign: "right", ...th }}>MONTANT</th>
                                <th style={{ textAlign: "center", ...th }}>STATUT</th>
                                {role === "directeur" && <th style={{ textAlign: "right", ...th }}>ACTIONS</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {commandesFiltrees.map(cmd => (
                                <tr key={cmd.id}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = "#fffbf0"}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
                                    style={{ transition: "background 0.15s" }}>
                                    <td style={td}>
                                        <span style={{ fontFamily: "monospace", color: "#555", fontSize: "12px" }}>
                                            CMD-{String(cmd.id).slice(-6)}
                                        </span>
                                    </td>
                                    <td style={td}>
                                        <div>{new Date(cmd.dateCreation).toLocaleDateString("fr-FR")}</div>
                                        <div style={{ fontSize: "11px", color: "#888" }}>par {cmd.creePar}</div>
                                    </td>
                                    <td style={td}><b>{cmd.fournisseur}</b></td>
                                    <td style={td}>
                                        {cmd.produit}
                                        {cmd.notes && <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{cmd.notes}</div>}
                                    </td>
                                    <td style={{ textAlign: "center", ...td }}>
                                        <span style={{ fontWeight: "bold", fontSize: "16px", color: "#333" }}>{cmd.quantite}</span>
                                    </td>
                                    <td style={{ textAlign: "right", ...td }}>
                                        {cmd.montantTotal > 0 ? (
                                            <span style={{ fontWeight: "bold", color: "#605ca8" }}>
                                                {Number(cmd.montantTotal).toLocaleString()} FCFA
                                            </span>
                                        ) : (
                                            <span style={{ color: "#bbb" }}>—</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: "center", ...td }}>
                                        <span style={{
                                            backgroundColor: statutColors[cmd.statut] || "#aaa",
                                            color: "white", padding: "5px 12px",
                                            borderRadius: "12px", fontSize: "12px", fontWeight: "bold"
                                        }}>
                                            {cmd.statut}
                                        </span>
                                    </td>
                                    {role === "directeur" && (
                                        <td style={{ textAlign: "right", ...td }}>
                                            <select
                                                style={{ ...selectInline, fontSize: "12px", marginRight: "5px" }}
                                                value={cmd.statut}
                                                onChange={e => changerStatut(cmd, e.target.value)}>
                                                {statuts.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <button style={btnDelete} onClick={() => supprimerCommande(cmd.id)}>🗑</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {commandesFiltrees.length === 0 && (
                                <tr><td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
                                    Aucune commande pour ce filtre.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Styles
const container = { display: "flex", flexDirection: "column", gap: "20px" };
const pageHeader = { display: "flex", alignItems: "baseline", gap: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" };
const panel = { backgroundColor: "white", borderTop: "3px solid #d2d6de", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderRadius: "3px" };
const panelHeader = { padding: "12px 15px", borderBottom: "1px solid #f4f4f4", fontSize: "15px", fontWeight: "bold", color: "#444" };
const panelBody = { padding: "18px" };
const table = { width: "100%", borderCollapse: "collapse" };
const th = { backgroundColor: "#f9f9f9", padding: "11px 12px", borderBottom: "2px solid #ddd", textAlign: "left", fontSize: "12px", color: "#555", fontWeight: "bold", textTransform: "uppercase" };
const td = { padding: "11px 12px", borderBottom: "1px solid #f4f4f4", fontSize: "14px", color: "#333", verticalAlign: "middle" };

const kpiCard = { flex: 1, color: "white", borderRadius: "4px", padding: "15px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" };
const kpiNum = { fontSize: "30px", fontWeight: "bold", margin: "0 0 4px 0" };
const kpiLabel = { fontSize: "11px", textTransform: "uppercase", opacity: 0.9 };

const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", color: "#555", marginBottom: "5px" };
const input = { width: "100%", padding: "9px 10px", border: "1px solid #d2d6de", borderRadius: "2px", outline: "none", fontSize: "14px", boxSizing: "border-box" };
const selectInline = { padding: "7px 10px", border: "1px solid #d2d6de", outline: "none", fontSize: "13px", borderRadius: "2px" };

const btn = { border: "none", cursor: "pointer", borderRadius: "3px", padding: "9px 16px", fontWeight: "bold", fontSize: "13px" };
const btnSuccess = { ...btn, backgroundColor: "#00a65a", color: "white" };
const btnDefault = { ...btn, backgroundColor: "#f4f4f4", color: "#444", border: "1px solid #ddd" };
const btnPDF = { ...btn, backgroundColor: "#dd4b39", color: "white", padding: "7px 13px" };
const btnDelete = { backgroundColor: "#dd4b39", color: "white", border: "none", cursor: "pointer", borderRadius: "3px", padding: "5px 10px", fontSize: "13px" };

export default CommandesFournisseurs;
