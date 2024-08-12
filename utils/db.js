const {Sequelize} = require('sequelize');
const db = {};
const sequelize = new Sequelize({
    database: process.env.DATABASE,
    username: process.env.PG_USER,
    password: process.env.PG_PWD,
    host: process.env.PG_HOST,
    port: 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
