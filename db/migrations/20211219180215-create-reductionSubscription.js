'use strict';
module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('ReductionSubscription', {
            reductionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                foreignKey: true
            },
            subscriptionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                foreignKey: true
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
        await queryInterface.dropTable('ReductionSubscription');
    }
};