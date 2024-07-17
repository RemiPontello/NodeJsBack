
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = 8000;

const API_KEY = '8f94826adab8ffebbeadb4f9e161b2dc';

const auteursRouter = require('./routes/auteurs');
const livresRouter = require('./routes/livres');
const empruntsRouter = require('./routes/emprunts');
const rechercheRouter = require('./routes/recherche');

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === API_KEY) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden' });
    }
});

app.use('/api/auteurs', auteursRouter);
app.use('/api/livres', livresRouter);
app.use('/api/emprunts', empruntsRouter);
app.use('/api/recherche', rechercheRouter);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});