const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database("quiz.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'student'
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS results(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    score INTEGER,
    total INTEGER
  )`);
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/register", (req, res) => {
  const { name, email, username, password } = req.body;
  if (!name || !email || !username || !password) return res.status(400).json({ error: "All fields required" });
  db.run(`INSERT INTO users(name,email,username,password) VALUES(?,?,?,?)`, [name, email, username, password], (err) => {
    if (err) return res.status(400).json({ error: "User exists or DB error" });
    res.json({ success: true });
  });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username=? AND password=?`, [username, password], (err, row) => {
    if (err || !row) return res.status(400).json({ error: "Invalid login" });
    res.json({ token: "dummy-" + username, role: row.role, user: row.username });
  });
});

app.get("/api/questions", (req, res) => {
  const q = [];
  for (let i = 1; i <= 30; i++) {
    q.push({ id: i, q: `Sample Question ${i}?`, a: ["Option A", "Option B", "Option C", "Option D"], correct: 2 });
  }
  res.json(q);
});

app.post("/api/submit", (req, res) => {
  const { user, answersOnShuffled } = req.body;
  let score = 0;
  (answersOnShuffled || []).forEach(a => { if (a === 2) score++; });
  db.run(`INSERT INTO results(username,score,total) VALUES(?,?,?)`, [user, score, 30], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ score });
  });
});

app.get("/api/results", (req, res) => {
  db.all(`SELECT * FROM results ORDER BY id DESC`, [], (err, rows) => res.json(rows));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Backend running on", PORT));
