require('dotenv').config();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
app.use(cors());
app.use(express.json());
app.set('json spaces', 2);

fs.readdirSync(path.resolve(__dirname, 'routes')).forEach(file => {
    if (file.endsWith('.js')) {
        const handler_file = require(path.join(__dirname, 'routes', file));
        app.use(`/api${handler_file.base_route}`, cors(), handler_file.handler());
    }
});

app.use('/assets', express.static('assets'));

app.use('*', (req, res) => {
    res.json({
        at: new Date().toISOString(), method: req.method, hostname: req.hostname, query: req.query, params: req.params
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Started at http://localhost:${PORT}`);
});