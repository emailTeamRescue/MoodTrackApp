const {Sequelize} = require('sequelize');

// This file holds the collection of models
// All referenced models will be synced with database 

// Initiating sequelize using credentials and details available in .env
const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    dialect: 'mysql'
});

// referencing sequelize with models 
const User = require('./user')(sequelize);
const Mood = require('./mood')(sequelize);

User.hasMany(Mood);
Mood.belongsTo(User);

module.exports = {sequelize, User, Mood};