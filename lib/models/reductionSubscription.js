'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ReductionSubscription extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Reduction.belongsToMany(models.Subscription, { as: 'subscriptions', through: ReductionSubscription, foreignKey: 'reductionId', otherKey: 'subscriptionId' });
            models.Subscription.belongsToMany(models.Reduction, { as: 'reductions', through: ReductionSubscription, foreignKey: 'reductionId', otherKey: 'subscriptionId' });
        }
    };
    ReductionSubscription.init({
        reductionId: DataTypes.INTEGER,
        subscriptionId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'ReductionSubscription',
        freezeTableName: true

    });
    return ReductionSubscription;
};