const express = require('express');
const path = require('path');
const fs = require('fs');
const mariadb = require('mariadb');

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

app.use(express.json());

app.get('/grid', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'data', 'locations.json'));
});


app.post('/location/:grid', (req, res) => {
    try {
        const column = req.params.grid.charAt(0);
        const row = req.params.grid.charAt(1);

        if (column < 'A' || column > 'J' || row < 1 || row > 6) {
            res.status(400).send('Invalid grid');
            return;
        }

        const gridPath = path.join(__dirname, 'frontend', 'grids', row, column);
        if (!fs.existsSync(gridPath)) {
            fs.mkdirSync(gridPath, { recursive: true });
        }

        let number = 1;
        while (fs.existsSync(path.join(gridPath, number + '.html'))) {
            number++;
        }

        fs.writeFileSync(path.join(gridPath, number + '.html'), req.body.content || '', { flag: 'w' });
        res.status(201).send(`Grid ${column}${row}${number} created`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to add grid');
    }
});

app.get('/location/:grid/:number', (req, res) => {
    const column = req.params.grid.charAt(0);
    const row = req.params.grid.charAt(1);

    if (column < 'A' || column > 'J' || row < 1 || row > 6) {
        res.status(400).send('Invalid grid');
        return;
    }

    if (!fs.existsSync(path.join(__dirname, 'frontend', 'grids', row, column, req.params.number + '.html'))) {
        res.status(404).send('Grid not found');
        return;
    }

    res.sendFile(path.join(__dirname, 'frontend', 'grids', row, column, req.params.number + '.html'));
});

app.delete('/location/:grid/:number', (req, res) => {
    try {
        const column = req.params.grid.charAt(0);
        const row = req.params.grid.charAt(1);

        if (column < 'A' || column > 'J' || row < 1 || row > 6) {
            res.status(400).send('Invalid grid');
            return;
        }

        if (!fs.existsSync(path.join(__dirname, 'frontend', 'grids', row, column, req.params.number + '.html'))) {
            res.status(404).send('Grid not found');
            return;
        }

        fs.rmSync(path.join(__dirname, 'frontend', 'grids', row, column, req.params.number + '.html'));
        res.status(200).send('Grid deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to delete grid');
    }
});

app.patch('/location/:grid/:number', (req, res) => {
    const column = req.params.grid.charAt(0);
    const row = req.params.grid.charAt(1);
    const grid = req.params.grid;
    const location = req.params.number;
    console.log('Updating grid ' + grid + ' location ' + location);

    try {
        fs.writeFileSync(path.join(__dirname, 'frontend', 'grids', row, column, location + '.html'), req.body.content, { flag: 'w' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to update grid');
        return;
    }

    res.status(200).send('Grid updated');
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

app.get('/grids/:grid', (req, res) => {
    const column = req.params.grid.charAt(0);
    const row = req.params.grid.charAt(1);

    if (column < 'A' || column > 'J' || row < 1 || row > 6) {
        res.status(400).send('Invalid grid');
        return;
    }

    if (!fs.existsSync(path.join(__dirname, 'frontend', 'grids', row, column))) {
        res.status(404).send('Grid not found');
        return;
    }

    for (const file of fs.readdirSync(path.join(__dirname, 'frontend', 'grids', row, column))) {
        res.write(file.split('.')[0] + ',');
    }

    res.end();
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});