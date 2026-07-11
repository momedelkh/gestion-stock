import React, { useEffect, useState } from "react";
import { t } from "../i18n";

function Home() {
    const API = process.env.REACT_APP_API_URL || "https://gestion-stock-de-mon-entreprise.onrender.com";

    const [produits, setProduits] = useState([]);
    const [logs, setLogs] = useState([]);
    
    const [alertesManager, setAlertesManager] = useState([]);
    
    // Panier de caisse
    const [panier, setPanier] = useState([]);

    const [nom, setNom] = useState("");
    const [prix, setPrix] = useState("");
    const [prixAchat, setPrixAchat] = useState("");
    const [quantite, setQuantite] = useState("");
    const [emplacement, setEmplacement] = useState("");
    const [categorie, setCategorie] = useState("Général");
    const [fournisseur, setFournisseur] = useState("");
    const [image, setImage] = useState(null);
    const [editId, setEditId] = useState(null);
    const [recherche, setRecherche] = useState("");
    const [filtreCategorie, setFiltreCategorie] = useState("");
    const [revenu, setRevenu] = useState(() => {
        return Number(localStorage.getItem("revenu_stat")) || 0;
    });
    const [benefice, setBenefice] = useState(() => {
        return Number(localStorage.getItem("benefice_stat")) || 0;
    });
    
    // RBAC & Permissions
    const role = localStorage.getItem("role") || "directeur";
    const canEdit = localStorage.getItem("canEdit") === "true";
    
    // Switch affichage entre Tableau Stock et Tableau Historique
    const [onglet, setOnglet] = useState("stock");

    const fetchProduits = () => {
        fetch(`${API}/produits?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => setProduits(data));
    };

    const fetchLogs = () => {
        fetch(`${API}/logs`)
            .then(res => res.json())
            .then(data => setLogs(data.reverse())); 
    };

    const fetchAlertesManager = () => {
        fetch(`${API}/alerts`)
            .then(res => res.json())
            .then(data => setAlertesManager(data ? data.reverse() : []))
            .catch(() => setAlertesManager([]));
    };

    useEffect(() => {
        fetchProduits();
        fetchLogs();
        fetchAlertesManager();
    }, []);

    const logAction = (actionDesc, type = "action", produit = null, quantite = null) => {
        const email = localStorage.getItem("user") || "Inconnu";
        fetch(`${API}/logs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: actionDesc, user: email, type, produit, quantite })
        }).then(() => fetchLogs());
    };

    // SYSTEME DE PANIER & CAISSE
    const ajouterAuPanier = (p) => {
        const dispoActuel = Number(p.quantite);
        
        // Vérifier s'il est déjà dans le panier pour ajuster la dispo réelle
        const itemDejaPanier = panier.find(item => item.id === p.id);
        const dejaPris = itemDejaPanier ? itemDejaPanier.quantite : 0;
        const dispoReelle = dispoActuel - dejaPris;

        if (dispoReelle <= 0) { alert("Stock disponible épuisé par le panier actuel !"); return; }
        
        const qteDemande = window.prompt(`Stock max disponible : ${dispoReelle}.\nCombien d'unités de "${p.nom}" voulez-vous mettre dans le panier ?`, "1");
        if (!qteDemande) return;

        const qteNumerique = Number(qteDemande);
        if (isNaN(qteNumerique) || qteNumerique <= 0) {
            alert("Quantité invalide."); return; 
        }
        if (qteNumerique > dispoReelle) {
            alert(`Stock insuffisant ! Vous disposez de ${dispoReelle} unités restantes.`); return;
        }

        const cleanPrix = String(p.prix).replace(/\s+/g, '').replace(',', '.');
        const prixUnitaireNumerique = Number(cleanPrix.replace(/[^0-9.-]+/g, "")) || 0;
        
        let finalPrix = prixUnitaireNumerique;
        if (canEdit) {
            const prixNego = window.prompt(`Prix de Vente Normal : ${prixUnitaireNumerique} FCFA.\nVoulez-vous négocier/forcer ce prix pour le client ? (Laissez vide pour garder le prix normal)`, "");
            if (prixNego !== null && prixNego.trim() !== "") {
                const pn = Number(prixNego.replace(/[^0-9.-]+/g, ""));
                const prixAchNum = Number(String(p.prixAchat || 0).replace(/[^0-9.-]+/g, "")) || 0;
                
                if (pn <= prixAchNum + 200) {
                    alert(`❌ VENTE INTERDITE !\nMarge insuffisante. Le prix doit être strictement supérieur à ${prixAchNum + 200} FCFA.`);
                    return;
                }
                
                finalPrix = pn;
                if (finalPrix !== prixUnitaireNumerique) {
                    const email = localStorage.getItem("user") || "Inconnu";
                    fetch(`${API}/alerts`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ message: `Vendeur "${email}" a baissé le prix de "${p.nom}" à ${finalPrix} FCFA (au lieu de ${prixUnitaireNumerique} FCFA).` })
                    }).then(() => fetchAlertesManager());
                }
            }
        }

        const sousTotal = finalPrix * qteNumerique;

        if (itemDejaPanier) {
            setPanier(panier.map(item => item.id === p.id ? {
                ...item, 
                quantite: item.quantite + qteNumerique,
                sousTotal: item.sousTotal + sousTotal
            } : item));
        } else {
            setPanier([...panier, { 
                id: p.id, 
                nom: p.nom, 
                prixUnitaire: finalPrix, 
                quantite: qteNumerique, 
                sousTotal: sousTotal,
                pOrigine: p // sauver la ref
            }]);
        }
    };

    const retirerDuPanier = (id) => {
        setPanier(panier.filter(item => item.id !== id));
    };

    const viderPanier = () => {
        if(window.confirm("Annuler et vider le panier en cours ?")) setPanier([]);
    };

    const genererFactureGlobale = (panierFinal, totalPanier) => {
        const emailVendeur = localStorage.getItem("user") || "Inconnu";
        const dateVente = new Date().toLocaleString();
        
        const myWindow = window.open("", "_blank");
        if (!myWindow) { alert("Pop-up bloqué ! Le reçu n'a pas pu s'ouvrir."); return; }
        
        // Liste dynamique des articles HTML
        let articlesHTML = "";
        panierFinal.forEach(item => {
            articlesHTML += `
                <tr>
                    <td style="text-align:left; border-bottom:1px dashed #ccc; padding:4px 0;">${item.quantite}x ${item.nom}</td>
                    <td style="text-align:right; border-bottom:1px dashed #ccc; padding:4px 0;">${item.sousTotal} FCFA</td>
                </tr>
            `;
        });

        // Facture Universelle et N&B pour imprimantes thermiques
        myWindow.document.write(`
            <html>
                <head>
                    <title>Reçu de Caisse - Vente Multiples</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; margin: 20px; color: #000; background: #fff;}
                        .ticket { width: 300px; margin: 0 auto; padding: 10px; border: 1px dotted #ccc;}
                        .center { text-align: center; }
                        h2 { margin: 0; font-size: 20px; font-weight: bold; }
                        p { margin: 5px 0; font-size: 14px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
                        .total-row { font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top:10px; display:flex; justify-content:space-between; }
                        .footer { margin-top: 20px; font-size: 12px; text-align:center; border-top: 1px dashed #333; padding-top: 10px; }
                        @media print { .ticket { width: 100%; border:none; margin:0; padding:0; } body { margin: 0; } }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <div class="center">
                            <h2>TICKET DE CAISSE</h2>
                            <p>Application de Gestion ERP</p>
                        </div>
                        <div style="border-bottom: 2px dashed #000; margin: 10px 0;"></div>
                        <p>Date : ${dateVente}</p>
                        <p>Caissier : ${emailVendeur.split('@')[0]}</p>
                        <div style="border-bottom: 2px dashed #000; margin: 10px 0;"></div>
                        
                        <table>
                            ${articlesHTML}
                        </table>
                        
                        <div class="total-row">
                            <span>TOTAL NET :</span>
                            <span>${totalPanier} FCFA</span>
                        </div>
                        
                        <div class="footer">
                            MERCI DE VOTRE ACHAT<br/>Document imprimé sur POS
                        </div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `);
        myWindow.document.close();
    };

    const encaisserPanier = () => {
        if (panier.length === 0) return;
        const veutImprimer = window.confirm("La vente a été calculée.\n\nVoulez-vous IMPRIMER le ticket de caisse ?");
        const totalFacture = panier.reduce((sum, item) => sum + item.sousTotal, 0);
        const totalMarge = panier.reduce((sum, item) => {
            const cleanAch = Number(String(item.pOrigine.prixAchat || 0).replace(/[^0-9.-]+/g, "")) || 0;
            return sum + ((item.prixUnitaire - cleanAch) * item.quantite);
        }, 0);

        // Envoyer requêtes API multiples et attendre la fin
        const requetes = panier.map(item => {
            const pOrigine = item.pOrigine;
            return fetch(`${API}/modifier/${item.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...pOrigine, quantite: Number(pOrigine.quantite) - item.quantite })
            });
        });

        Promise.all(requetes).then(() => {
            fetchProduits();
            logAction(`A validé un panier d'achat : ${panier.length} ligne(s) pour ${totalFacture} FCFA`, "vente", null, null);
            setRevenu(prev => {
                const nouveauRevenu = prev + totalFacture;
                localStorage.setItem("revenu_stat", nouveauRevenu);
                return nouveauRevenu;
            });
            setBenefice(prev => {
                const nouveauB = prev + totalMarge;
                localStorage.setItem("benefice_stat", nouveauB);
                return nouveauB;
            });

            if (veutImprimer) {
                genererFactureGlobale(panier, totalFacture);
            }
            setPanier([]); // Vider le panier après encaissement
            alert("Vente validée et stock déduit avec succès !");
        });
    };

    // ACTIONS CRUD STANDARDS
    const ajouter = () => {
        if (image) {
            const reader = new FileReader();
            reader.onload = () => envoyerProduit(reader.result);
            reader.readAsDataURL(image);
        } else {
            envoyerProduit(null);
        }
    };

    const envoyerProduit = (img) => {
        fetch(`${API}/ajouter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nom, prix, prixAchat, quantite, emplacement, categorie, fournisseur, image: img }),
        }).then(() => { 
            fetchProduits(); 
            logAction(`A référencé un nouveau produit : ${nom}`, "entree", nom, quantite);
            reset(); 
        });
    };

    const supprimer = (p) => {
        if(window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
            fetch(`${API}/supprimer/${p.id}`).then(() => {
                fetchProduits();
                logAction(`A supprimé le produit : ${p.nom}`, "suppression", p.nom, p.quantite);
            });
        }
    };

    const preparerModification = (p) => {
        setNom(p.nom);
        setPrix(p.prix);
        setPrixAchat(p.prixAchat || "");
        setQuantite(p.quantite);
        setEmplacement(p.emplacement || "");
        setCategorie(p.categorie || "Général");
        setFournisseur(p.fournisseur || "");
        setEditId(p.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const modifier = () => {
        fetch(`${API}/modifier/${editId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nom, prix, prixAchat, quantite, emplacement, categorie, fournisseur }),
        }).then(() => { 
            fetchProduits(); 
            logAction(`A modifié la fiche du produit : ${nom}`, "modification", nom);
            reset(); 
        });
    };

    const reset = () => {
        setNom(""); setPrix(""); setPrixAchat(""); setQuantite(""); setEmplacement(""); setCategorie("Général"); setFournisseur(""); setEditId(null); setImage(null);
    };

    const revelerMarge = (p) => {
        if (role !== "directeur" && !canEdit) return;
        const cleanVen = Number(String(p.prix).replace(/[^0-9.-]+/g, "")) || 0;
        const cleanAch = Number(String(p.prixAchat || 0).replace(/[^0-9.-]+/g, "")) || 0;
        const marge = cleanVen - cleanAch;
        alert(`🔒 DÉTAILS CONFIDENTIELS\n--------------------------------\nProduit : ${p.nom}\nPrix de vente unitaire : ${cleanVen} FCFA\nCoût d'achat (Gros) : ${cleanAch} FCFA\n\nBÉNÉFICE NET : +${marge} FCFA (par unité)`);
    };

    const exportCSV = () => {
        if (produits.length === 0) {
            alert("Aucun produit à exporter.");
            return;
        }
        let csv = "ID,Nom,PrixAchat,PrixVente,Quantite,Emplacement,Categorie,Fournisseur\n";
        produits.forEach(p => {
            const nomF = p.nom ? String(p.nom).replace(/,/g, " ") : "";
            const empF = p.emplacement ? String(p.emplacement).replace(/,/g, " ") : "";
            const catF = p.categorie ? String(p.categorie).replace(/,/g, " ") : "Général";
            const frnF = p.fournisseur ? String(p.fournisseur).replace(/,/g, " ") : "";
            csv += `${p.id},${nomF},${p.prixAchat || ""},${p.prix},${p.quantite},${empF},${catF},${frnF}\n`;
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "export_stock.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        logAction("A exporté la base de données en CSV");
    };

    const exportPDFStock = () => {
        if (produits.length === 0) { alert("Aucun produit à exporter."); return; }
        const dateExport = new Date().toLocaleString("fr-FR");
        const user = localStorage.getItem("user") || "Système";
        let lignesHTML = "";
        produitsFiltres.forEach(p => {
            const qte = Number(p.quantite);
            const couleur = qte > 10 ? "#00a65a" : (qte > 0 ? "#f39c12" : "#dd4b39");
            lignesHTML += `
                <tr>
                    <td>${p.nom}</td>
                    <td>${p.categorie || "Général"}</td>
                    <td>${p.fournisseur || "—"}</td>
                    <td style="text-align:center"><span style="background:${couleur};color:white;padding:2px 8px;border-radius:10px;font-size:11px;">${qte}</span></td>
                    <td style="text-align:right">${p.prix} FCFA</td>
                    <td style="text-align:right">${p.emplacement || "—"}</td>
                </tr>`;
        });
        const win = window.open("", "_blank");
        if (!win) { alert("Pop-up bloqué."); return; }
        win.document.write(`
            <html><head><title>Rapport de Stock</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 30px; color: #333; font-size: 13px; }
                h1 { color: #3c8dbc; border-bottom: 3px solid #3c8dbc; padding-bottom: 8px; }
                .meta { color: #777; font-size: 12px; margin-bottom: 15px; }
                .stats { display: flex; gap: 20px; margin-bottom: 20px; }
                .stat { background: #f0f8ff; border-left: 4px solid #3c8dbc; padding: 8px 15px; flex: 1; }
                .stat b { font-size: 20px; color: #3c8dbc; }
                table { width: 100%; border-collapse: collapse; }
                th { background: #3c8dbc; color: white; padding: 9px; text-align: left; }
                td { padding: 8px 9px; border-bottom: 1px solid #eee; }
                tr:nth-child(even) { background: #f9f9f9; }
                .footer { margin-top: 30px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
                @media print { body { margin: 10px; } }
            </style></head>
            <body>
                <h1>📦 Rapport de Stock — Inventaire</h1>
                <div class="meta">Généré le : ${dateExport} &nbsp;|&nbsp; Par : ${user}</div>
                <div class="stats">
                    <div class="stat"><div style="font-size:11px;color:#777">TOTAL RÉFÉRENCES</div><b>${totalProduits}</b></div>
                    <div class="stat"><div style="font-size:11px;color:#777">UNITÉS EN STOCK</div><b>${totalStock}</b></div>
                    <div class="stat"><div style="font-size:11px;color:#777">VALEUR TOTALE</div><b>${totalValeur.toLocaleString()} FCFA</b></div>
                    <div class="stat"><div style="font-size:11px;color:#777;color:#dd4b39">ALERTES RUPTURE</div><b style="color:#dd4b39">${alertesRupture.length}</b></div>
                </div>
                <table>
                    <thead><tr><th>PRODUIT</th><th>CATÉGORIE</th><th>FOURNISSEUR</th><th>STOCK</th><th>PRIX VENTE</th><th>EMPLACEMENT</th></tr></thead>
                    <tbody>${lignesHTML}</tbody>
                </table>
                <div class="footer">Application ERP — Gestion de Stock — Document auto-généré</div>
                <script>window.onload = () => window.print();<\/script>
            </body></html>
        `);
        win.document.close();
        logAction("A exporté un rapport PDF du stock");
    };

    const dummyExport = (format) => { alert(`L'exportation ${format} nécessite une librairie tierce.`); };

    // STATS & CALCULS FINANCIERS
    const totalProduits = produits.length;
    const totalStock = produits.reduce((sum, p) => sum + Number(p.quantite), 0);
    const totalValeur = produits.reduce((sum, p) => sum + (Number(p.quantite) * (Number(String(p.prix).replace(/[^0-9.-]+/g,"")) || 0)), 0);
    const alertesRupture = produits.filter(p => Number(p.quantite) < 10);

    const produitsFiltres = produits.filter(p => {
        const matchNom = p.nom?.toLowerCase().includes(recherche.toLowerCase());
        const matchCat = filtreCategorie === "" || p.categorie === filtreCategorie;
        return matchNom && matchCat;
    });
    const categoriesUniques = [...new Set(produits.map(p => p.categorie || "Général"))];

    return (
        <div style={homeContainer}>

            {alertesRupture.length > 0 && (
                <div style={alertBanner}>
                    ⚠️ <b>ATTENTION :</b> {alertesRupture.length} produit(s) en rupture imminente de stock (Quantité &lt; 10).
                </div>
            )}

            {role === "directeur" && alertesManager.length > 0 && (
                <div style={{...alertBanner, backgroundColor: "#fdf8e4", borderColor: "#faebcc", color: "#8a6d3b", marginBottom:"15px"}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <span>🔔 <b>ALERTES MANAGER ({alertesManager.length})</b> : Baisses exceptionnelles de prix détectées !</span>
                    </div>
                    <ul style={{margin: "10px 0 0 0", paddingLeft: "20px"}}>
                        {alertesManager.map(a => (
                            <li key={a.id} style={{marginBottom: "5px"}}>
                                [{new Date(a.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] {a.message}
                                <button style={{marginLeft: "10px", padding: "2px 5px", fontSize: "11px", cursor: "pointer", backgroundColor:"#8a6d3b", color:"white", border:"none", borderRadius:"3px"}} onClick={() => {
                                    fetch(`${API}/alerts/supprimer/${a.id}`).then(() => fetchAlertesManager());
                                }}>✅ Marquer comme Lu</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div style={pageHeader}>
                <h2 style={{ margin: 0, fontWeight: "normal", color: "#333" }}>🎛️ {t("Panneau de Contrôle")}</h2>
                <span style={{color: "#777", fontSize: "14px"}}>{t("Données Financières et Inventaire")}</span>
            </div>

            <div className="stats-container" style={statsContainer}>
                <div style={statCardBlue}>
                    <div style={{ padding: "15px 20px" }}>
                        <h3 style={statNumber}>{totalProduits}</h3>
                        <p style={statText}>{t("Ref. Produits")}</p>
                    </div>
                </div>
                <div style={statCardOrange}>
                    <div style={{ padding: "15px 20px" }}>
                        <h3 style={statNumber}>{totalStock}</h3>
                        <p style={statText}>{t("Unités en Stock")}</p>
                    </div>
                </div>
                {(role === "directeur" || canEdit) && (
                    <div style={statCardGreen}>
                        <div style={{ padding: "15px 20px" }}>
                            <h3 style={statNumber}>{revenu} <small style={{fontSize: "16px"}}>FCFA</small></h3>
                            <p style={statText}>{t("Volume des Ventes")}</p>
                        </div>
                    </div>
                )}
                {(role === "directeur" || canEdit) && (
                    <div style={statCardPurple}>
                        <div style={{ padding: "15px 20px" }}>
                            <h3 style={statNumber}>{benefice} <small style={{fontSize: "16px"}}>FCFA</small></h3>
                            <p style={statText}>{t("Bénéfice Net")}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ZONDE DE CAISSE (PANIER) QUI S'AFFICHE SEULEMENT SI LE PANIER N'EST PAS VIDE */}
            {panier.length > 0 && (
                <div style={cartPanel}>
                    <div style={cartHeader}>🛒 Caisse / Panier en cours</div>
                    <div style={cartBody}>
                        {panier.map((item, index) => (
                            <div key={index} style={cartRow}>
                                <span style={{flex: 2}}><b>{item.quantite}x</b> {item.nom}</span>
                                <span style={{flex: 1, textAlign: "right"}}>{item.sousTotal} FCFA</span>
                                <button style={btnCartDelete} onClick={() => retirerDuPanier(item.id)}>✖</button>
                            </div>
                        ))}
                    </div>
                    <div style={cartFooter}>
                        <div style={{fontSize: "18px", fontWeight: "bold"}}>TOTAL : {panier.reduce((a, b) => a + b.sousTotal, 0)} FCFA</div>
                        <div>
                            <button style={{...btnDisplayList, backgroundColor:"white", color:"#dd4b39", border:"1px solid #dd4b39", marginRight:"10px"}} onClick={viderPanier}>Annuler Vente</button>
                            <button style={{...btnDisplayList, backgroundColor:"#00a65a", color:"white", fontSize:"15px", padding:"10px 20px"}} onClick={encaisserPanier}>💸 ENCAISSER ET IMPRIMER</button>
                        </div>
                    </div>
                </div>
            )}

            {(role === "directeur" || canEdit) && (
                <div style={{...panel, borderTopColor: "#00a65a"}}>
                    <div style={{...panelHeader, display: "flex", justifyContent: "space-between"}}>
                        <span>{editId ? `✏️ ${t("Éditer le produit")}` : `➕ ${t("Référencer un nouveau produit")}`}</span>
                        {editId && <button style={{border:"none", backgroundColor:"transparent", color:"#999", cursor:"pointer", textDecoration:"underline"}} onClick={reset}>Annuler</button>}
                    </div>
                    <div style={{...panelBody, display: "flex", flexDirection: "column", gap: "10px"}}>
                        <div className="form-row" style={{display: "flex", gap: "15px"}}>
                            <input style={{...input, flex: 2}} placeholder={t("Nom du produit")} value={nom} onChange={(e) => setNom(e.target.value)} />
                            <select style={{...input, flex: 1, backgroundColor: "#fff"}} value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                                <option value="Général">Général</option>
                                <option value="Électronique">Électronique</option>
                                <option value="Mobilier">Mobilier</option>
                                <option value="Consommables">Consommables</option>
                                <option value="Pièces Rempl.">Pièces Rempl.</option>
                            </select>
                            <input style={{...input, flex: 1}} placeholder={t("Prix d'Achat (Gros)")} value={prixAchat} onChange={(e) => setPrixAchat(e.target.value)} />
                            <input style={{...input, flex: 1}} placeholder={t("Prix de vente")} value={prix} onChange={(e) => setPrix(e.target.value)} />
                            <input style={{...input, flex: 1}} type="number" placeholder={t("Qté initiale")} value={quantite} onChange={(e) => setQuantite(e.target.value)} />
                        </div>

                        <div className="form-row" style={{display: "flex", gap: "15px", alignItems: "center"}}>
                            <input style={{...input, flex: 1}} placeholder={t("Fournisseur")} value={fournisseur} onChange={(e) => setFournisseur(e.target.value)} />
                            <input style={{...input, flex: 1}} placeholder={t("Emplacement")} value={emplacement} onChange={(e) => setEmplacement(e.target.value)} />
                            <input style={{...input, flex: 1, padding: "5px"}} type="file" onChange={(e) => setImage(e.target.files[0])} />
                            
                            <div style={{ display: "flex", gap: "10px", flex: 0.5 }}>
                                {editId ? (
                                    <button style={{...btnActionPrimary, width:"100%", padding: "10px"}} onClick={modifier}>Mettre à jour</button>
                                ) : (
                                    <button style={{...btnActionSuccess, width:"100%", padding: "10px"}} onClick={ajouter}>Créer Fiche</button>
                                )}
                                <button style={{...btnActionDefault, padding: "10px"}} onClick={reset}>Vider</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: "-1px" }}>
                <button style={{ ...tabButton, backgroundColor: onglet === "stock" ? "white" : "#e0e0e0", borderBottomColor: onglet === "stock" ? "transparent" : "#ddd" }} onClick={() => setOnglet("stock")}>📦 État du Stock</button>
                <button style={{ ...tabButton, backgroundColor: onglet === "logs" ? "white" : "#e0e0e0", borderBottomColor: onglet === "logs" ? "transparent" : "#ddd" }} onClick={() => { setOnglet("logs"); fetchLogs(); }}>⏱️ Historique (Mouvements)</button>
            </div>

            <div style={{...panel, borderTop: "none", borderTopLeftRadius: "0", marginTop: "0"}}>
                {onglet === "stock" ? (
                    <div style={panelBody}>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems:"center" }}>
                            <div>
                                <button style={{...btnDisplayList, backgroundColor:"#00a65a", color:"white"}} onClick={() => dummyExport('Excel')}>Excel</button>
                                <button style={{...btnDisplayList, backgroundColor:"#3c8dbc", color:"white"}} onClick={exportCSV}>CSV</button>
                                <button style={{...btnDisplayList, backgroundColor:"#dd4b39", color:"white"}} onClick={exportPDFStock}>📄 PDF</button>
                                <button style={{...btnDisplayList, backgroundColor:"#f39c12", color:"white"}} onClick={() => window.print()}>Print</button>
                            </div>
                            <div style={{display: "flex", gap: "10px", alignItems:"center"}}>
                                <span style={{fontWeight: "bold", fontSize: "14px"}}>{t("Filtres :")}</span>
                                <select style={{...inputInline, width: "150px"}} value={filtreCategorie} onChange={(e) => setFiltreCategorie(e.target.value)}>
                                    <option value="">Toutes Catégories</option>
                                    {categoriesUniques.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <input style={{...inputInline, width: "200px"}} value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder={t("Chercher un nom...")} />
                            </div>
                        </div>

                        <div className="table-responsive">
                        <table style={table}>
                            <thead>
                                <tr>
                                    <th style={th}>{t("IMAGE")}</th>
                                    <th style={th}>{t("PRODUIT / CATÉGORIE")}</th>
                                    <th style={th}>{t("PRIX U.")}</th>
                                    <th style={{textAlign: "center", ...th}}>{t("STOCK")}</th>
                                    <th style={{textAlign: "right", paddingRight:"20px", ...th}}>{t("ACTIONS")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produitsFiltres.map((p) => (
                                    <tr key={p.id} style={{ transition: "background 0.2s" }} onMouseOver={(e)=>e.currentTarget.style.backgroundColor="#f4f6f9"} onMouseOut={(e)=>e.currentTarget.style.backgroundColor="transparent"}>
                                        <td style={td}>
                                            {p.image ? <img src={p.image} width="40" height="40" alt="Produit" style={{border: "1px solid #ddd", objectFit:"cover", borderRadius:"4px"}} /> : <div style={noImage}>N/A</div>}
                                        </td>
                                        <td style={td}>
                                            <b onClick={() => revelerMarge(p)} style={{cursor: (role === "directeur" || canEdit) ? "pointer" : "default", textDecoration: (role === "directeur" || canEdit) ? "underline" : "none", color: (role === "directeur" || canEdit) ? "#3c8dbc" : "inherit", display: "inline-block"}} title={(role === "directeur" || canEdit) ? "Cliquer pour voir la marge" : ""}>
                                                {p.nom} {Number(p.quantite) < 10 && <span title="Stock Faible !" style={{marginLeft: "5px", color:"#e74c3c", animation:"pulse 2s infinite"}}>⚠️</span>}
                                            </b>
                                            <div style={{marginTop:"4px", display:"flex", gap:"5px", alignItems:"center"}}>
                                                <span style={badgeBadge}>{p.categorie || "Général"}</span>
                                                {p.fournisseur && <span style={{...badgeBadge, backgroundColor:"#f39c12"}}>{p.fournisseur}</span>}
                                                {p.emplacement && <small style={{color: "#888", marginLeft:"5px"}}>{p.emplacement}</small>}
                                            </div>
                                        </td>
                                        <td style={td}>{p.prix} FCFA</td>
                                        <td style={{textAlign: "center", ...td}}>
                                            <span style={{ 
                                                backgroundColor: p.quantite > 10 ? "#00a65a" : (p.quantite > 0 ? "#f39c12" : "#dd4b39"), 
                                                color: "white", padding: "4px 10px", borderRadius: "10px", fontWeight: "bold", fontSize:"12px"
                                            }}>
                                                {p.quantite}
                                            </span>
                                        </td>
                                        <td style={{textAlign: "right", ...td}}>
                                            <button style={btnActionAddToCart} onClick={() => ajouterAuPanier(p)}>🛒 Ajouter à la caisse...</button>
                                            {(role === "directeur" || canEdit) && <button style={btnActionEdit} onClick={() => preparerModification(p)}>{t("✏️ Éditer")}</button>}
                                            {(role === "directeur" || canEdit) && <button style={btnActionDelete} onClick={() => supprimer(p)}>{t("🗑️ Supprimer")}</button>}
                                        </td>
                                    </tr>
                                ))}
                                {produitsFiltres.length === 0 && (
                                    <tr><td colSpan="5" style={{textAlign: "center", padding: "30px", color:"#777"}}>Aucun produit enregistré.</td></tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                ) : (
                    <div style={panelBody}>
                        <h4 style={{marginTop:0, marginBottom:"15px", color:"#444"}}>Historique des Actions (Audit Trail)</h4>
                        <div className="table-responsive">
                        <table style={table}>
                            <thead>
                                <tr>
                                    <th style={th}>DATE & HEURE</th>
                                    <th style={th}>COMPTE (EMPLOYÉ)</th>
                                    <th style={th}>ACTION ENREGISTRÉE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} style={{ transition: "background 0.2s" }} onMouseOver={(e)=>e.currentTarget.style.backgroundColor="#f4f6f9"} onMouseOut={(e)=>e.currentTarget.style.backgroundColor="transparent"}>
                                        <td style={td}>
                                            {new Date(log.date).toLocaleDateString()} à {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </td>
                                        <td style={td}><b>{log.user}</b></td>
                                        <td style={td}>{log.action}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr><td colSpan="3" style={{textAlign: "center", padding: "30px", color:"#777"}}>Aucune action enregistrée pour le moment.</td></tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

// 🎨 STYLES
const alertBanner = { backgroundColor: "#f2dede", color: "#a94442", padding: "15px", borderRadius: "4px", border: "1px solid #ebccd1", fontSize: "14px" };
const homeContainer = { display: "flex", flexDirection: "column", gap: "20px" };
const pageHeader = { display: "flex", alignItems: "baseline", gap: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" };
const statsContainer = { display: "flex", gap: "20px" };

const statCardBlue = { flex: 1, backgroundColor: "#00c0ef", color: "white", borderRadius: "4px", boxShadow: "0 1px 1px rgba(0,0,0,0.1)" };
const statCardOrange = { flex: 1, backgroundColor: "#f39c12", color: "white", borderRadius: "4px", boxShadow: "0 1px 1px rgba(0,0,0,0.1)" };
const statCardGreen = { flex: 1, backgroundColor: "#00a65a", color: "white", borderRadius: "4px", boxShadow: "0 1px 1px rgba(0,0,0,0.1)" };
const statCardPurple = { flex: 1, backgroundColor: "#605ca8", color: "white", borderRadius: "4px", boxShadow: "0 1px 1px rgba(0,0,0,0.1)" };

const statNumber = { fontSize: "35px", fontWeight: "bold", margin: "0 0 5px 0" };
const statText = { margin: 0, fontSize: "13px", textTransform: "uppercase" };

const panel = { backgroundColor: "white", borderTop: "3px solid #d2d6de", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderRadius: "3px" };
const panelHeader = { padding: "12px 15px", borderBottom: "1px solid #f4f4f4", fontSize: "16px", fontWeight: "bold", color: "#444" };
const panelBody = { padding: "20px" };

const cartPanel = { backgroundColor: "#fff9e6", border: "2px solid #f39c12", boxShadow: "0 2px 5px rgba(0,0,0,0.15)", borderRadius: "5px", padding: "0", display:"flex", flexDirection:"column" };
const cartHeader = { backgroundColor: "#f39c12", color:"white", padding: "10px 15px", fontWeight:"bold", fontSize:"16px" };
const cartBody = { padding: "15px", display:"flex", flexDirection:"column", gap:"8px", borderBottom:"1px solid #ddd" };
const cartRow = { display:"flex", justifyContent:"space-between", fontSize:"15px", paddingBottom:"5px", borderBottom:"1px dashed #ccc" };
const btnCartDelete = { background:"transparent", color:"#dd4b39", border:"none", cursor:"pointer", fontWeight:"bold", fontSize:"14px", marginLeft:"15px" };
const cartFooter = { padding: "15px", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor:"#fcfcfc" };

const input = { padding: "10px", border: "1px solid #d2d6de", borderRadius: "0px", outline: "none", fontSize: "14px", width: "100%", boxSizing: "border-box" };
const inputInline = { padding: "6px 10px", border: "1px solid #d2d6de", outline: "none", marginLeft: "10px" };

const table = { width: "100%", borderCollapse: "collapse" };
const th = { backgroundColor: "#f9f9f9", padding: "12px", borderBottom: "2px solid #ddd", textAlign: "left", fontSize: "13px", color: "#555", fontWeight:"bold" };
const td = { padding: "12px", borderBottom: "1px solid #f4f4f4", fontSize: "14px", color: "#333", verticalAlign: "middle" };

const tabButton = { padding: "10px 20px", fontWeight: "bold", border: "1px solid #ddd", cursor: "pointer", fontSize: "14px", borderTopLeftRadius: "4px", borderTopRightRadius: "4px", outline: "none" };

const noImage = { width: "40px", height: "40px", backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: "12px", borderRadius: "4px" };
const badgeBadge = { backgroundColor: "#3c8dbc", color: "white", padding: "3px 6px", borderRadius: "3px", fontSize: "11px", fontWeight: "bold" };

const btn = { border: "none", color: "white", cursor: "pointer", borderRadius: "3px", margin: "0 2px", transition: "background 0.2s" };
const btnActionPrimary = { ...btn, backgroundColor: "#3c8dbc" };
const btnActionSuccess = { ...btn, backgroundColor: "#00a65a" };
const btnActionDefault = { ...btn, backgroundColor: "#f4f4f4", color: "#444", border: "1px solid #ddd" };
const btnDisplayList = { ...btn, padding: "6px 12px", fontSize: "13px", borderRadius: "2px", fontWeight:"600" };

const btnActionAddToCart = { ...btn, backgroundColor: "#f39c12", padding: "6px 10px", fontSize: "12px", color:"#fff", fontWeight:"bold" };
const btnActionEdit = { ...btn, backgroundColor: "#3c8dbc", padding: "6px 10px", fontSize: "12px" };
const btnActionDelete = { ...btn, backgroundColor: "#dd4b39", padding: "6px 10px", fontSize: "12px" };

export default Home;