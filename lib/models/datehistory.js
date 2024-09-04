'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DateHistory extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            DateHistory.belongsTo(models.Subscription, { foreignKey: 'subscriptionId', as: 'subscription' })
        }
    };
    DateHistory.init({
        price: DataTypes.DOUBLE,
        VAT: DataTypes.DOUBLE,
        subscriptionId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'DateHistory',
    });
    return DateHistory;
};