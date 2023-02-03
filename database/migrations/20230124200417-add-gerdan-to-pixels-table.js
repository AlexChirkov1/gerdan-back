'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Pixels', 'gerdanId', Sequelize.DataTypes.INTEGER, { allowNull: false });
        await queryInterface.addConstraint('Pixels', {
            fields: ['gerdanId'],
            type: 'foreign key',
            name: 'gerdan_to_pixels',
            references: {
                table: 'Gerdans',
                field: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'cascade',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeConstraint('Pixels', 'gerdan_to_pixels');
        await queryInterface.removeColumn('Pixels', 'gerdanId');
    }
};
