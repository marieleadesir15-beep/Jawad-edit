const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

const PAIRS_FILE = path.join(__dirname, 'pairs.json');
function loadPairs() { if (!fs.existsSync(PAIRS_FILE)) return {}; try { return JSON.parse(fs.readFileSync(PAIRS_FILE, 'utf8') || '{}'); } catch (e) { return {}; } }
function savePairs(p) { fs.writeFileSync(PAIRS_FILE, JSON.stringify(p, null, 2)); }
function genCode() { return Math.random().toString(36).replace(/[^a-zA-Z0-9]/g, '').slice(2, 8).toUpperCase(); }

// Serve a simple French HTML panel located in /lib
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'lib', 'pairpanel.html'));
});
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'lib', 'pairpanel.css'));
});

app.post('/pair', (req, res) => {
  const { number } = req.body || {};
  if (!number) return res.status(400).json({ error: 'Le numéro est requis' });
  const clean = String(number).replace(/\D/g, '');
  if (!clean) return res.status(400).json({ error: 'Numéro invalide' });
  const code = genCode();
  const pairs = loadPairs();
  pairs[clean] = { code, created: Date.now(), expires: Date.now() + 1000 * 60 * 5 };
  savePairs(pairs);
  return res.json({ ok: true, code, expiresIn: 300, message: 'Code généré. Collez ce code dans WhatsApp → Link device.' });
});

app.get('/pair/:number', (req, res) => {
  const num = String(req.params.number || '').replace(/\D/g, '');
  const pairs = loadPairs();
  if (!pairs[num]) return res.status(404).json({ error: 'non trouvé' });
  return res.json(pairs[num]);
});

const port = process.env.PAIR_PORT || 3001;
app.listen(port, () => console.log(`Serveur de pairing démarré sur ${port}`));
