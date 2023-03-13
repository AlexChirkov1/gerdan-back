'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Files', 'blob', {
            type: Sequelize.DataTypes.BLOB,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Files', 'blob', {
            type: Sequelize.DataTypes.BLOB,
            allowNull: false,
        });
    }
};
