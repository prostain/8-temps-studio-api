"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            User.belongsTo(models.Role, { foreignKey: "roleId", as: "role" });
            User.belongsTo(models.Subscription, {
                foreignKey: "subscriptionId",
                as: "subscription",
            });
        }
    }
    User.init({
        pseudo: DataTypes.STRING,
        firstname: DataTypes.STRING,
        lastname: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        address: DataTypes.STRING,
        postalCode: DataTypes.STRING,
        city: DataTypes.STRING,
        country: DataTypes.STRING,
        isActive: DataTypes.BOOLEAN,
        resetPasswordToken: DataTypes.STRING,
        googleToken: DataTypes.STRING,
        appleToken: DataTypes.STRING,
        roleId: DataTypes.INTEGER,
        subscriptionId: DataTypes.INTEGER,
        subscriptionCreatedAt: DataTypes.DATE,
        subscriptionUpdatedAt: DataTypes.DATE,
        subscriptionFinishedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: "User",
    });
    return User;
};