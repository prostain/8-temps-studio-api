'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Favorite extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.User.belongsToMany(models.video, { as: 'favorites', through: Favorite, foreignKey: 'userId', otherKey: 'videoId' });
            models.video.belongsToMany(models.User, { as: 'likers', through: Favorite, foreignKey: 'userId', otherKey: 'videoId' });
        }
    };
    Favorite.init({
        userId: DataTypes.INTEGER,
        videoId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Favorite',
    });
    return Favorite;
};