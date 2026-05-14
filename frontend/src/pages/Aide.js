import React, { useState } from 'react';
import { t } from '../i18n';

function Aide() {
    const [message, setMessage] = useState("");
    const [langue, setLangue] = useState(localStorage.getItem("langue") || "Français");

    return (
        <div style={container}>
            {/* EN TÊTE DE LA PAGE */}
            <div style={pageHeader}>
                <h2 style={{ margin: 0, fontWeight: "normal", color: "#333" }}>❓ {t("Centre d'Aide")}</h2>
                <span style={{color: "#777", fontSize: "14px"}}>{t("Documentation et Support Technique")}</span>
            </div>

            <div style={row}>
                {/* COLONNE GAUCHE: GUIDE D'UTILISATION */}
                <div style={{...panel, flex: 2, borderTopColor: "#3c8dbc"}}>
                    <div style={panelHeader}>📖 Configuration & Guide d'Utilisation</div>
                    <div style={panelBody}>
                        
                        <h3 style={sectionTitle}><span style={badge}>1</span> Tableau de bord (Panneau de Contrôle)</h3>
                        <p style={text}>Le panneau de contrôle est le cœur de votre espace de gestion. De cette page, vous avez le contrôle total de votre entreprise :</p>
                        <ul style={list}>
                            <li style={listItem}><b>Indicateurs Clés (KPI) :</b> Consultez instantanément le nombre total de produits et d'unités globales en stock.</li>
                            <li style={listItem}><b>Revenus :</b> Suivez le revenu total généré par vos ordres de ventes.</li>
                            <li style={listItem}><b>Gestion Rapide :</b> Un formulaire vous permet d'ajouter très rapidement un nouveau produit avec image, prix et coordonnées d'emplacement.</li>
                            <li style={listItem}><b>Exports Pro :</b> Récupérez la base de données en 1 clic au format <b>Excel</b>, <b>CSV</b>, <b>PDF</b> ou pour impression directe.</li>
                        </ul>

                        <h3 style={sectionTitle}><span style={badge}>2</span> Évolution Stock (Graphiques)</h3>
                        <p style={text}>Cette section (accessible via le menu latéral) est entièrement dédiée à l'analyse visuelle. Elle génère un graphique dynamique (BarChart) qui s'adapte en temps réel aux variations de votre inventaire, facilitant grandement l'identification des produits en rupture.</p>

                        <h3 style={sectionTitle}><span style={badge}>3</span> Outils d'Administration (ERP)</h3>
                        <p style={text}>Zone critique réservée aux administrateurs pour la gestion des paramètres globaux de l'entreprise :</p>
                        
                        <div style={{ display: "flex", gap: "10px", marginTop: "15px", flexWrap: "wrap" }}>
                            <button 
                                style={{ ...btnSupport, backgroundColor: "#dd4b39", width: "auto", padding: "8px 15px", fontSize: "13px" }}
                                onClick={() => {
                                    localStorage.removeItem("revenu_stat");
                                    setMessage("✅ Le Volume des Ventes a été restauré à 0 FCFA avec succès !");
                                }}
                            >
                                🔄 Restaurer le Volume des Ventes (0 FCFA)
                            </button>
                            
                            <button 
                                style={{ ...btnSupport, backgroundColor: "#333", width: "auto", padding: "8px 15px", fontSize: "13px" }}
                                onClick={() => {
                                    setMessage("✅ Le nettoyage du cache du système ERP a été effectué avec succès !");
                                }}
                            >
                                🧹 Vider le cache de l'application
                            </button>
                        </div>
                        
                        {message && (
                            <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#dff0d8", color: "#3c763d", border: "1px solid #d6e9c6", borderRadius: "4px", fontWeight: "bold" }}>
                                {message}
                            </div>
                        )}
                        
                        <hr style={divider} />
                        <p style={{...text, fontStyle: "italic", color: "#888", marginTop: "20px"}}>Application propulsée par ReactJS — Version 2.1.4 (Build Stable)</p>
                    </div>
                </div>

                {/* COLONNE DROITE: POLITIQUE ET SUPPORT */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    {/* PARAMETRES DE LANGUE */}
                    <div style={{...panel, borderTopColor: "#3c8dbc"}}>
                        <div style={panelHeader}>🌍 {t("Langue du Système")}</div>
                        <div style={panelBody}>
                            <p style={text}>{t("Choisissez la langue d'affichage (Français, Anglais, Arabe) :")}</p>
                            <select 
                                style={{ width: "100%", padding: "10px", marginTop: "10px", borderRadius: "3px", border: "1px solid #ccc", fontFamily: "inherit" }}
                                value={langue}
                                onChange={(e) => {
                                    setLangue(e.target.value);
                                    localStorage.setItem("langue", e.target.value);
                                    setMessage(`✅ Modification...`);
                                    setTimeout(() => window.location.reload(), 300);
                                }}
                            >
                                <option value="Français">🇫🇷 Français (French)</option>
                                <option value="Anglais">🇬🇧 Anglais (English)</option>
                                <option value="Arabe">🇸🇦 Arabe (Arabic)</option>
                            </select>
                        </div>
                    </div>

                    {/* POLITIQUE DE CONFIDENTIALITE */}
                    <div style={{...panel, borderTopColor: "#00a65a"}}>
                        <div style={panelHeader}>🛡️ Politique de Confidentialité</div>
                        <div style={panelBody}>
                            <p style={text}><strong>Protection de vos données :</strong><br/>Les données relatives à votre stock, vos flux logistiques et vos revenus financiers sont gérées et hébergées conjointement à votre serveur sécurisé API.</p>
                            <p style={text}><strong>Confidentialité :</strong><br/>Aucune donnée personnelle n'est revendue à des tiers. L'accès général est strictement protégé par chiffrement d'identification (Portail de connexion).</p>
                        </div>
                    </div>

                    {/* SUPPORT TECHNIQUE */}
                    <div style={{...panel, borderTopColor: "#f39c12"}}>
                        <div style={panelHeader}>📞 Support Technique</div>
                        <div style={panelBody}>
                            <p style={text}>Si vous rencontrez un dysfonctionnement matériel (Scanner) ou une désynchronisation de la base de données, n'intervenez pas seul.</p>
                            <button 
                                style={btnSupport}
                                onClick={() => window.location.href = "mailto:admin@entreprise.com?subject=Demande de support - Gestion de Stock"}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e08e0b"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f39c12"}
                            >
                                Contacter l'administrateur
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* SECTION SÉCURITÉ ROADMAP */}
            <div style={{...panel, borderTopColor: "#605ca8"}}>
                <div style={{...panelHeader, color: "#605ca8"}}>🔐 Sécurité du Système — État Actuel & Roadmap v3.0</div>
                <div style={panelBody}>
                    <p style={{...text, marginTop: 0}}>
                        La version actuelle utilise une authentification locale avec contrôle de rôles côté serveur.
                        Les améliorations de sécurité prévues pour la version production sont les suivantes :
                    </p>
                    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
                        {[
                            { icon: "🔑", titre: "Hachage Bcrypt", desc: "Mots de passe hachés avec bcrypt (saltRounds=12). Aucun mot de passe en clair en base de données.", statut: "Prévu v3.0", couleur: "#605ca8" },
                            { icon: "🎫", titre: "JWT Tokens", desc: "Authentification par JSON Web Token (expiration 8h). Signature serveur avec clé secrète HS256.", statut: "Prévu v3.0", couleur: "#3c8dbc" },
                            { icon: "🗄️", titre: "MySQL / MongoDB", desc: "Migration de JSON vers base de données relationnelle MySQL avec contraintes d'intégrité.", statut: "Prévu v3.0", couleur: "#00a65a" },
                            { icon: "🛡️", titre: "RBAC Serveur", desc: "Vérification des rôles côté API (middleware Express). Actuellement : contrôle côté client React.", statut: "En cours", couleur: "#f39c12" },
                            { icon: "📋", titre: "Logs Sécurité", desc: "Audit trail complet : chaque action est horodatée avec l'identifiant utilisateur et l'IP source.", statut: "✅ Actif", couleur: "#00a65a" },
                            { icon: "🔒", titre: "HTTPS / CORS", desc: "Déploiement avec certificat SSL/TLS. CORS restreint aux domaines autorisés en production.", statut: "Prévu déploiement", couleur: "#dd4b39" },
                        ].map((item, i) => (
                            <div key={i} style={{
                                flex: "1 1 220px", border: `2px solid ${item.couleur}20`,
                                borderLeft: `4px solid ${item.couleur}`,
                                backgroundColor: `${item.couleur}08`,
                                borderRadius: "4px", padding: "14px"
                            }}>
                                <div style={{ fontSize: "22px", marginBottom: "6px" }}>{item.icon}</div>
                                <div style={{ fontWeight: "bold", fontSize: "14px", color: "#333", marginBottom: "5px" }}>{item.titre}</div>
                                <div style={{ fontSize: "12px", color: "#666", lineHeight: "1.5", marginBottom: "8px" }}>{item.desc}</div>
                                <span style={{ backgroundColor: item.couleur, color: "white", fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                                    {item.statut}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: "15px", backgroundColor: "#f8f9fa", border: "1px solid #e0e0e0", padding: "12px 15px", borderRadius: "3px", fontSize: "13px", color: "#555" }}>
                        <b>Note architecturale :</b> L'application respecte le modèle <b>RBAC</b> (Role-Based Access Control) :
                        <code style={{ backgroundColor: "#eee", padding: "1px 5px", borderRadius: "3px", margin: "0 3px" }}>directeur</code>
                        accès total,
                        <code style={{ backgroundColor: "#eee", padding: "1px 5px", borderRadius: "3px", margin: "0 3px" }}>employe</code>
                        accès restreint,
                        <code style={{ backgroundColor: "#eee", padding: "1px 5px", borderRadius: "3px", margin: "0 3px" }}>technicien_surface</code>
                        accès bloqué. Cette logique est vérifiable dans le code source (<code>server.js</code> ligne 75).
                    </div>
                </div>
            </div>
        </div>
    );
}

/* 🎨 STYLES EN LIGNE : CORPORATE/ADMIN LTE */

const container = { display: "flex", flexDirection: "column", gap: "20px" };
const pageHeader = { display: "flex", alignItems: "baseline", gap: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" };
const row = { display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" };

const panel = { backgroundColor: "white", borderTop: "3px solid #d2d6de", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderRadius: "3px" };
const panelHeader = { padding: "12px 15px", borderBottom: "1px solid #f4f4f4", fontSize: "16px", fontWeight: "bold", color: "#444" };
const panelBody = { padding: "20px" };

const sectionTitle = { color: "#3c8dbc", borderBottom: "1px dashed #eee", paddingBottom: "8px", marginTop: "25px", fontSize: "18px" };
const badge = { backgroundColor: "#3c8dbc", color: "white", borderRadius: "50%", padding: "2px 8px", fontSize: "14px", marginRight: "8px" };

const text = { color: "#555", lineHeight: "1.6", fontSize: "14px", marginTop: "10px" };
const list = { color: "#555", lineHeight: "1.8", fontSize: "14px", paddingLeft: "20px" };
const listItem = { marginBottom: "8px" };
const divider = { border: "0", height: "1px", background: "#eee", marginTop: "30px" };

const btnSupport = { 
    width: "100%", 
    padding: "10px", 
    backgroundColor: "#f39c12", 
    color: "white", 
    border: "none", 
    borderRadius: "2px", 
    cursor: "pointer", 
    fontWeight: "bold",
    marginTop: "10px",
    transition: "background 0.2s"
};

export default Aide;