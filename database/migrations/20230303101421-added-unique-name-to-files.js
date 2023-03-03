'use strict';
const { randomUUID } = require('crypto');
const { QueryTypes } = require('sequelize');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Files', 'name', { type: Sequelize.DataTypes.UUID });
        await queryInterface.addColumn('Files', 'userId', { type: Sequelize.DataTypes.INTEGER });

        const count = await countFiles(queryInterface);
        if (!count) return;

        const LIMIT = 1;
        for (let offset = 0; offset < count; offset += LIMIT) {
            const file = await getFile(queryInterface, offset);
            const userId = await getUserIdByFileId(queryInterface, file.id);
            await updateFile(queryInterface, file.id, randomUUID(), userId);
        }

        await queryInterface.changeColumn('Files', 'name', {
            type: Sequelize.DataTypes.UUID,
            allowNull: false,
        });
        await queryInterface.changeColumn('Files', 'userId', {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Files', 'name');
        await queryInterface.removeColumn('Files', 'userId');
    }
};

async function getFile(queryInterface, offset) {
    return await queryInterface.sequelize.query(
        {
            query: 'SELECT * FROM "Files" ORDER BY "id" ASC LIMIT ? OFFSET ?;',
            values: [1, offset]
        },
        {
            type: QueryTypes.SELECT,
            plain: true
        }
    );
}

async function countFiles(queryInterface) {
    const { count } = await queryInterface.sequelize.query('SELECT COUNT("id") AS "count" FROM "Files";', {
        type: QueryTypes.SELECT,
        plain: true,
    });
    return count;
}

async function getUserIdByFileId(queryInterface, fileId) {
    const { userId } = await queryInterface.sequelize.query(
        {
            query: 'SELECT "userId" FROM "Gerdans" WHERE "previewId"=?;',
            values: [fileId]
        },
        {
            type: QueryTypes.SELECT,
            plain: true
        }
    );
    return userId;
}

async function updateFile(queryInterface, fileId, name, userId) {
    await queryInterface.sequelize.query({
        query: 'UPDATE "Files" SET "name"=?, "userId"=? WHERE "id"=?;',
        values: [name, userId, fileId]
    });
}
