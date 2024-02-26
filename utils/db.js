const {Sequelize} = require('sequelize');
const db = {}
const sequelize = new Sequelize({
        storage: './database.sqlite3',
        dialect: 'sqlite',
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    })

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
