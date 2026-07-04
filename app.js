const cors = require('cors');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { default: rateLimit, ipKeyGenerator } = require('express-rate-limit');
const morgan = require('morgan');
const { sequelize } = require('./utils/db');
const { BLOCKED_USER_AGENTS } = require('./utils/constants');
const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '256kb' }));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

if (process.env.NODE_ENV !== 'production') {
    app.set('json spaces', 2);
}

const makeLimiter = ({ windowMs, max, message }) => rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => req.ip || ipKeyGenerator(req),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    },
});

const burstLimiter = makeLimiter({
    windowMs: 60 * 1000,
    max: 120,
    message: 'Too many requests in a short time. Please slow down.',
});

const domainLimiter = makeLimiter({
    windowMs: 72 * 60 * 60 * 1000,
    max: 10000,
    message: 'Too many API requests. Please slow down.',
});
const assetLimiter = makeLimiter({
    windowMs: 72 * 60 * 60 * 1000,
    max: 10000,
    message: 'Too many asset requests. Please slow down.',
});

app.use((req, res, next) => {
    const ua = (req.get('user-agent') || '').toLowerCase();
    if (ua && BLOCKED_USER_AGENTS.some(bot => ua.includes(bot))) {
        res.set('Cache-Control', 'no-store');
        return res.status(403).json({ error: 'Automated access by this client is not allowed.' });
    }
    next();
});
app.use(burstLimiter);


app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=300');
    next();
});

fs.readdirSync(path.resolve(__dirname, 'routes')).forEach(file => {
    if (file.endsWith('.js')) {
        const handler_file = require(path.join(__dirname, 'routes', file));
        app.use(`/api${handler_file.base_route}`, domainLimiter, handler_file.handler());
    }
});

app.use('/assets', assetLimiter, express.static(path.join(__dirname, 'assets'), { maxAge: '7d' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

app.use((req, res) => {
    res.set('Cache-Control', 'no-store');
    res.status(404).json({
        error: "Route not found",
        at: new Date().toISOString(),
        method: req.method,
        hostname: req.hostname,
        path: req.originalUrl,
        query: req.query
    });
});

app.use((err, req, res, next) => {
    console.error(`[Error Handler] ${err.stack}`);
    res.set('Cache-Control', 'no-store');
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'An unexpected server error occurred.'
            : err.message
    });
});

const PORT = 3000;

const server = app.listen(PORT, () => {
    console.log(`Server Started at http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing server');
    server.close(async () => {
        console.log('HTTP server closed');

        try {
            await sequelize.close();
            console.log('Database connection closed.');
        } catch (err) {
            console.error('Error closing database:', err);
        }

        process.exit(0);
    })
});