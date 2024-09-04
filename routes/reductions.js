'use strict';

const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { sequelize, Reduction } = require('../lib/models');
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
 * /reductions:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [reductions]
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
router.get('/reductions', verifyAccess.authenticateUserToken, async(req, res) => {
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
        Reduction.findAndCountAll({
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
 * /reductions/{id}:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [reductions]
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
router.get('/reductions/:id', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var reduction = await Reduction.findOne({ where: { id: req.params.id } })
        return res.json({
            reduction
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /reductions:
 *   post:
 *     summary:  JSONPlaceholder.
 *     tags: [reductions]
 *     parameters:
 *      - name: auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */
router.post('/reductions', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        const newReduction = {
            name: req.body.name,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            percentage: req.body.percentage,
            value: req.body.value,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        var reduction = await Reduction.create(newReduction);
        return res.json({
            reduction
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /reductions/{id}:
 *   put:
 *     summary:  JSONPlaceholder.
 *     tags: [reductions]
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

router.put('/reductions/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        var reduction = await Reduction.findOne({ where: { id: req.params.id } })

        reduction.name = req.body.name;
        reduction.startDate = req.body.startDate;
        reduction.endDate = req.body.endDate;
        reduction.percentage = req.body.percentage;
        reduction.value = req.body.value;
        reduction.updatedAt = new Date();
        await reduction.save();

        return res.json({
            reduction
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /reductions/{id}:
 *   delete:
 *     summary:  JSONPlaceholder.
 *     tags: [reductions]
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
router.delete('/reductions/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    const id = req.params.id
    try {
        const reduction = await Reduction.findOne({ where: { id } })

        await reduction.destroy()

        return res.json({ message: 'reduction deleted!' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
});


module.exports = router;