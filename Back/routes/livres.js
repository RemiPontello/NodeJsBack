const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');

// Middleware pour générer l'ETag
router.use((req, res, next) => {
    res.setHeader('ETag', crypto.createHash('md5').update(JSON.stringify(req.body)).digest('hex'));
    next();
});

// GET /livre
router.get('/', (req, res) => {
    const query = `
        SELECT l.id, l.titre, l.annee_publication, l.quantite, 
               a.id as auteur_id, a.nom as auteur_nom, a.prenom as auteur_prenom 
        FROM livres l
        LEFT JOIN auteur_livre al ON l.id = al.id_livre
        LEFT JOIN auteurs a ON al.id_auteur = a.id`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const livres = {};
        rows.forEach(row => {
            if (!livres[row.id]) {
                livres[row.id] = {
                    id: row.id,
                    titre: row.titre,
                    annee_publication: row.annee_publication,
                    quantite: row.quantite,
                    auteurs: []
                };
            }
            if (row.auteur_id) {
                livres[row.id].auteurs.push({
                    id: row.auteur_id,
                    nom: row.auteur_nom,
                    prenom: row.auteur_prenom
                });
            }
        });
        res.json(Object.values(livres));
    });
});

// GET /livre/{id}
router.get('/:id', (req, res) => {
    const query = `
        SELECT l.id, l.titre, l.annee_publication, l.quantite, 
               a.id as auteur_id, a.nom as auteur_nom, a.prenom as auteur_prenom 
        FROM livres l
        LEFT JOIN auteur_livre al ON l.id = al.id_livre
        LEFT JOIN auteurs a ON al.id_auteur = a.id
        WHERE l.id = ?`;

    db.all(query, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }
        const livre = {
            id: rows[0].id,
            titre: rows[0].titre,
            annee_publication: rows[0].annee_publication,
            quantite: rows[0].quantite,
            auteurs: rows.map(row => ({
                id: row.auteur_id,
                nom: row.auteur_nom,
                prenom: row.auteur_prenom
            }))
        };
        res.json(livre);
    });
});

// POST /livre
router.post('/', (req, res) => {
    const { titre, annee_publication, quantite, auteurs } = req.body;
    if (!titre || !annee_publication || !auteurs || !Array.isArray(auteurs)) {
        return res.status(400).json({ message: 'Paramètres invalides' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        const query = `INSERT INTO livres (titre, annee_publication, quantite) VALUES (?, ?, ?)`;
        const quantiteValue = quantite ? quantite : 1;

        db.run(query, [titre, annee_publication, quantiteValue], function(err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }

            const livreId = this.lastID;
            const auteurQuery = `INSERT INTO auteur_livre (id_auteur, id_livre) VALUES (?, ?)`;

            for (const auteurId of auteurs) {
                db.run(auteurQuery, [auteurId, livreId], (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Auteur non trouvé' });
                    }
                });
            }
            
            db.run('COMMIT', (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ id: livreId });
            });
        });
    });
});

// PUT /livre/{id}
router.put('/:id', (req, res) => {
    const { titre, annee_publication, auteurs } = req.body;
    if (!titre || !annee_publication || !auteurs || !Array.isArray(auteurs)) {
        return res.status(400).json({ message: 'Paramètres invalides' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        const query = `UPDATE livres SET titre = ?, annee_publication = ? WHERE id = ?`;

        db.run(query, [titre, annee_publication, req.params.id], function(err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }

            const deleteQuery = `DELETE FROM auteur_livre WHERE id_livre = ?`;
            const insertQuery = `INSERT INTO auteur_livre (id_auteur, id_livre) VALUES (?, ?)`;

            db.run(deleteQuery, [req.params.id], (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }

                for (const auteurId of auteurs) {
                    db.run(insertQuery, [auteurId, req.params.id], (err) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: 'Auteur non trouvé' });
                        }
                    });
                }
                
                db.run('COMMIT', (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.status(200).json({ message: 'Livre modifié avec succès' });
                });
            });
        });
    });
});

// GET /livre/{id}/quantite
router.get('/:id/quantite', (req, res) => {
    const query = `
        SELECT l.quantite, 
               (l.quantite - COUNT(e.id)) AS quantite_disponible 
        FROM livres l
        LEFT JOIN emprunt e ON l.id = e.id_livre AND e.date_retour IS NULL
        WHERE l.id = ?`;

    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }
        res.json({ quantite_totale: row.quantite, quantite_disponible: row.quantite_disponible });
    });
});

// PUT /livre/{id}/quantite
router.put('/:id/quantite', (req, res) => {
    const { quantite } = req.body;
    if (!quantite || quantite < 0) {
        return res.status(400).json({ message: 'Quantité invalide' });
    }

    const checkQuery = `
        SELECT l.quantite, 
               (l.quantite - COUNT(e.id)) AS quantite_disponible 
        FROM livres l
        LEFT JOIN emprunt e ON l.id = e.id_livre AND e.date_retour IS NULL
        WHERE l.id = ?`;

    db.get(checkQuery, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }
        if (quantite < (row.quantite - row.quantite_disponible)) {
            return res.status(400).json({ message: 'Quantité inférieure au nombre d\'emprunts en cours' });
        }

        const updateQuery = `UPDATE livres SET quantite = ? WHERE id = ?`;
        db.run(updateQuery, [quantite, req.params.id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Quantité modifiée avec succès' });
        });
    });
});

// DELETE /livre/{id}
router.delete('/:id', (req, res) => {
    const checkQuery = `
        SELECT COUNT(e.id) AS emprunts_en_cours 
        FROM livres l
        LEFT JOIN emprunt e ON l.id = e.id_livre AND e.date_retour IS NULL
        WHERE l.id = ?`;

    db.get(checkQuery, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }
        if (row.emprunts_en_cours > 0) {
            return res.status(400).json({ message: 'Des emprunts sont en cours' });
        }

        const deleteQuery = `DELETE FROM livres WHERE id = ?`;
        db.run(deleteQuery, [req.params.id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Livre supprimé avec succès' });
        });
    });
});

module.exports = router;
