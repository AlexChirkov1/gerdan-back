'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('Pixels', 'gerdan_to_pixels');
        await queryInterface.dropTable('Pixels');
        await queryInterface.dropTable('Gerdans');
    },

    async down(queryInterface) {
        await queryInterface.createTable('Gerdans', {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            createdAt: Sequelize.DataTypes.DATE,
            updatedAt: Sequelize.DataTypes.DATE,
            userId: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false
            },
            name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            width: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            height: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            pixelSize: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            backgroundColor: {
                type: Sequelize.DataTypes.CHAR(7),
                allowNull: false
            },
            migrated: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            }
        });

        await queryInterface.createTable('Pixels', {
            uuid: {
                type: Sequelize.DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                unique: true,
                defaultValue: Sequelize.DataTypes.UUIDV4
            },
            x: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false
            },
            y: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false
            },
            color: {
                type: Sequelize.DataTypes.CHAR(7),
                allowNull: false
            },
            index: Sequelize.DataTypes.INTEGER,
            indexColor: Sequelize.DataTypes.CHAR(7),
            indexCoordX: Sequelize.DataTypes.FLOAT,
            indexCoordY: Sequelize.DataTypes.FLOAT,
            gerdanId: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false
            }
        });

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
    }
};
