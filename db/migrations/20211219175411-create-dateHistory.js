'use strict';
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('DateHistories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            price: {
                type: Sequelize.DOUBLE
            },
            VAT: {
                type: Sequelize.DOUBLE
            },
            subscriptionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                foreignKey: true,
                references: {
                    model: 'Subscriptions',
                    key: 'id'
                }
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
        await queryInterface.dropTable('DateHistories');
    }
};