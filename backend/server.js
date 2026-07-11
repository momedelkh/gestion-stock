require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// CORS : accepte les requêtes depuis n'importe quelle origine (frontend Vercel)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ======================= CONNEXION MONGODB =======================
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Connecté à MongoDB Atlas"))
  .catch(err => {
    console.error("❌ Erreur connexion MongoDB :", err.message);
    process.exit(1);
  });

// ======================= SCHEMAS MONGOOSE =======================
const produitSchema = new mongoose.Schema({}, { strict: false });
const userSchema = new mongoose.Schema({}, { strict: false });
const logSchema = new mongoose.Schema({}, { strict: false });
const alertSchema = new mongoose.Schema({}, { strict: false });
const clientSchema = new mongoose.Schema({}, { strict: false });
const commandeSchema = new mongoose.Schema({}, { strict: false });

const Produit = mongoose.model("Produit", produitSchema, "produits");
const User = mongoose.model("User", userSchema, "users");
const Log = mongoose.model("Log", logSchema, "logs");
const Alert = mongoose.model("Alert", alertSchema, "alerts");
const Client = mongoose.model("Client", clientSchema, "clients");
const Commande = mongoose.model("Commande", commandeSchema, "commandes");

// ======================= UTILITAIRES MULTI-ENTREPRISES =======================
const getQueryFilter = (req) => {
  const ent = req.query.entreprise || "L'Entreprise";
  if (ent === "L'Entreprise") {
    return { $or: [{ entreprise: "L'Entreprise" }, { entreprise: { $exists: false } }] };
  }
  return { entreprise: ent };
};

// ======================= PRODUITS =======================
app.get("/produits", async (req, res) => {
  try {
    const produits = await Produit.find(getQueryFilter(req), { __v: 0 }).lean();
    // Convertir _id MongoDB en id numérique pour compatibilité frontend
    const result = produits.map(p => ({ ...p, id: p.id || p._id.toString() }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/ajouter", async (req, res) => {
  try {
    const nouveau = new Produit({ id: Date.now(), ...req.body });
    await nouveau.save();
    res.send("OK");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/supprimer/:id", async (req, res) => {
  try {
    await Produit.deleteOne({ id: Number(req.params.id), ...getQueryFilter(req) });
    res.send("Supprimé");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/modifier/:id", async (req, res) => {
  try {
    await Produit.updateOne({ id: Number(req.params.id), ...getQueryFilter(req) }, { $set: req.body });
    res.send("Modifié");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================= UTILISATEURS (RH) & COMPAGNIES =======================
app.post("/register-company", async (req, res) => {
  try {
    const { entreprise, nom, email, password } = req.body;
    if (!entreprise || !nom || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }
    const newUser = new User({
      id: Date.now(),
      nom,
      email,
      password,
      role: "directeur",
      canEdit: true,
      entreprise,
      statut: "Actif",
      poste: "Directeur Général",
      salaire: "0"
    });
    await newUser.save();
    
    const newLog = new Log({
      id: Date.now(),
      date: new Date().toISOString(),
      type: "action",
      action: `Espace créé pour l'entreprise : ${entreprise}`,
      user: email,
      entreprise
    });
    await newLog.save();

    res.json({ success: true, message: "Entreprise enregistrée avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email, password: req.body.password }).lean();
    if (user) {
      if (user.role === "technicien_surface") {
        return res.status(403).json({ success: false, message: "Accès refusé. Profil non autorisé au système informatique." });
      }
      res.json({ 
        success: true, 
        email: user.email, 
        role: user.role, 
        canEdit: user.canEdit, 
        entreprise: user.entreprise || "L'Entreprise" 
      });
    } else {
      res.status(401).json({ success: false, message: "Identifiants incorrects" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find(getQueryFilter(req), { __v: 0 }).lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/users/ajouter", async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ error: "Email déjà utilisé" });
    const nouveau = new User({ id: Date.now(), ...req.body });
    await nouveau.save();
    res.send("OK");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/users/modifier/:id", async (req, res) => {
  try {
    await User.updateOne({ id: Number(req.params.id), ...getQueryFilter(req) }, { $set: req.body });
    res.send("Modifié");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================= LOGS (TRAÇABILITÉ) =======================
app.get("/logs", async (req, res) => {
  try {
    const logs = await Log.find(getQueryFilter(req), { __v: 0 }).lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/logs", async (req, res) => {
  try {
    const nouveau = new Log({
      id: Date.now(),
      date: new Date().toISOString(),
      type: req.body.type || "action",
      produit: req.body.produit || null,
      quantite: req.body.quantite || null,
      ...req.body
    });
    await nouveau.save();
    res.send("OK");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================= ALERTES (MANAGER) =======================
app.get("/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find(getQueryFilter(req), { __v: 0 }).lean();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/alerts", async (req, res) => {
  try {
    const nouveau = new Alert({ id: Date.now(), date: new Date().toISOString(), ...req.body });
    await nouveau.save();
    res.send("OK");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/alerts/supprimer/:id", async (req, res) => {
  try {
    await Alert.deleteOne({ id: Number(req.params.id), ...getQueryFilter(req) });
    res.send("Supprimé");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================= CLIENTS (CRM) =======================
app.get("/clients", async (req, res) => {
  try {
    const clients = await Client.find(getQueryFilter(req), { __v: 0 }).lean();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/clients/ajouter", async (req, res) => {
  try {
    const nouveau = new Client({ id: Date.now(), ...req.body });
    await nouveau.save();
    res.send("OK");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/clients/modifier/:id", async (req, res) => {
  try {
    await Client.updateOne({ id: Number(req.params.id), ...getQueryFilter(req) }, { $set: req.body });
    res.send("Modifié");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/clients/supprimer/:id", async (req, res) => {
  try {
    await Client.deleteOne({ id: Number(req.params.id), ...getQueryFilter(req) });
    res.send("Supprimé");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================= COMMANDES FOURNISSEURS =======================
app.get("/commandes", async (req, res) => {
  try {
    const commandes = await Commande.find(getQueryFilter(req), { __v: 0 }).lean();
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/commandes/ajouter", async (req, res) => {
  try {
    const nouveau = new Commande({
      id: Date.now(),
      dateCreation: new Date().toISOString(),
      statut: "En attente",
      ...req.body
    });
    await nouveau.save();
    res.send("OK");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/commandes/modifier/:id", async (req, res) => {
  try {
    await Commande.updateOne({ id: Number(req.params.id), ...getQueryFilter(req) }, { $set: req.body });
    res.send("Modifié");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/commandes/supprimer/:id", async (req, res) => {
  try {
    await Commande.deleteOne({ id: Number(req.params.id), ...getQueryFilter(req) });
    res.send("Supprimé");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================= ROUTE SANTÉ =======================
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Gestion Stock API en ligne 🚀" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});