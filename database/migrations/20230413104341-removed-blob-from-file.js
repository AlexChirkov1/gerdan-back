'use strict';

module.exports = {
    async up(queryInterface) {
        await queryInterface.removeColumn('Files', 'blob');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('Files', 'blob', {
            type: Sequelize.DataTypes.BLOB,
            allowNull: true,
        });
    }
};
