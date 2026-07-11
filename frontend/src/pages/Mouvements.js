import React, { useEffect, useState } from "react";

function Mouvements() {
    const API = process.env.REACT_APP_API_URL || "https://gestion-stock-de-mon-entreprise.onrender.com";
    const [logs, setLogs] = useState([]);
    const [filtre, setFiltre] = useState("tous");
    const [recherche, setRecherche] = useState("");
    const role = localStorage.getItem("role") || "directeur";

    const fetchLogs = () => {
        fetch(`${API}/logs`)
            .then(res => res.json())
            .then(data => setLogs(data.reverse()))
            .catch(() => setLogs([]));
    };

    useEffect(() => { fetchLogs(); }, []);

    // Détecter le type de mouvement depuis le texte de l'action
    const detecterType = (log) => {
        if (log.type && log.type !== "action") return log.type;
        const action = (log.action || "").toLowerCase();
        if (action.includes("référencé") || action.includes("ajout") || action.includes("créé")) return "entree";
        if (action.includes("panier") || action.includes("encaiss") || action.includes("vente") || action.includes("vendu")) return "vente";
        if (action.includes("supprim")) return "suppression";
        if (action.includes("modif") || action.includes("édité")) return "modification";
        if (action.includes("csv") || action.includes("export")) return "export";
        return "action";
    };

    const getBadgeStyle = (type) => {
        const styles = {
            entree:       { backgroundColor: "#00a65a", color: "white" },
            vente:        { backgroundColor: "#3c8dbc", color: "white" },
            sortie:       { backgroundColor: "#dd4b39", color: "white" },
            suppression:  { backgroundColor: "#dd4b39", color: "white" },
            modification: { backgroundColor: "#f39c12", color: "white" },
            export:       { backgroundColor: "#605ca8", color: "white" },
            action:       { backgroundColor: "#555", color: "white" },
        };
        return { ...badgeBase, ...(styles[type] || styles.action) };
    };

    const getLabelType = (type) => {
        const labels = {
            entree:       "⬆ Entrée",
            vente:        "💸 Vente",
            sortie:       "⬇ Sortie",
            suppression:  "🗑 Suppression",
            modification: "✏️ Modification",
            export:       "📤 Export",
            action:       "🔧 Action",
        };
        return labels[type] || "🔧 Action";
    };

    const logsFiltres = logs.filter(log => {
        const type = detecterType(log);
        const matchFiltre = filtre === "tous" || type === filtre;
        const matchRecherche = !recherche ||
            (log.action || "").toLowerCase().includes(recherche.toLowerCase()) ||
            (log.user || "").toLowerCase().includes(recherche.toLowerCase());
        return matchFiltre && matchRecherche;
    });

    const exportPDFMouvements = () => {
        const dateExport = new Date().toLocaleString("fr-FR");
        const user = localStorage.getItem("user") || "Système";

        let lignesHTML = "";
        logsFiltres.forEach(log => {
            const type = detecterType(log);
            const label = getLabelType(type);
            const couleur = {
                entree: "#00a65a", vente: "#3c8dbc", sortie: "#dd4b39",
                suppression: "#dd4b39", modification: "#f39c12", export: "#605ca8", action: "#555"
            }[type] || "#555";
            lignesHTML += `
                <tr>
                    <td>${new Date(log.date).toLocaleDateString("fr-FR")} ${new Date(log.date).toLocaleTimeString("fr-FR", {hour:"2-digit", minute:"2-digit"})}</td>
                    <td><span style="background:${couleur};color:white;padding:2px 8px;border-radius:10px;font-size:11px;">${label}</span></td>
                    <td>${log.user || "Système"}</td>
                    <td>${log.action || ""}</td>
                </tr>`;
        });

        const win = window.open("", "_blank");
        if (!win) { alert("Pop-up bloqué."); return; }
        win.document.write(`
            <html><head><title>Rapport Mouvements de Stock</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 30px; color: #333; }
                h1 { color: #3c8dbc; border-bottom: 2px solid #3c8dbc; padding-bottom: 10px; }
                .meta { color: #777; font-size: 13px; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 13px; }
                th { background: #3c8dbc; color: white; padding: 10px; text-align: left; }
                td { padding: 9px 10px; border-bottom: 1px solid #eee; }
                tr:nth-child(even) { background: #f9f9f9; }
                .footer { margin-top: 30px; font-size: 11px; color: #aaa; text-align: center; }
                @media print { body { margin: 10px; } }
            </style></head>
            <body>
                <h1>📋 Rapport des Mouvements de Stock</h1>
                <div class="meta">Généré le : ${dateExport} &nbsp;|&nbsp; Par : ${user} &nbsp;|&nbsp; Total : ${logsFiltres.length} enregistrement(s)</div>
                <table>
                    <thead><tr><th>DATE &amp; HEURE</th><th>TYPE</th><th>UTILISATEUR</th><th>ACTION DÉTAILLÉE</th></tr></thead>
                    <tbody>${lignesHTML}</tbody>
                </table>
                <div class="footer">Application ERP — Gestion de Stock — Document généré automatiquement</div>
                <script>window.onload = () => window.print();<\/script>
            </body></html>
        `);
        win.document.close();
    };

    const statsParType = ["entree", "vente", "sortie", "suppression", "modification"].map(type => ({
        type,
        label: getLabelType(type),
        count: logs.filter(l => detecterType(l) === type).length
    }));

    return (
        <div style={container}>
            <div style={pageHeader}>
                <h2 style={{ margin: 0, fontWeight: "normal", color: "#333" }}>📋 Mouvements de Stock</h2>
                <span style={{ color: "#777", fontSize: "14px" }}>Traçabilité complète — Audit Trail professionnel</span>
            </div>

            {/* KPI MINI */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {statsParType.map(s => (
                    <div key={s.type} style={{ ...miniCard, ...getBadgeStyle(s.type), minWidth: "130px" }}>
                        <div style={{ fontSize: "22px", fontWeight: "bold" }}>{s.count}</div>
                        <div style={{ fontSize: "11px", marginTop: "3px" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={panel}>
                <div style={{ ...panelHeader, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <span>📊 Journal des Mouvements ({logsFiltres.length} entrées)</span>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                        <input
                            style={inputInline}
                            placeholder="🔍 Rechercher..."
                            value={recherche}
                            onChange={e => setRecherche(e.target.value)}
                        />
                        <select style={inputInline} value={filtre} onChange={e => setFiltre(e.target.value)}>
                            <option value="tous">Tous les types</option>
                            <option value="entree">⬆ Entrées</option>
                            <option value="vente">💸 Ventes</option>
                            <option value="sortie">⬇ Sorties</option>
                            <option value="modification">✏️ Modifications</option>
                            <option value="suppression">🗑 Suppressions</option>
                            <option value="export">📤 Exports</option>
                        </select>
                        {role === "directeur" && (
                            <button style={btnPDF} onClick={exportPDFMouvements}>
                                🖨️ Exporter PDF
                            </button>
                        )}
                        <button style={btnRefresh} onClick={fetchLogs}>🔄 Actualiser</button>
                    </div>
                </div>

                <div style={panelBody}>
                    <div className="table-responsive">
                    <table style={table}>
                        <thead>
                            <tr>
                                <th style={th}>DATE &amp; HEURE</th>
                                <th style={th}>TYPE DE MOUVEMENT</th>
                                <th style={th}>UTILISATEUR RESPONSABLE</th>
                                <th style={th}>DÉTAIL DE L'ACTION</th>
                                <th style={th}>PRODUIT CONCERNÉ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logsFiltres.map(log => {
                                const type = detecterType(log);
                                return (
                                    <tr key={log.id}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = "#f4f6f9"}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
                                        style={{ transition: "background 0.15s" }}>
                                        <td style={td}>
                                            <div style={{ fontWeight: "bold", color: "#333" }}>
                                                {new Date(log.date).toLocaleDateString("fr-FR")}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#888" }}>
                                                {new Date(log.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                            </div>
                                        </td>
                                        <td style={td}>
                                            <span style={getBadgeStyle(type)}>{getLabelType(type)}</span>
                                        </td>
                                        <td style={td}>
                                            <div style={{ fontWeight: "bold" }}>{log.user}</div>
                                            <div style={{ fontSize: "11px", color: "#888" }}>Employé système</div>
                                        </td>
                                        <td style={td}>{log.action}</td>
                                        <td style={td}>
                                            {log.produit ? (
                                                <span style={{ color: "#3c8dbc", fontWeight: "bold" }}>{log.produit}</span>
                                            ) : (
                                                <span style={{ color: "#bbb", fontSize: "12px" }}>—</span>
                                            )}
                                            {log.quantite && (
                                                <div style={{ fontSize: "12px", color: "#888" }}>Qté : {log.quantite}</div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {logsFiltres.length === 0 && (
                                <tr><td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
                                    Aucun mouvement enregistré pour ce filtre.
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

const container = { display: "flex", flexDirection: "column", gap: "20px" };
const pageHeader = { display: "flex", alignItems: "baseline", gap: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" };
const panel = { backgroundColor: "white", borderTop: "3px solid #3c8dbc", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderRadius: "3px" };
const panelHeader = { padding: "12px 15px", borderBottom: "1px solid #f4f4f4", fontSize: "15px", fontWeight: "bold", color: "#444" };
const panelBody = { padding: "0" };
const table = { width: "100%", borderCollapse: "collapse" };
const th = { backgroundColor: "#f9f9f9", padding: "12px 14px", borderBottom: "2px solid #ddd", textAlign: "left", fontSize: "12px", color: "#555", fontWeight: "bold", textTransform: "uppercase" };
const td = { padding: "12px 14px", borderBottom: "1px solid #f4f4f4", fontSize: "14px", color: "#333", verticalAlign: "middle" };
const badgeBase = { padding: "4px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", display: "inline-block", whiteSpace: "nowrap" };
const miniCard = { borderRadius: "5px", padding: "12px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", textAlign: "center" };
const inputInline = { padding: "7px 10px", border: "1px solid #d2d6de", outline: "none", fontSize: "13px", borderRadius: "2px" };
const btnPDF = { backgroundColor: "#dd4b39", color: "white", border: "none", padding: "7px 14px", borderRadius: "2px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" };
const btnRefresh = { backgroundColor: "#3c8dbc", color: "white", border: "none", padding: "7px 14px", borderRadius: "2px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" };

export default Mouvements;
