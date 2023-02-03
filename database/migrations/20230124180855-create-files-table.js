'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Files', {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            createdAt: Sequelize.DataTypes.DATE,
            path: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('Files');
    }
};
