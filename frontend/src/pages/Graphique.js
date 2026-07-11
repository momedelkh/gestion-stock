import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function Graphique() {
    const API = process.env.REACT_APP_API_URL || "https://gestion-stock-de-mon-entreprise.onrender.com";
    const entreprise = localStorage.getItem("entreprise") || "L'Entreprise";
    const [produits, setProduits] = useState([]);

    useEffect(() => {
        fetch(`${API}/produits?entreprise=${encodeURIComponent(entreprise)}`)
            .then(res => res.json())
            .then(data => setProduits(data));
    }, []);

    const dataChart = produits.map(p => ({ nom: p.nom, stock: Number(p.quantite) }));

    return (
        <div style={container}>
            <div style={pageHeader}>
                <h2 style={{ margin: 0, fontWeight: "normal", color: "#333" }}>📈 Évolution du Stock</h2>
                <span style={{color: "#777", fontSize: "14px"}}>Analyse graphique des données</span>
            </div>

            <div style={panel}>
                <div style={panelHeader}>📊 Représentation du Stock par Produit</div>
                <div style={panelBody}>
                    {dataChart.length > 0 ? (
                        <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer>
                                <BarChart data={dataChart}>
                                    <XAxis dataKey="nom" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="stock" fill="#3c8dbc" barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p style={{textAlign:"center", color:"#999", padding:"50px 0"}}>Aucune donnée enregistrée au système.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

/* 🎨 STYLES EN LIGNE */

const container = { display: "flex", flexDirection: "column", gap: "20px" };
const pageHeader = { display: "flex", alignItems: "baseline", gap: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" };
const panel = { backgroundColor: "white", borderTop: "3px solid #3c8dbc", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderRadius: "3px" };
const panelHeader = { padding: "12px 15px", borderBottom: "1px solid #f4f4f4", fontSize: "16px", fontWeight: "bold", color: "#444" };
const panelBody = { padding: "30px" };

export default Graphique;
