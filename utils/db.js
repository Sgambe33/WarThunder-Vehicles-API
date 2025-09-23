const {Sequelize} = require('sequelize');
const db = {};
const sequelize = new Sequelize({
    dialect: 'sqlite',
    logging: null,
    storage: './utils/vehiclesdb.sqlite3',
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
