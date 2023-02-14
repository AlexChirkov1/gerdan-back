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
            blob: {
                type: Sequelize.DataTypes.BLOB,
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
