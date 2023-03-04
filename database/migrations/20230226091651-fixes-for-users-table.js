'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Users', 'username', {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Users', 'username', {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
        });
    }
};
