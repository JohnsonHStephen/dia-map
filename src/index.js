const express = require('express');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
console.log(`Running in ${env} mode`);
const envPath = path.join(__dirname, '..', `.env.${env}`);
console.log(`Running in ${envPath}`);

require('dotenv').config({ path: envPath });

const app = express();
const port = process.env.PORT;

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/grid', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'data', 'locations.json'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});