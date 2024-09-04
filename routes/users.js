'use strict';

const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { sequelize, User, Role, video, Subscription } = require('../lib/models');
var VerifyAccess = require('../services/verifyAccess.js');
var UtilsServices = require('../services/utilsServices');
const verifyAccess = new VerifyAccess();
const utilsServices = new UtilsServices();

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

/**
 * @swagger
 * /users:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [users]
 *     parameters:
 *      - name: Auth
 *        in: header

 *      - name: page
 *        in: query
 *        required: false
 *      - name: size
 *        in: query
 *        required: false
 *      - name: name
 *        in: query
 *        required: false
 *      - name: roleId
 *        in: query
 *        required: false
 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.get('/users', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        const page = req.query.page,
            size = req.query.size;
        const { limit, offset } = await utilsServices.getPagination(page, size);

        let operation = {};

        if (req.query.name != null) {
            operation = {
                [Op.or]: [{
                        firstname: {
                            [Op.like]: '%' + req.query.name + '%'
                        }
                    },
                    {
                        lastname: {
                            [Op.like]: '%' + req.query.name + '%'
                        }
                    }
                ]
            }
        }
        if (req.query.roleId != null) {
            operation.roleId = req.query.roleId
        }
        User.findAndCountAll({
                where: operation,
                limit,
                offset,
                order: [
                    'id'
                ],
                include: [
                    { model: Role, as: 'role' }
                    /*,
                                        {
                                            model: Subscription,
                                            as: "subscriptions",
                                            where: {
                                                id: req.user.id
                                            }
                                        }*/
                ]
            })
            .then(async data => {
                const response = await utilsServices.getPagingData(data, page, limit);
                res.send(response);
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving."
                });
            });

    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [users]
 *     parameters:
 *      - name: Auth
 *        in: header

 *      - name: id
 *        in: path

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.get('/users/:id', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var user = await User.findOne({ where: { id: req.params.id } })
        return res.json({
            user
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary:  Create user.
 *     tags: [users]
 *     parameters:
 *      - name: Auth
 *        in: header

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
 *               roleId:
 *                 type: integer
 *                 description: .
 *                 example: 1
 *     responses:
 *       200:
 *         description: .
 */

router.post('/users', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {

        var userToFind = await User.findOne({ where: { email: req.body.email } })

        if (userToFind) {
            console.error("ERROR: Un compte avec cet email existe déjà");
            return res.status(400).json({ error: "Un compte avec cet email existe déjà" });
        }

        var randPseudo = req.body.firstname + ~~(Math.random() * (9 - 1 + 1) + 1);
        const newUser = {
            pseudo: randPseudo,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: (await verifyAccess.hashPassword(req.body.password)).toString(),
            address: req.body.address,
            postalCode: req.body.postalCode,
            city: req.body.city,
            country: req.body.country,
            isActive: true,
            roleId: req.body.roleId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        var user = await User.create(newUser);
        return res.json({
            user
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary:  JSONPlaceholder.
 *     tags: [users]
 *     parameters:
 *      - name: Auth
 *        in: header

 *      - name: id
 *        in: path

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.put('/users/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        var user = await User.findOne({ where: { id: req.params.id } })

        user.pseudo = req.body.pseudo;
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.email = req.body.email;
        user.password = hashPWD;
        user.address = req.body.address;
        user.postalCode = req.body.postalCode;
        user.city = req.body.city;
        user.country = req.body.country;
        user.isActive = req.body.isActive;
        user.roleId = req.body.roleId;
        user.updatedAt = new Date();

        await user.save();

        return res.json({
            user
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary:  Soft delete an user.
 *     tags: [users]
 *     parameters:
 *      - name: Auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */
router.post('/users', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } })

        user.isActive = false;
        await user.save()

        return res.json({ message: 'user soft deleted!' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
});

/**
 * @swagger
 * /profil:
 *   get:
 *     summary:  get an user profil.
 *     tags: [users]
 *     parameters:
 *      - name: Auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.get('/profil', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var user = await User.findOne({ where: { id: req.user.id } })
        return res.json({
            user
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /profil/videoWatched:
 *   get:
 *     summary:  get videos for user.
 *     tags: [users]
 *     parameters:
 *      - name: Auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.get('/profil/videoWatched', verifyAccess.authenticateUserToken, async(req, res) => {
    try {

        var user = await User.findAll({
            attributes: ['id'],
            where: { id: req.user.id },
            include: [
                { model: video, as: 'videos' }
            ]
        })
        return res.json({
            user
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});


/**
 * @swagger
 * /profil:
 *   put:
 *     summary:  update an user profil.
 *     tags: [users]
 *     parameters:
 *      - name: Auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */
router.put('/profil', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var user = await User.findOne({ where: { id: req.user.id } })

        user.pseudo = req.body.pseudo;
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.email = req.body.email;
        user.address = req.body.address;
        user.postalCode = req.body.postalCode;
        user.city = req.body.city;
        user.country = req.body.country;
        user.updatedAt = new Date();

        await user.save();

        return res.json({
            user
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

module.exports = router;