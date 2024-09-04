'use strict';

const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { sequelize, Difficulty } = require('../lib/models');
var VerifyAccess = require('../services/verifyAccess.js');
var UtilsServices = require('../services/utilsServices');
const verifyAccess = new VerifyAccess();
const utilsServices = new UtilsServices();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const router = express.Router();

/**
 * @swagger
 * /difficulties:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [difficulties]
 *     parameters:
 *      - name: auth
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
 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.get('/difficulties', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        const page = req.query.page,
            size = req.query.size;
        const { limit, offset } = await utilsServices.getPagination(page, size);

        let operation = [];
        if (req.query.name != null) {
            operation.push({
                name: {
                    [Op.like]: '' + req.query.name + '%'
                }
            })
        }
        Difficulty.findAndCountAll({
                where: {
                    [Op.and]: operation
                },
                limit,
                offset,
                order: [
                    'id'
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
 * /difficulties/{id}:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [difficulties]
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

router.get('/difficulties/:id', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var difficulty = await Difficulty.findOne({ where: { id: req.params.id } })
        return res.json({
            difficulty
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /difficulties:
 *   post:
 *     summary:  JSONPlaceholder.
 *     tags: [difficulties]
 *     parameters:
 *      - name: Auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.post('/difficulties', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        const newCategory = {
            name: req.body.name,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        var difficulty = await Difficulty.create(newCategory);
        return res.json({
            difficulty
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /difficulties/{id}:
 *   put:
 *     summary:  JSONPlaceholder.
 *     tags: [difficulties]
 *     parameters:
 *      - name: auth
 *        in: header

 *      - name: id
 *        in: path

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.put('/difficulties/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        var difficulty = await Difficulty.findOne({ where: { id: req.params.id } })

        difficulty.name = req.body.name;
        difficulty.updatedAt = new Date();
        await difficulty.save();

        return res.json({
            difficulty
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /difficulties/{id}:
 *   delete:
 *     summary:  JSONPlaceholder.
 *     tags: [difficulties]
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

router.delete('/difficulties/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    const id = req.params.id
    try {
        const difficulty = await Difficulty.findOne({ where: { id } })

        await difficulty.destroy()

        return res.json({ message: 'difficulty deleted!' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
})

module.exports = router;