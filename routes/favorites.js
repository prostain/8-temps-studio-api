'use strict';

const express = require('express');
const { Sequelize, DATE, Op } = require('sequelize');
const { sequelize, User, video, Favorite } = require('../lib/models');
var VerifyAccess = require('../services/verifyAccess.js');
const verifyAccess = new VerifyAccess();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const router = express.Router();

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [favorites]
 *     parameters:
 *      - name: Auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.get('/favorites', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var favorites = await User.findOne({
            attributes: ['id'],
            where: { id: req.user.id },
            include: [
                { model: video, as: 'favorites', required: false }
            ]
        })
        return res.json({
            user: favorites
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary:  favorites.
 *     tags: [favorites]
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
 *               videoId:
 *                 type: integer
 *                 description: ID of video.
 *                 example: 1
 *     responses:
 *       200:
 *         description: .
 */

router.post('/favorites', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var data = {
            userId: req.user.id,
            videoId: req.body.videoId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        let favory = await Favorite.create(data);
        return res.json({
            favory
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});


/**
 * @swagger
 * /favorites:
 *   delete:
 *     summary:  JSONPlaceholder.
 *     tags: [favorites]
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
 *               videoId:
 *                 type: integer
 *                 description: ID of video.
 *                 example: 1
 *     responses:
 *       200:
 *         description: .
 */

router.delete('/favorites', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var favory = await Favorite.findOne({ where: { videoId: req.body.videoId, userId: req.user.id } })
        favory.destroy();
        return res.status(200).json({
            message: "Video retirée des favories"
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

module.exports = router;