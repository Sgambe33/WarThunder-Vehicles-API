require('dotenv').config();
const cors = require('cors');
const fs = require(`fs`);
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL_PROD);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

const app = express();
app.use(cors())
app.use(express.json());
app.set('json spaces', 2)

var module_files = fs.readdirSync(path.resolve(__dirname, `routes`), {
    withFileTypes: true,
});

module_files.forEach((file) => {
    if (!file.name.endsWith(`.js`)) {
        return;
    }
    let handler_file = require(path.join(__dirname, `routes`, file.name).replace(`.js`, ``));
    let route = handler_file.base_route;
    console.log(handler_file)
    let handler = handler_file.handler();

    app.use(`/api${route}`, cors(), handler);
});

app.use("/assets", express.static('assets'));

app.use('*', (req, res) => {
    res.json({
        at: new Date().toISOString(),
        method: req.method,
        hostname: req.hostname,
        ip: req.ip,
        query: req.query,
        headers: req.headers,
        cookies: req.cookies,
        params: req.params
    })
        .end()
})

app.listen(3000, () => {
    console.log(`Server Started at http://localhost:${3000}`)
})