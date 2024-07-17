const express = require('express');
const router = express.Router();
const db = require('../database');

//GET
router.get('/', (req, res) => {
    const query = `SELECT * FROM auteurs`;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

//GET
router.get('/:id', (req, res) => {
    const query = `SELECT * FROM auteurs WHERE id = ?`;

    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Auteur non trouvé' });
        }
        res.json(row);
    });
});

//POST
router.post('/', (req, res) => {
    const { nom, prenom, annee_naissance, annee_mort } = req.body;
    if (!nom || !prenom || !annee_naissance) {
        return res.status(400).json({ message: 'Paramètres invalides' });
    }

    const query = `INSERT INTO auteurs (nom, prenom, annee_naissance, annee_mort) VALUES (?, ?, ?, ?)`;

    db.run(query, [nom, prenom, annee_naissance, annee_mort], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

//PUT
router.put('/:id', (req, res) => {
    const { nom, prenom, annee_naissance, annee_mort } = req.body;
    if (!nom || !prenom || !annee_naissance) {
        return res.status(400).json({ message: 'Paramètres invalides' });
    }

    const query = `UPDATE auteurs SET nom = ?, prenom = ?, annee_naissance = ?, annee_mort = ? WHERE id = ?`;

    db.run(query, [nom, prenom, annee_naissance, annee_mort, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Auteur modifié' });
    });
});

//DELETE
router.delete('/:id', (req, res) => {
    const checkQuery = `SELECT COUNT(*) AS count FROM auteur_livre WHERE id_auteur = ?`;

    db.get(checkQuery, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row.count > 0) {
            return res.status(400).json({ message: 'Auteur utilisé par un ou plusieurs livres' });
        }

        const deleteQuery = `DELETE FROM auteurs WHERE id = ?`;

        db.run(deleteQuery, [req.params.id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Auteur supprimé' });
        });
    });
});

module.exports = router;

