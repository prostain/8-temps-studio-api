'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('UserVideo', {
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                foreignKey: true
            },
            videoId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                foreignKey: true
            },
            chunk_size: {
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async(queryInterface, Sequelize) => {

        await queryInterface.dropTable('UserVideo');

    }
};