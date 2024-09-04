'use strict';

const express = require('express');
const { Sequelize } = require('sequelize');
const { sequelize, User, Role } = require('../lib/models');
const jwt = require('jsonwebtoken');
var VerifyAccess = require('../services/verifyAccess.js');
var EmailController = require('../email/email');
const nodemailer = require('nodemailer');

const verifyAccess = new VerifyAccess();
const emailController = new EmailController();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const router = express.Router();

const bcrypt = require('bcrypt');
const { json } = require('body-parser');
//const { ne } = require('sequelize/dist/lib/operators');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
var randtoken = require('rand-token');

require('dotenv').config();

/**
 * @swagger
 * /register:
 *   post:
 *     summary:  JSONPlaceholder.
 *     tags: [Auth]
 *     description: prototyping or testing an API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: .
 *                 example: John
 *               lastname:
 *                 type: string
 *                 description: .
 *                 example: Doe
 *               email:
 *                 type: string
 *                 description: .
 *                 example: john.doe@gmail.com
 *               password:
 *                 type: string
 *                 description: .
 *                 example: John1234
 *               address:
 *                 type: string
 *                 description: .
 *                 example: 123 rue de france
 *               postalCode:
 *                 type: string
 *                 description: .
 *                 example: 13090
 *               city:
 *                 type: string
 *                 description: .
 *                 example: Aix-en-provence
 *               country:
 *                 type: string
 *                 description: .
 *                 example: France
 *     responses:
 *       200:
 *         description: .
 */
router.post('/register', async(req, res) => {
    try {
        var userToFind = await User.findOne({ where: { email: req.body.email } })

        if (userToFind) {
            console.error("ERROR: Un compte avec cet email existe déjà");
            return res.status(400).json({ error: "Un compte avec cet email existe déjà" });
        }

        req.body.email = req.body.email.trim();
        var hashPWD = bcrypt.hashSync(req.body.password, 10);
        var randPseudo = req.body.firstname + ~~(Math.random() * (9 - 1 + 1) + 1);
        var user = {
            pseudo: randPseudo,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hashPWD,
            address: req.body.address,
            postalCode: req.body.postalCode,
            city: req.body.city,
            country: req.body.country,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            roleId: 1
        };
        let user2 = await User.create(user)
        let role = await Role.findOne({
            where: { id: user.roleId }
        })
        user.id = user2.id;
        user.role = {};
        user.role.id = role.id;
        user.role.name = role.name;

        let accessToken = (await verifyAccess.generateAccessToken(user)).toString();
        let refreshToken = (await verifyAccess.generateRefreshToken(user)).toString();

        emailController.register(req.body.email);

        res.send({
            accessToken,
            refreshToken,
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }

}); // Fin de la méthode register

/**
 * @swagger
 * /login:
 *   post:
 *     summary: JSONPlaceholder.
 *     tags: [Auth]
 *     description: prototyping or testing an API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: .
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 description: .
 *                 example: admin
 *     responses:
 *       200:
 *         description: .
 */

router.post('/login', async(req, res) => {
    try {
        let email = req.body.email.trim();
        const userToFind = await User.findOne({
            where: { email: email },
            include: [
                { model: Role, as: 'role' }
            ]
        })
        if (!userToFind) {
            console.error("invalid credentials");
            return res.status(400).json({ error: "invalid credentials" });
        }
        // TODO: fetch le user depuis la db basé sur l'email passé en paramètre
        let enteredPassword = req.body.password;
        let originalPassword = userToFind.password;
        const correctPassword = await verifyAccess.comparePassword(enteredPassword, originalPassword);

        // TODO: check que le mot de passe du user est correct
        if (!correctPassword) {
            res.status(401).send('invalid credentials');
            return;
        }
        let newUser = {
            id: userToFind.id,
            pseudo: userToFind.pseudo,
            firstname: userToFind.firstname,
            lastname: userToFind.lastname,
            email: userToFind.email,
            address: userToFind.address,
            postalCode: userToFind.postalCode,
            city: userToFind.city,
            country: userToFind.country,
            role: {
                id: userToFind.role.id,
                name: userToFind.role.name
            }
        };

        let accessToken = (await verifyAccess.generateAccessToken(newUser)).toString();
        let refreshToken = (await verifyAccess.generateRefreshToken(newUser)).toString();
        res.send({
            accessToken,
            refreshToken,
        });

    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }

}); // Fin de la méthode login

/**
 * @swagger
 * /refreshToken:
 *   post:
 *     summary:  JSONPlaceholder.
 *     tags: [Auth]
 *     parameters:
 *      - name: Auth
 *        in: header
 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.post('/refreshToken', verifyAccess.authenticateRefreshToken, async(req, res) => {
    try {

        if (req.user === undefined)
            return res.status(401).json({ error: "Demande non autorisée" });
        else {


            let user = req.user;
            delete user.iat;
            delete user.exp;
            let accessToken = (await verifyAccess.generateAccessToken(user)).toString();
            res.send({
                accessToken: accessToken
            });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /reset-password-email:
 *   post:
 *     summary: JSONPlaceholder.
 *     tags: [Auth]
 *     description: prototyping or testing an API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: .
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: .
 */

router.post('/reset-password-email', async(req, res) => {
    try {
        var email = req.body.email;

        //console.log(sendEmail(email, fullUrl));

        var userToFind = await User.findOne({ where: { email: req.body.email } })

        console.log(userToFind);

        if (userToFind.email) {

            var token = randtoken.generate(20);

            let sent = emailController.resetEmailPassword(req.body.email, token);

            if (sent != '0') {

                userToFind.resetPasswordToken = token.toString();
                userToFind.save();

            } else {
                console.error("Something goes to wrong. Please try again");
                return res.status(500).json({ error: 'Something goes to wrong. Please try again' });
            }

        } else {
            console.error("invalid credentials");
            return res.status(400).json({ error: "invalid credentials" });
        }

        res.send({
            token
        });
        //return res.status(200).send({ message: 'Email envoyé avec succès'})
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
})

/**
 * @swagger
 * /update-password:
 *   post:
 *     summary: JSONPlaceholder.
 *     tags: [Auth]
 *     description: prototyping or testing an API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: .
 *                 example: 
 *               password:
 *                 type: string
 *                 description: .
 *                 example: user
 *     responses:
 *       200:
 *         description: .
 */
router.post('/update-password', async(req, res) => {
    try {
        var token = req.body.token;
        var password = req.body.password;

        var userToFind = await User.findOne({ where: { resetPasswordToken: token } })


        if (userToFind) {

            var saltRounds = 10;

            // var hash = bcrypt.hash(password, saltRounds);

            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {

                    userToFind.password = hash;
                    userToFind.resetPasswordToken = null;
                    userToFind.save();

                });
            });

        } else {

            console.error("invalid credentials");
            return res.status(400).json({ error: "invalid credentials" });
        }

        res.status(200).json({ message: "mot de passe modifié avec succès" });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
})

module.exports = router;