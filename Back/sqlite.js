const fs = require('fs');
const path = require('path');
const db = require('./database');

const schemaPath = path.resolve(__dirname, 'Bibliotheque.sql');
const dataPath = path.resolve(__dirname, 'seed.sql');

function executeSqlFile(filePath, callback) {
  fs.readFile(filePath, 'utf8', (err, sql) => {
    if (err) {
      console.error(`Erreur lors de la lecture du fichier ${filePath}:`, err.message);
      callback(err);
      return;
    }
    db.exec(sql, (err) => {
      if (err) {
        console.error(`Erreur lors de l'exécution du fichier ${filePath}:`, err.message);
        callback(err);
        return;
      }
      console.log(`Fichier ${filePath} exécuté avec succès.`);
      callback(null);
    });
  });
}

executeSqlFile(schemaPath, (err) => {
  if (err) return;

  executeSqlFile(dataPath, (err) => {
    if (err) return;

    console.log('Base de données initialisée avec succès.');
  });
});
