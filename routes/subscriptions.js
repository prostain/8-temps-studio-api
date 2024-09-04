'use strict';

const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { sequelize, Subscription, DateHistory } = require('../lib/models');
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
 * /subscriptions:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [subscriptions]
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
router.get('/subscriptions', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        const page = req.query.page,
            size = req.query.size;
        const { limit, offset } = await utilsServices.getPagination(page, size);

        let operation = [];
        if (req.query.name != null) {
            operation.push({
                title: {
                    [Op.like]: '' + req.query.name + '%'
                }
            })
        }
        Subscription.findAndCountAll({
                where: {
                    [Op.and]: operation
                },
                limit,
                offset,
                order: [
                    'id'
                ],
                include: [
                    { model: DateHistory, as: 'dates' }
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
 * /subscriptions/{id}:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [subscriptions]
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
router.get('/subscriptions/:id', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var subscription = await Subscription.findOne({ where: { id: req.params.id } })
        return res.json({
            subscription
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary:  JSONPlaceholder.
 *     tags: [subscriptions]
 *     parameters:
 *      - name: auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */
router.post('/subscriptions', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        const newSubscription = {
            name: req.body.name,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            percentage: req.body.percentage,
            value: req.body.value,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        var subscription = await Subscription.create(newSubscription);
        return res.json({
            subscription
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /subscriptions/{id}:
 *   put:
 *     summary:  JSONPlaceholder.
 *     tags: [subscriptions]
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

router.put('/subscriptions/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        var subscription = await Subscription.findOne({ where: { id: req.params.id } })

        subscription.name = req.body.name;
        subscription.startDate = req.body.startDate;
        subscription.endDate = req.body.endDate;
        subscription.percentage = req.body.percentage;
        subscription.value = req.body.value;
        subscription.updatedAt = new Date();
        await subscription.save();

        return res.json({
            subscription
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /subscriptions/{id}:
 *   delete:
 *     summary:  JSONPlaceholder.
 *     tags: [subscriptions]
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
router.delete('/subscriptions/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    const id = req.params.id
    try {
        const subscription = await Subscription.findOne({ where: { id } })

        await subscription.destroy()

        return res.json({ message: 'subscription deleted!' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
});


module.exports = router;