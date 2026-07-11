require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// ======================= CONNEXION MONGODB =======================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Erreur : MONGODB_URI n'est pas défini dans l'environnement ou le fichier .env");
  console.log("Veuillez créer un fichier .env dans le dossier backend avec la ligne :");
  console.log("MONGODB_URI=mongodb+srv://...");
  process.exit(1);
}

console.log("⏳ Connexion à MongoDB Atlas...");
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB Atlas");
    runMigration();
  })
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

// ======================= MIGRATION DATA =======================
async function runMigration() {
  try {
    const filesToMigrate = [
      { filename: "users.json", model: User, name: "Utilisateurs" },
      { filename: "data.json", model: Produit, name: "Produits" },
      { filename: "logs.json", model: Log, name: "Logs" },
      { filename: "alerts.json", model: Alert, name: "Alertes" },
      { filename: "clients.json", model: Client, name: "Clients" },
      { filename: "commandes.json", model: Commande, name: "Commandes" }
    ];

    for (const file of filesToMigrate) {
      const filePath = path.join(__dirname, file.filename);
      console.log(`\n--------------------------------------------`);
      console.log(`Migration de ${file.name} depuis ${file.filename}...`);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Fichier ${file.filename} introuvable. Étape ignorée.`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, "utf8");
      let data = [];
      try {
        data = JSON.parse(fileContent);
      } catch (err) {
        console.error(`❌ Erreur parsing JSON pour ${file.filename} :`, err.message);
        continue;
      }

      if (!Array.isArray(data)) {
        console.log(`⚠️ Le contenu de ${file.filename} n'est pas un tableau. Étape ignorée.`);
        continue;
      }

      console.log(`🗑️ Nettoyage de la collection existante...`);
      await file.model.deleteMany({});

      if (data.length === 0) {
        console.log(`ℹ️ Aucun élément à importer pour ${file.name}.`);
        continue;
      }

      console.log(`📤 Importation de ${data.length} élément(s)...`);
      await file.model.insertMany(data);
      console.log(`✅ ${file.name} importés avec succès.`);
    }

    console.log(`\n============================================`);
    console.log("🎉 Migration terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur pendant la migration :", error.message);
  } finally {
    mongoose.connection.close();
    console.log("🔌 Déconnexion de MongoDB Atlas.");
    process.exit(0);
  }
}
