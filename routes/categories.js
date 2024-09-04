'use strict';

const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { sequelize, Category } = require('../lib/models');
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
 * /categories:
 *   get:
 *     summary: JSONPlaceholder.
 *     tags: [Categories]
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

router.get('/categories', verifyAccess.authenticateUserToken, async(req, res) => {
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
        Category.findAndCountAll({
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
 * /categories/{id}:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [Categories]
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
router.get('/categories/:id', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var category = await Category.findOne({ where: { id: req.params.id } })
        return res.json({
            category
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /categories:
 *   post:
 *     summary:  JSONPlaceholder.
 *     tags: [Categories]
 *     parameters:
 *      - name: auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.post('/categories', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        const newCategory = {
            name: req.body.name,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        var category = await Category.create(newCategory);
        return res.json({
            category
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary:  JSONPlaceholder.
 *     tags: [Categories]
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

router.put('/categories/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        var category = await Category.findOne({ where: { id: req.params.id } })

        category.name = req.body.name;
        category.updatedAt = new Date();
        await category.save();

        return res.json({
            category
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary:  JSONPlaceholder.
 *     tags: [Categories]
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

router.delete('/categories/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    const id = req.params.id
    try {
        const category = await Category.findOne({ where: { id } })

        await category.destroy()

        return res.json({ message: 'category deleted!' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
});

module.exports = router;