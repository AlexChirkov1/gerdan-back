'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
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
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('Pixels');
    }
};
