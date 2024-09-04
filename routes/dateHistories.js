'use strict';

const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { sequelize, DateHistory } = require('../lib/models');
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
 * /date-histories:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [date-histories]
 *     parameters:
 *      - name: auth
 *        in: header

 *      - name: page
 *        in: query
 *        required: false
 *      - name: size
 *        in: query
 *        required: false
 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */
router.get('/date-histories', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        const page = req.query.page,
            size = req.query.size;
        const { limit, offset } = await utilsServices.getPagination(page, size);

        DateHistory.findAndCountAll({
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
 * /date-histories/{id}:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [date-histories]
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
router.get('/date-histories/:id', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var dateHistory = await DateHistory.findOne({ where: { id: req.params.id } })
        return res.json({
            dateHistory
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /date-histories:
 *   post:
 *     summary:  JSONPlaceholder.
 *     tags: [date-histories]
 *     parameters:
 *      - name: auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */
router.post('/date-histories', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        const newDateHistory = {
            name: req.body.name,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            percentage: req.body.percentage,
            value: req.body.value,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        var dateHistory = await DateHistory.create(newDateHistory);
        return res.json({
            dateHistory
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /date-histories/{id}:
 *   put:
 *     summary:  JSONPlaceholder.
 *     tags: [date-histories]
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

router.put('/date-histories/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        var dateHistory = await DateHistory.findOne({ where: { id: req.params.id } })

        dateHistory.name = req.body.name;
        dateHistory.startDate = req.body.startDate;
        dateHistory.endDate = req.body.endDate;
        dateHistory.percentage = req.body.percentage;
        dateHistory.value = req.body.value;
        dateHistory.updatedAt = new Date();
        await dateHistory.save();

        return res.json({
            dateHistory
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /date-histories/{id}:
 *   delete:
 *     summary:  JSONPlaceholder.
 *     tags: [date-histories]
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
router.delete('/date-histories/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    const id = req.params.id
    try {
        const dateHistory = await DateHistory.findOne({ where: { id } })

        await dateHistory.destroy()

        return res.json({ message: 'date history deleted!' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
});


module.exports = router;