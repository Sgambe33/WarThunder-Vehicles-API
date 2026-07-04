const {Sequelize} = require('sequelize');
const path = require('path');
const db = {};
const sequelize = new Sequelize({
    dialect: 'sqlite',
    logging: null,
    storage: path.resolve(__dirname, 'vehiclesdb.sqlite3'),
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
