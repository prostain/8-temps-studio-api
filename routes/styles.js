'use strict';

const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { sequelize, Style, Category } = require('../lib/models');
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
 * /styles:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [styles]
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
 *      - name: categoryId
 *        in: query
 *        required: false
 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.get('/styles', verifyAccess.authenticateUserToken, async(req, res) => {
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
        if (req.query.categoryId != null) {
            operation.push({
                categoryId: req.query.categoryId
            })
        }
        Style.findAndCountAll({
                where: {
                    [Op.and]: operation
                },
                limit,
                offset,
                order: [
                    'id'
                ],
                include: [
                    { model: Category, as: 'category' }
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
 * /styles/{id}:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [styles]
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

router.get('/styles/:id', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var style = await Style.findOne({ where: { id: req.params.id } })
        res.json({
            style
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /styles:
 *   post:
 *     summary:  JSONPlaceholder.
 *     tags: [styles]
 *     parameters:
 *      - name: Auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */
router.post('/styles', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        const newStyle = {
            name: req.body.name,
            categoryId: req.body.categoryId,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        var style = await Style.create(newStyle);
        return res.json({
            style
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /styles/{id}:
 *   put:
 *     summary:  JSONPlaceholder.
 *     tags: [styles]
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

router.put('/styles/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        var style = await Style.findOne({ where: { id: req.params.id } })

        style.name = req.body.name;
        style.categoryId = req.body.categoryId;
        style.updatedAt = new Date();
        await style.save();

        return res.json({
            style
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /styles/{id}:
 *   delete:
 *     summary:  JSONPlaceholder.
 *     tags: [styles]
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

router.delete('/styles/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    const id = req.params.id
    try {
        const style = await Style.findOne({ where: { id } })

        await style.destroy()

        return res.json({ message: 'style deleted!' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
});


module.exports = router;