require('dotenv').config();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());
app.set('json spaces', 2);

const domainLimiter = rateLimit({
    windowMs: 72 * 60 * 60 * 1000,
    max: 10000,
    keyGenerator: (req, res) => req.headers.origin || req.headers.referer || req.ip,
    message: { error: "Too many API requests. Please slow down." },
});

const assetLimiter = rateLimit({
    windowMs: 72 * 60 * 60 * 1000,
    max: 10000,
    keyGenerator: (req, res) => req.headers.origin || req.headers.referer || req.ip,
    message: { error: "Too many asset requests. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
});

fs.readdirSync(path.resolve(__dirname, 'routes')).forEach(file => {
    if (file.endsWith('.js')) {
        const handler_file = require(path.join(__dirname, 'routes', file));
        app.use(`/api${handler_file.base_route}`, domainLimiter, cors(), handler_file.handler());
    }
});

app.use('/assets', assetLimiter, express.static('assets'));
app.use(express.static('public'));

app.use('/{*unrouted}', (req, res) => {
    res.json({
        at: new Date().toISOString(), method: req.method, hostname: req.hostname, query: req.query, params: req.params
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Started at http://localhost:${PORT}`);
});