'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Video extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Video.belongsTo(models.Style, { foreignKey: 'styleId', as: 'style' });
            Video.belongsTo(models.Difficulty, { foreignKey: 'difficultyId', as: 'difficulty' })
            Video.belongsTo(models.Professor, { foreignKey: "professorId", as: "professor" });

        }
    };
    Video.init({
        videoId: DataTypes.STRING,
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        url: DataTypes.STRING,
        duration: DataTypes.INTEGER,
        isFree: DataTypes.BOOLEAN,
        isLandscape: DataTypes.BOOLEAN,
        styleId: DataTypes.INTEGER,
        professorId: DataTypes.INTEGER,
        difficultyId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'video',
    });
    return Video;
};