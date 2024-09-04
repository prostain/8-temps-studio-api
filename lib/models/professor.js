'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Professor extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Professor.hasMany(models.video, {
                as: 'videos',
                foreignKey: 'professorId'
            });

        }
    };
    Professor.init({
        firstname: DataTypes.STRING,
        lastname: DataTypes.STRING,
        birfday: DataTypes.DATE,
        email: DataTypes.STRING,
        description: DataTypes.TEXT,
        profilePhoto: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Professor',
    });
    return Professor;
};