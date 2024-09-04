'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Style extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Style.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' })
            Style.hasMany(models.video, {
                as: 'videos',
                foreignKey: 'styleId'
            });

        }
    };
    Style.init({
        name: DataTypes.STRING,
        url: DataTypes.STRING,
        categoryId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Style',
    });
    return Style;
};