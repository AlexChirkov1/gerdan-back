'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Projects', 'alias', {
            type: Sequelize.DataTypes.TEXT,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Projects', 'alias');
    }
};
