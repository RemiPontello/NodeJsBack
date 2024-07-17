const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.resolve(__dirname, 'biblio.db');

// Crée une nouvelle base de données s'il n'en existe pas
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données SQLite:', err.message);
  } else {
    console.log('Connexion réussie à la base de données SQLite');
  }
});

module.exports = db;
