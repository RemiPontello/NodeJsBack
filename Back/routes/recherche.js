const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /recherche/{mots}
router.get('/:mots', (req, res) => {
    const mots = req.params.mots.split(' ');
    const placeholders = mots.map(() => '%').join(' ');
    const query = `
        SELECT l.id, l.titre, l.annee_publication, l.quantite, 
               a.nom as auteur_nom, a.prenom as auteur_prenom 
        FROM livres l
        LEFT JOIN auteur_livre al ON l.id = al.id_livre
        LEFT JOIN auteurs a ON al.id_auteur = a.id
        WHERE l.titre LIKE ? OR a.nom LIKE ? OR a.prenom LIKE ?
        ORDER BY l.titre`;

    db.all(query, Array(3).fill(placeholders), (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;
