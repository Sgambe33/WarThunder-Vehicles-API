const cors = require('cors');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { default: rateLimit, ipKeyGenerator } = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '256kb' }));

if (process.env.NODE_ENV !== 'production') {
    app.set('json spaces', 2);
}

const sharedLimiterOptions = {
    windowMs: 72 * 60 * 60 * 1000,
    max: 10000,
    keyGenerator: (req) => req.headers.origin || req.headers.referer || ipKeyGenerator(req),
    standardHeaders: true,
    legacyHeaders: false,
};

const createLimiter = (type, message) => rateLimit({
    ...sharedLimiterOptions,
    message: { error: message },
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    },
});

const domainLimiter = createLimiter('api', 'Too many API requests. Please slow down.');
const assetLimiter = createLimiter('asset', 'Too many asset requests. Please slow down.');

fs.readdirSync(path.resolve(__dirname, 'routes')).forEach(file => {
    if (file.endsWith('.js')) {
        const handler_file = require(path.join(__dirname, 'routes', file));
        app.use(`/api${handler_file.base_route}`, domainLimiter, handler_file.handler());
    }
});

app.use('/assets', assetLimiter, express.static('assets'));
app.use(express.static('public'));


app.use('/{*unrouted}', (req, res) => {
    res.json({
        at: new Date().toISOString(), method: req.method, hostname: req.hostname, query: req.query, params: req.params
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server Started at http://localhost:${PORT}`);
});
