'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
         */
        const styles = await queryInterface.sequelize.query(
            `SELECT id from styles;`
        );

        const styleRows = styles[0];

        const difficulties = await queryInterface.sequelize.query(
            `SELECT id from difficulties;`
        );

        const difficultyRows = difficulties[0];
        await queryInterface.bulkInsert('Videos', [{
            videoId: "bigbuck",
            title: "Big Buck",
            description: "Un lapin aussi gros qu'adorable décide de se venger des trois petites pestes déterminées à gâcher son bonheur.",
            url: "",
            isFree: 1,
            styleId: styleRows[0].id,
            difficultyId: difficultyRows[0].id,
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },

    down: async(queryInterface, Sequelize) => {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        await queryInterface.bulkDelete('videos', null, {});

    }
};