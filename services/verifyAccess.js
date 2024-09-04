"use strict";

const { Sequelize } = require("sequelize");
const { sequelize, User } = require("../lib/models");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = "s0//P4$$w0rD";
const someOtherPlaintextPassword = "not_bacon";

require("dotenv").config();

module.exports = class VerifyAccess {
    constructor() {}

    async generateAccessToken(user) {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "1800s",
        });
    }

    async generateRefreshToken(user) {
        return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "1y",
        });
    }

    async authenticateAdminToken(req, res, next) {
        if (!req.headers.auth || !req.headers.auth.includes(" ")) {
            return res.status(401).send("Demande non autorisée");
        }
        let token = req.headers.auth.split(" ")[1];
        if (token === null) {
            return res.status(401).send("Demande non autorisée");
        }
        let user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return user = err.message;
            } else {
                return user
            }
        });
        if (typeof user === 'string') {
            return res.status(401).send(user);
        }

        if (user.role.name !== "admin") return res.sendStatus(401);

        req.user = user;
        next();
    }

    async authenticateUserToken(req, res, next) {
        if (!req.headers.auth || !req.headers.auth.includes(" ")) {
            return res.status(401).send("Demande non autorisée");
        }
        let token = req.headers.auth.split(" ")[1];
        if (token === null) {
            return res.status(401).send("Demande non autorisée");
        }
        let user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return user = err.message;
            } else {
                return user
            }
        });
        if (typeof user === 'string') {
            return res.status(401).send(user);
        }

        req.user = user;
        next();
    }

    async authenticateVideoToken(req, res, next) {
        if (!req.headers.token) {
            return res.status(401).send('Demande non autorisée');
        }
        let token = req.query.token;
        if (token === null) {
            return res.status(401).send('Demande non autorisée');
        }
        let user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return user = err.message;
            } else {
                return user
            }
        });
        if (typeof user === 'string') {
            return res.status(401).send(user);
        }

        req.user = user;
        next();
    }


    async authenticateRefreshToken(req, res, next) {
        if (!req.headers.auth || !req.headers.auth.includes(" ")) {
            req.message = "Demande non autorisée";
            return next(false)
        }
        let token = req.headers.auth.split(" ")[1];
        if (token === null) {
            req.message = "Demande non autorisée";
            return next(false)
        }
        let user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                req.message = "Demande non autorisée";
                return
            } else {
                return user
            }
        });
        if (!user) {
            req.message = "Demande non autorisée";
            return next(false)
        }


        req.user = user;
        next();
    }

    async hashPassword(pwd) {
        return bcrypt.hashSync(pwd, 10);
    }

    async comparePassword(enteredPassword, originalPassword) {
        return await bcrypt.compare(enteredPassword, originalPassword);
    }
};