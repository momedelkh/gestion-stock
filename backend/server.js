const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

// CORS : accepte les requêtes depuis n'importe quelle origine (frontend Vercel)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Set a higher limit for JSON parsing if images are passed as base64 strings
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const FILE = "./data.json";
const USERS_FILE = "./users.json";
const LOGS_FILE = "./logs.json";
const ALERTS_FILE = "./alerts.json";
const CLIENTS_FILE = "./clients.json";
const COMMANDES_FILE = "./commandes.json";

// lire données
const readData = () => JSON.parse(fs.readFileSync(FILE));
const writeData = (data) => fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

const readUsers = () => {
    if(!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
    return JSON.parse(fs.readFileSync(USERS_FILE));
};
const writeUsers = (data) => fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));

const readLogs = () => {
    if(!fs.existsSync(LOGS_FILE)) fs.writeFileSync(LOGS_FILE, '[]');
    return JSON.parse(fs.readFileSync(LOGS_FILE));
};
const writeLogs = (data) => fs.writeFileSync(LOGS_FILE, JSON.stringify(data, null, 2));

const readAlerts = () => {
    if(!fs.existsSync(ALERTS_FILE)) fs.writeFileSync(ALERTS_FILE, '[]');
    return JSON.parse(fs.readFileSync(ALERTS_FILE));
};
const writeAlerts = (data) => fs.writeFileSync(ALERTS_FILE, JSON.stringify(data, null, 2));

const readClients = () => {
    if(!fs.existsSync(CLIENTS_FILE)) fs.writeFileSync(CLIENTS_FILE, '[]');
    return JSON.parse(fs.readFileSync(CLIENTS_FILE));
};
const writeClients = (data) => fs.writeFileSync(CLIENTS_FILE, JSON.stringify(data, null, 2));

const readCommandes = () => {
    if(!fs.existsSync(COMMANDES_FILE)) fs.writeFileSync(COMMANDES_FILE, '[]');
    return JSON.parse(fs.readFileSync(COMMANDES_FILE));
};
const writeCommandes = (data) => fs.writeFileSync(COMMANDES_FILE, JSON.stringify(data, null, 2));

// ======================= PRODUITS =======================
app.get("/produits", (req, res) => res.json(readData()));

app.post("/ajouter", (req, res) => {
    const produits = readData();
    const nouveau = { id: Date.now(), ...req.body };
    produits.push(nouveau);
    writeData(produits);
    res.send("OK");
});

app.get("/supprimer/:id", (req, res) => {
    let produits = readData();
    produits = produits.filter(p => p.id != req.params.id);
    writeData(produits);
    res.send("Supprimé");
});

app.post("/modifier/:id", (req, res) => {
    let produits = readData();
    produits = produits.map(p => p.id == req.params.id ? { ...p, ...req.body } : p);
    writeData(produits);
    res.send("Modifié");
});

// ======================= UTILISATEURS (RH) =======================
app.post("/login", (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.email === req.body.email && u.password === req.body.password);
    if (user) {
        if (user.role === "technicien_surface") {
            return res.status(403).json({ success: false, message: "Accès refusé. Profil non autorisé au système informatique." });
        }
        res.json({ success: true, email: user.email, role: user.role, canEdit: user.canEdit });
    } else {
        res.status(401).json({ success: false, message: "Identifiants incorrects" });
    }
});

app.get("/users", (req, res) => res.json(readUsers()));

app.post("/users/ajouter", (req, res) => {
    const users = readUsers();
    if (users.find(u => u.email === req.body.email)) {
        return res.status(400).json({ error: "Email déjà utilisé" });
    }
    const nouveau = { id: Date.now(), ...req.body };
    users.push(nouveau);
    writeUsers(users);
    res.send("OK");
});

app.post("/users/modifier/:id", (req, res) => {
    let users = readUsers();
    users = users.map(u => u.id == req.params.id ? { ...u, ...req.body } : u);
    writeUsers(users);
    res.send("Modifié");
});

// ======================= LOGS (TRAÇABILITÉ) =======================
app.get("/logs", (req, res) => res.json(readLogs()));

app.post("/logs", (req, res) => {
    const logs = readLogs();
    const nouveau = {
        id: Date.now(),
        date: new Date().toISOString(),
        type: req.body.type || "action",  // Types: entree, sortie, vente, modification, suppression, action
        produit: req.body.produit || null,
        quantite: req.body.quantite || null,
        ...req.body
    };
    logs.push(nouveau);
    writeLogs(logs);
    res.send("OK");
});

// ======================= ALERTES (MANAGER) =======================
app.get("/alerts", (req, res) => res.json(readAlerts()));

app.post("/alerts", (req, res) => {
    const alerts = readAlerts();
    alerts.push({ id: Date.now(), date: new Date().toISOString(), ...req.body });
    writeAlerts(alerts);
    res.send("OK");
});

app.get("/alerts/supprimer/:id", (req, res) => {
    let alerts = readAlerts();
    alerts = alerts.filter(a => a.id != req.params.id);
    writeAlerts(alerts);
    res.send("Supprimé");
});

// ======================= CLIENTS (CRM) =======================
app.get("/clients", (req, res) => res.json(readClients()));

app.post("/clients/ajouter", (req, res) => {
    const clients = readClients();
    const nouveau = { id: Date.now(), ...req.body };
    clients.push(nouveau);
    writeClients(clients);
    res.send("OK");
});

app.post("/clients/modifier/:id", (req, res) => {
    let clients = readClients();
    clients = clients.map(c => c.id == req.params.id ? { ...c, ...req.body } : c);
    writeClients(clients);
    res.send("Modifié");
});

app.get("/clients/supprimer/:id", (req, res) => {
    let clients = readClients();
    clients = clients.filter(c => c.id != req.params.id);
    writeClients(clients);
    res.send("Supprimé");
});

// ======================= COMMANDES FOURNISSEURS =======================
app.get("/commandes", (req, res) => res.json(readCommandes()));

app.post("/commandes/ajouter", (req, res) => {
    const commandes = readCommandes();
    const nouveau = {
        id: Date.now(),
        dateCreation: new Date().toISOString(),
        statut: "En attente",
        ...req.body
    };
    commandes.push(nouveau);
    writeCommandes(commandes);
    res.send("OK");
});

app.post("/commandes/modifier/:id", (req, res) => {
    let commandes = readCommandes();
    commandes = commandes.map(c => c.id == req.params.id ? { ...c, ...req.body } : c);
    writeCommandes(commandes);
    res.send("Modifié");
});

app.get("/commandes/supprimer/:id", (req, res) => {
    let commandes = readCommandes();
    commandes = commandes.filter(c => c.id != req.params.id);
    writeCommandes(commandes);
    res.send("Supprimé");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur JSON lancé sur le port ${PORT}`);
});