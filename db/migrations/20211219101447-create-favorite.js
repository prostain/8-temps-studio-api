"use strict";
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable("Favorites", {
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                foreignKey: true,
                references: {
                    model: "Users",
                    key: "id",
                },
            },
            videoId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                foreignKey: true,
                references: {
                    model: "videos",
                    key: "id",
                },
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable("Favorites");
    },
};