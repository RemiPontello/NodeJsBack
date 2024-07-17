-- Insérer des auteurs
INSERT INTO `auteurs` (`nom`, `prenom`, `annee_naissance`, `annee_mort`) VALUES
('Hugo', 'Victor', 1802, 1885),
('Dumas', 'Alexandre', 1802, 1870),
('Flaubert', 'Gustave', 1821, 1880),
('Proust', 'Marcel', 1871, 1922),
('Zola', 'Émile', 1840, 1902),
('Saint-Exupéry', 'Antoine de', 1900, 1944),
('Camus', 'Albert', 1913, 1960),
('Duras', 'Marguerite', 1914, 1996),
('Sartre', 'Jean-Paul', 1905, 1980),
('Maupassant', 'Guy de', 1850, 1893);

-- Insérer des livres
INSERT INTO `livres` (`titre`, `annee_publication`, `quantite`) VALUES
('Les Misérables', 1862, 5),
('Le Comte de Monte-Cristo', 1844, 4),
('Madame Bovary', 1857, 3),
('À la recherche du temps perdu', 1913, 2),
('L''Assommoir', 1877, 2),
('Le Petit Prince', 1943, 10),
('L''Étranger', 1942, 8),
('L''Amant', 1984, 3),
('La Nausée', 1938, 2),
('Bel-Ami', 1885, 4);

-- Insérer des relations entre auteurs et livres
INSERT INTO `auteur_livre` (`id_auteur`, `id_livre`) VALUES
((SELECT id FROM `auteurs` WHERE nom='Hugo' AND prenom='Victor'), (SELECT id FROM `livres` WHERE titre='Les Misérables')),
((SELECT id FROM `auteurs` WHERE nom='Dumas' AND prenom='Alexandre'), (SELECT id FROM `livres` WHERE titre='Le Comte de Monte-Cristo')),
((SELECT id FROM `auteurs` WHERE nom='Flaubert' AND prenom='Gustave'), (SELECT id FROM `livres` WHERE titre='Madame Bovary')),
((SELECT id FROM `auteurs` WHERE nom='Proust' AND prenom='Marcel'), (SELECT id FROM `livres` WHERE titre='À la recherche du temps perdu')),
((SELECT id FROM `auteurs` WHERE nom='Zola' AND prenom='Émile'), (SELECT id FROM `livres` WHERE titre='L''Assommoir')),
((SELECT id FROM `auteurs` WHERE nom='Saint-Exupéry' AND prenom='Antoine de'), (SELECT id FROM `livres` WHERE titre='Le Petit Prince')),
((SELECT id FROM `auteurs` WHERE nom='Camus' AND prenom='Albert'), (SELECT id FROM `livres` WHERE titre='L''Étranger')),
((SELECT id FROM `auteurs` WHERE nom='Duras' AND prenom='Marguerite'), (SELECT id FROM `livres` WHERE titre='L''Amant')),
((SELECT id FROM `auteurs` WHERE nom='Sartre' AND prenom='Jean-Paul'), (SELECT id FROM `livres` WHERE titre='La Nausée')),
((SELECT id FROM `auteurs` WHERE nom='Maupassant' AND prenom='Guy de'), (SELECT id FROM `livres` WHERE titre='Bel-Ami'));
