'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Projects', {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            createdAt: Sequelize.DataTypes.DATE,
            updatedAt: Sequelize.DataTypes.DATE,
            name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1
            },
            backgroundColor: {
                type: Sequelize.DataTypes.CHAR(7),
            },
            schema: {
                type: Sequelize.DataTypes.TEXT,
            },
            colormap: {
                type: Sequelize.DataTypes.TEXT,
            },
            userId: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false
            },
            previewId: {
                type: Sequelize.DataTypes.INTEGER,
            }
        });

        await queryInterface.addConstraint('Projects', {
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
        await queryInterface.dropTable('Projects');
    }
};
