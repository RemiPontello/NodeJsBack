const express = require('express');
const router = express.Router();
const db = require('../database');

// POST /emprunt
router.post('/', (req, res) => {
    const { id_livre, nom, prenom, email } = req.body;
    if (!id_livre || !nom || !prenom || !email) {
        return res.status(400).json({ message: 'Paramètres invalides' });
    }

    db.serialize(() => {
        const checkLivreQuery = `SELECT quantite - (SELECT COUNT(*) FROM emprunt WHERE id_livre = ? AND date_retour IS NULL) AS quantite_disponible FROM livres WHERE id = ?`;
        
        db.get(checkLivreQuery, [id_livre, id_livre], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row || row.quantite_disponible <= 0) {
                return res.status(400).json({ message: 'Livre non empruntable (quantité disponible = zéro)' });
            }

            const upsertPersonQuery = `INSERT INTO personnes (nom, prenom, email) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET nom = excluded.nom, prenom = excluded.prenom`;
            
            db.run(upsertPersonQuery, [nom, prenom, email], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                const id_personne = this.lastID;
                const insertEmpruntQuery = `INSERT INTO emprunt (id_livre, id_personne, date_emprunt) VALUES (?, ?, DATE('now'))`;
                
                db.run(insertEmpruntQuery, [id_livre, id_personne], function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.status(201).json({ id: this.lastID });
                });
            });
        });
    });
});

// PUT /emprunt/{id}
router.put('/:id', (req, res) => {
    const query = `UPDATE emprunt SET date_retour = DATE('now') WHERE id = ?`;

    db.run(query, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Emprunt modifié avec succès' });
    });
});

module.exports = router;
