const { gmd, config } = require('../lib');
const fs = require('fs');
const path = require('path');

const PAIRS_FILE = path.join(__dirname, '../pairs.json');
function loadPairs() { if (!fs.existsSync(PAIRS_FILE)) return {}; try { return JSON.parse(fs.readFileSync(PAIRS_FILE, 'utf8') || '{}'); } catch (e) { return {}; } }
function savePairs(p) { fs.writeFileSync(PAIRS_FILE, JSON.stringify(p, null, 2)); }
function genCode() { return Math.random().toString(36).replace(/[^a-zA-Z0-9]/g, '').slice(2, 8).toUpperCase(); }

// Commande .pair : .pair <numero-sans-plus-avec-code-pays>
// Génère un code de 6 caractères, l'enregistre dans pairs.json (expire 5 min) et renvoie le code en français.

gmd({ pattern: 'pair', desc: 'Générer un code de pairing', category: 'owner', react: '🔑', filename: __filename },
  async (client, msg, match, { from, isOwner, args, reply }) => {
    try {
      if (!args || args.length === 0) return reply('Utilisation : .pair <numero-avec-code-pays-sans+>\nExemple : .pair 50937081286\nOu utilisez le panneau web pour entrer votre numéro.');
      const number = String(args[0]).replace(/\D/g, '');
      if (!number) return reply('Numéro invalide.');
      const code = genCode();
      const pairs = loadPairs();
      pairs[number] = { code, created: Date.now(), expires: Date.now() + 1000 * 60 * 5 };
      savePairs(pairs);
      await reply(`✅ Code de pairing généré pour ${number}\n\n*Votre code de connexion Mr Christ X-MD est :* *${code}*\n\nCollez ce code dans le champ "Link device" du panneau dans les 5 minutes.`);
    } catch (err) {
      console.error(err);
      reply('❌ Erreur lors de la génération du code de pairing.');
    }
  }
);
