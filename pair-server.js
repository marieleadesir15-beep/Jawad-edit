const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

const PAIRS_FILE = path.join(__dirname, 'pairs.json');
function loadPairs() {
  if (!fs.existsSync(PAIRS_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(PAIRS_FILE, 'utf8') || '{}'); } catch (e) { return {}; }
}
function savePairs(p) { fs.writeFileSync(PAIRS_FILE, JSON.stringify(p, null, 2)); }
function genCode() { return Math.random().toString(36).replace(/[^a-zA-Z0-9]/g, '').slice(2, 8).toUpperCase(); }

app.post('/pair', (req, res) => {
  const { number } = req.body || {};
  if (!number) return res.status(400).json({ error: 'number required' });
  const clean = String(number).replace(/\D/g, '');
  if (!clean) return res.status(400).json({ error: 'invalid number' });
  const code = genCode();
  const pairs = loadPairs();
  pairs[clean] = { code, created: Date.now(), expires: Date.now() + 1000 * 60 * 5 };
  savePairs(pairs);
  return res.json({ ok: true, code, expiresIn: 300 });
});

app.get('/pair/:number', (req, res) => {
  const num = String(req.params.number || '').replace(/\D/g, '');
  const pairs = loadPairs();
  if (!pairs[num]) return res.status(404).json({ error: 'not found' });
  return res.json(pairs[num]);
});

const port = process.env.PAIR_PORT || 3001;
app.listen(port, () => console.log(`Pair server listening on ${port}`));
