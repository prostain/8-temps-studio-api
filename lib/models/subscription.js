"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subscription.hasMany(models.DateHistory, {
        as: "dates",
        foreignKey: "subscriptionId",
      });
      Subscription.hasMany(models.User, {
        as: "users",
        foreignKey: "subscriptionId",
      });
    }
  }
  Subscription.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      beChecked: DataTypes.BOOLEAN,
      isActive: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Subscription",
    }
  );
  return Subscription;
};
