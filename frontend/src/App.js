import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Aide from "./pages/Aide";
import Login from "./pages/Login";
import Graphique from "./pages/Graphique";
import RH from "./pages/RH";
import CRM from "./pages/CRM";
import Mouvements from "./pages/Mouvements";
import CommandesFournisseurs from "./pages/CommandesFournisseurs";
import Scanner from "./pages/Scanner";
import { t, getCurrentLang } from "./i18n";

function SidebarLink({ to, icon, label, badge }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      style={{
        ...link,
        backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
        borderLeftColor: isActive ? "#3c8dbc" : "transparent",
        color: isActive ? "#fff" : "#b8c7ce",
      }}
      to={to}
    >
      {icon} {label}
      {badge && badge > 0 ? (
        <span style={badgeStyle}>{badge}</span>
      ) : null}
    </Link>
  );
}

function App() {
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role") || "directeur";
  const entreprise = localStorage.getItem("entreprise") || "L'Entreprise";
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const lang = getCurrentLang();

  useEffect(() => {
    document.documentElement.dir = lang === "Arabe" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <Router>
      {!user ? (
        <Login />
      ) : (
        <div className="app-container" style={appContainer}>

          {/* SIDEBAR GAUCHE */}
          <div className={`sidebar-left ${sidebarOpen ? "open" : "closed"}`} style={{ ...sidebar, width: sidebarOpen ? "250px" : "0px", overflow: "hidden", transition: "width 0.3s" }}>
            <div style={{ ...sidebarHeader, flexDirection: "row", padding: "20px 10px", justifyContent: "flex-start", paddingLeft: "15px" }}>
              <span style={{ fontSize: "32px", marginRight: "12px", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>📦</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: "1.2", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: "15px", fontWeight: "900", letterSpacing: "0.5px", color: "#ffffff" }}>{entreprise}</span>
                <span style={{ fontSize: "10px", fontWeight: "400", color: "#9ac0da", letterSpacing: "0.5px", marginTop: "2px" }}>{t("Gestion de stock")}</span>
              </div>
            </div>
            <div style={sidebarUser}>
              {t("Connecté :")} {user}
              <div style={{ fontSize: "10px", marginTop: "3px", color: "#7a9db5", textTransform: "uppercase" }}>
                {role === "directeur" ? "🔑 Directeur" : "👤 Employé"}
              </div>
            </div>

            <nav style={sidebarMenu}>
              <div style={menuSection}>STOCK & INVENTAIRE</div>
              {(role === "directeur" || role === "employe") && (
                <SidebarLink to="/" icon="📦" label={t("Stock & Produits")} />
              )}
              {(role === "directeur" || role === "employe") && (
                <SidebarLink to="/mouvements" icon="📋" label={t("Mouvements de Stock")} />
              )}
              {(role === "directeur") && (
                <SidebarLink to="/commandes" icon="🚚" label={t("Commandes Fournisseurs")} />
              )}

              <div style={menuSection}>ANALYSES</div>
              {(role === "directeur" || role === "employe") && (
                <SidebarLink to="/graphique" icon="📊" label={t("Ventes & Statistiques")} />
              )}
              <SidebarLink to="/scanner" icon="📷" label={t("Scanner Produit")} />

              <div style={menuSection}>GESTION</div>
              {role === "directeur" && (
                <SidebarLink to="/rh" icon="👥" label={t("Équipe & Employés")} />
              )}
              <SidebarLink to="/crm" icon="🤝" label={t("Partenaires & Clients")} />
              {role === "directeur" && (
                <SidebarLink to="/aide" icon="⚙️" label={t("Paramètres")} />
              )}
            </nav>

            {/* Version tag */}
            <div style={{ padding: "15px", color: "#4a6070", fontSize: "10px", textAlign: "center", marginTop: "auto" }}>
              ERP v2.1 — © 2025 Gestion Stock
            </div>
          </div>

          {/* VOLET D'OMBRAGE SUR MOBILE */}
          {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

          {/* PARTIE PRINCIPALE */}
          <div className="main-wrapper" style={{ ...mainWrapper, width: sidebarOpen ? "calc(100% - 250px)" : "100%", transition: "width 0.3s" }}>

            {/* TOPBAR */}
            <header className="topbar" style={topbar}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ cursor: "pointer", transition: "all 0.3s", fontSize: "18px" }} onClick={() => setSidebarOpen(!sidebarOpen)}>
                  ☰
                </div>
                <span style={{ fontSize: "13px", opacity: 0.8 }}>
                  {sidebarOpen ? "" : t("Ouvrir Menu")}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span className="session-label" style={{ fontSize: "13px", opacity: 0.8 }}>🔒 Session sécurisée</span>
                <button
                  style={btnLogout}
                  onClick={() => {
                    localStorage.removeItem("user");
                    window.location.reload();
                  }}
                >
                  {t("Déconnexion 🚪")}
                </button>
              </div>
            </header>

            {/* CONTENU */}
            <div className="content-area" style={contentArea}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/graphique" element={<Graphique />} />
                <Route path="/rh" element={<RH />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/aide" element={<Aide />} />
                <Route path="/mouvements" element={<Mouvements />} />
                <Route path="/commandes" element={<CommandesFournisseurs />} />
                <Route path="/scanner" element={<Scanner />} />
              </Routes>
            </div>

          </div>

        </div>
      )}
    </Router>
  );
}

/* 🎨 STYLES */

const appContainer = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#ecf0f5",
};

const sidebar = {
  width: "250px",
  backgroundColor: "#222d32",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
};

const sidebarHeader = {
  padding: "20px 15px",
  backgroundColor: "#367fa9",
  color: "white",
  fontSize: "22px",
  fontWeight: "bold",
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px"
};

const sidebarUser = {
  padding: "12px 15px",
  borderBottom: "1px solid #1a2226",
  color: "#b8c7ce",
  fontSize: "13px",
  fontStyle: "italic",
  textAlign: "center"
};

const sidebarMenu = {
  display: "flex",
  flexDirection: "column",
  paddingTop: "5px",
  flex: 1,
};

const menuSection = {
  padding: "10px 15px 5px",
  fontSize: "10px",
  fontWeight: "bold",
  color: "#4a6070",
  letterSpacing: "1px",
  textTransform: "uppercase",
  marginTop: "8px",
};

const link = {
  textDecoration: "none",
  color: "#b8c7ce",
  padding: "12px 20px",
  fontSize: "14px",
  borderLeft: "3px solid transparent",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  whiteSpace: "nowrap",
};

const badgeStyle = {
  marginLeft: "auto",
  backgroundColor: "#dd4b39",
  color: "white",
  borderRadius: "10px",
  padding: "1px 6px",
  fontSize: "11px",
  fontWeight: "bold",
};

const mainWrapper = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
};

const topbar = {
  backgroundColor: "#3c8dbc",
  height: "50px",
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "white",
  fontSize: "16px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
  flexShrink: 0,
};

const btnLogout = {
  backgroundColor: "rgba(255,255,255,0.2)",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  padding: "6px 12px",
  borderRadius: "3px",
  fontSize: "13px",
  transition: "background 0.2s",
};

const contentArea = {
  padding: "20px",
  flex: 1,
  overflowY: "auto",
};

export default App;