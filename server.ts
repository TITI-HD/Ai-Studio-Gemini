import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

const PORT = 3000;
const app = express();
app.use(express.json());

// Initialize SQLite DB
const db = new Database("app.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    is_agent BOOLEAN DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS dossiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_acte TEXT,
    date_soumission DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut TEXT DEFAULT 'ATTENTE',
    priorite BOOLEAN DEFAULT 0,
    demandeur_id INTEGER,
    date_evenement DATE,
    nom_concerne TEXT,
    prenom_concerne TEXT,
    FOREIGN KEY(demandeur_id) REFERENCES users(id)
  );

  INSERT OR IGNORE INTO users (id, username, email, first_name, last_name, is_agent)
  VALUES 
    (1, 'agent', 'agent@gov.fr', 'Agent', 'Civil', 1),
    (2, 'citoyen', 'citoyen@mail.com', 'Jean', 'Dupont', 0);
`);

// API Routes
app.get("/api/auth/me", (req, res) => {
  // Mock auth - return citoyen by default, but allow switching via query param for demo
  const isAgent = req.query.role === 'agent';
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(isAgent ? 'agent' : 'citoyen');
  res.json({ user });
});

app.get("/api/dossiers", (req, res) => {
  const isAgent = req.query.role === 'agent';
  const statut = req.query.statut;
  let dossiers;
  
  if (isAgent) {
    if (statut && statut !== 'ALL') {
      dossiers = db.prepare("SELECT dossiers.*, users.first_name, users.last_name, users.email FROM dossiers JOIN users ON dossiers.demandeur_id = users.id WHERE dossiers.statut = ? ORDER BY dossiers.priorite DESC, dossiers.date_soumission DESC").all(statut);
    } else {
      dossiers = db.prepare("SELECT dossiers.*, users.first_name, users.last_name, users.email FROM dossiers JOIN users ON dossiers.demandeur_id = users.id ORDER BY dossiers.priorite DESC, dossiers.date_soumission DESC").all();
    }
  } else {
    // citoyen
    dossiers = db.prepare("SELECT * FROM dossiers WHERE demandeur_id = 2 ORDER BY date_soumission DESC").all();
  }
  res.json({ dossiers });
});

app.post("/api/dossiers", (req, res) => {
  const { type_acte, priorite, date_evenement, nom_concerne, prenom_concerne } = req.body;
  const result = db.prepare(`
    INSERT INTO dossiers (type_acte, priorite, demandeur_id, date_evenement, nom_concerne, prenom_concerne) 
    VALUES (?, ?, 2, ?, ?, ?)
  `).run(type_acte, priorite ? 1 : 0, date_evenement, nom_concerne, prenom_concerne);
  
  res.json({ id: result.lastInsertRowid });
});

app.get("/api/dossiers/:id", (req, res) => {
  const dossier = db.prepare("SELECT dossiers.*, users.first_name, users.last_name, users.email FROM dossiers JOIN users ON dossiers.demandeur_id = users.id WHERE dossiers.id = ?").get(req.params.id);
  if (dossier) {
    res.json(dossier);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

app.put("/api/dossiers/:id/status", (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE dossiers SET statut = ? WHERE id = ?").run(status, req.params.id);
  res.json({ success: true });
});

const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server is running on port 3000");
  });
};

startServer();
