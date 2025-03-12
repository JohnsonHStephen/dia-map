const express = require('express');
const path = require('path');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
console.log(`Running in ${env} mode`);
const envPath = path.join(__dirname, '..', `.env.${env}`);
console.log(`Running in ${envPath}`);

require('dotenv').config({ path: envPath });

const app = express();
const port = process.env.PORT;

let locationTypes = new Map();

fs.readFile(path.join(__dirname, '..', 'data', 'locations.json'), 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const locations = JSON.parse(data);

    for (const location of locations) {
        locationTypes.set(location.grid, location.types);
    }
});

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/grid', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'data', 'locations.json'));
});

app.get('/random/:grid', (req, res) => {
    const roll = Math.floor(Math.random() * 12);
    const types = locationTypes.get(req.params.grid);
    
    if (!types) {
        res.status(404).send('Grid not found');
        return;
    }

    if (roll < 3) {
        res.sendFile(path.join(__dirname, 'frontend', 'environment', 'extreme_heat.html'));
        return;
    }

    if (roll < 6) {
        res.sendFile(path.join(__dirname, 'frontend', 'environment', 'choking_miasma.html'));
        return;
    }

    if (roll < 9) {
        res.sendFile(path.join(__dirname, 'frontend', 'environment', 'psychic_evil.html'));
        return;
    }

    if (roll < 10) {
        res.sendFile(path.join(__dirname, 'frontend', 'environment', 'acid_rain.html'));
        return;
    }

    if (roll < 11) {
        res.sendFile(path.join(__dirname, 'frontend', 'environment', 'rain_of_stones.html'));
        return;
    }

    let type = types[Math.floor(Math.random() * types.length)];
    if (types.length < 1)
        type = 'wastelands';

    res.sendFile(path.join(__dirname, 'frontend', 'environment', type + '.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});