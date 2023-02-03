'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            createdAt: Sequelize.DataTypes.DATE,
            updatedAt: Sequelize.DataTypes.DATE,
            firstName: Sequelize.DataTypes.STRING,
            lastName: Sequelize.DataTypes.STRING,
            username: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            email: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: Sequelize.DataTypes.CHAR(128),
            salt: Sequelize.DataTypes.CHAR(32)
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('Users');
    }
};
