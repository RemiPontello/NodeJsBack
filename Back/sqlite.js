const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');


const sqlFilePath = path.join(__dirname, 'Bibliotheque.sql');


const sql = fs.readFileSync(sqlFilePath, 'utf-8');

// Création d'une nouvelle base de données ou ouverture d'une base de données existante
const db = new sqlite3.Database('./biblio.db', (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
  } else {
    console.log('Connexion réussie à la base de données SQLite');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.exec(sql, (err) => {
    if (err) {
      console.error('Erreur lors de l\'initialisation de la base de données:', err.message);
    } else {
      console.log('Base de données initialisée avec succès');
    }
  });
}

module.exports = db;