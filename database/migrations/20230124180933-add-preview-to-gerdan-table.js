'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Gerdans', 'previewId', Sequelize.DataTypes.UUID);
        await queryInterface.addConstraint('Gerdans', {
            fields: ['previewId'],
            type: 'foreign key',
            name: 'preview_to_files',
            references: {
                table: 'Files',
                field: 'id'
            },
            onDelete: 'set null',
            onUpdate: 'set null',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeConstraint('Gerdans', 'preview_to_files');
        await queryInterface.removeColumn('Gerdans', 'previewId');
    }
};
