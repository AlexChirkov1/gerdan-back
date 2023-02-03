'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Gerdans', {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            createdAt: Sequelize.DataTypes.DATE,
            updatedAt: Sequelize.DataTypes.DATE,
            userId: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false
            },
            name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            width: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            height: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            pixelSize: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            backgroundColor: {
                type: Sequelize.DataTypes.CHAR(7),
                allowNull: false
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('Gerdans');
    }
};
