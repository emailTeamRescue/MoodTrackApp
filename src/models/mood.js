const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {

    return sequelize.define('Mood', {
        emoji: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    });
};