'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('Categories', [{
            name: "Danse",
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            name: "Sport",
            createdAt: new Date(),
            updatedAt: new Date()
        }]);

        const categories = await queryInterface.sequelize.query(
            `SELECT id from categories;`
        );

        const categoryRows = categories[0];

        await queryInterface.bulkInsert('Styles', [{
            name: "Clasique",
            categoryId: categoryRows[0].id,
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            name: "Moderne",
            categoryId: categoryRows[0].id,
            createdAt: new Date(),
            updatedAt: new Date()
        }]);

        await queryInterface.bulkInsert('Difficulties', [{
            name: "Débutant",
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            name: "Intermédiaire",
            createdAt: new Date(),
            updatedAt: new Date()
        }]);

    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Styles', null, {});
        await queryInterface.bulkDelete('Categories', null, {});
        await queryInterface.bulkDelete('Difficulties', null, {});

    }
};