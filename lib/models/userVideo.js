'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UserVideo extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.User.belongsToMany(models.video, { as: 'videos', through: UserVideo, foreignKey: 'userId', otherKey: 'videoId' });
            models.video.belongsToMany(models.User, { as: 'users', through: UserVideo, foreignKey: 'userId', otherKey: 'videoId' });
        }
    };
    UserVideo.init({
        userId: DataTypes.INTEGER,
        videoId: DataTypes.INTEGER,
        chunk_size: DataTypes.INTEGER

    }, {
        sequelize,
        modelName: 'UserVideo',
        freezeTableName: true

    });
    return UserVideo;
};