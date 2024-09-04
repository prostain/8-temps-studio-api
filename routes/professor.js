'use strict';

const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { sequelize, Professor, video } = require('../lib/models');
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
 * /professors:
 *   get:
 *     summary: JSONPlaceholder.
 *     tags: [Professors]
 *     parameters:
 *     - name: auth
 *       in: header
 *       required: true
 *     - name: page
 *       in: query
 *       required: false
 *     - name: size
 *       in: query
 *       required: false
 *     - name: name
 *       in: query
 *       required: false
 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID.
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: The  name.
 *                         example: Danse
 *                       createdAt:
 *                         type: date
 *                         description: The  date.
 *                         example: 
 *                       updatedAt:
 *                         type: date
 *                         description: The  date.
 *                         example:
 */

router.get('/professors', verifyAccess.authenticateUserToken, async(req, res) => {
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
        Professor.findAndCountAll({
                where: {
                    [Op.and]: operation
                },
                limit,
                offset,
                order: [
                    'id'
                ],
                include: [
                    { model: video, as: "videos" },
                ],
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
 * /professors/{id}:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [Professors]
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
router.get('/professors/:id', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var professor = await Professor.findOne({ where: { id: req.params.id } })
        return res.json({
            professor
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /professors:
 *   post:
 *     summary:  JSONPlaceholder.
 *     tags: [Professors]
 *     parameters:
 *      - name: auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.post('/professors', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        const newCategory = {
            name: req.body.name,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        var professor = await Professor.create(newCategory);
        return res.json({
            professor
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /professors/{id}:
 *   put:
 *     summary:  JSONPlaceholder.
 *     tags: [Professors]
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

router.put('/professors/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        var professor = await Professor.findOne({ where: { id: req.params.id } })

        professor.name = req.body.name;
        professor.updatedAt = new Date();
        await professor.save();

        return res.json({
            professor
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /professors/{id}:
 *   delete:
 *     summary:  JSONPlaceholder.
 *     tags: [Professors]
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

router.delete('/professors/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    const id = req.params.id
    try {
        const professor = await Professor.findOne({ where: { id } })

        await professor.destroy()

        return res.json({ message: 'professor deleted!' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
});

module.exports = router;