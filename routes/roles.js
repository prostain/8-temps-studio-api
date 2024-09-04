'use strict';

const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { sequelize, Role } = require('../lib/models');
var VerifyAccess = require('../services/verifyAccess.js');
const verifyAccess = new VerifyAccess();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const router = express.Router();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [roles]
 *     parameters:
 *      - name: Auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.get('/roles', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var roles = await Role.findAll();
        return res.json({
            roles
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary:  JSONPlaceholder.
 *     tags: [roles]
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

router.get('/roles/:id', verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        var role = await Role.findOne({ where: { id: req.params.id } })
        return res.json({
            role
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /roles:
 *   post:
 *     summary:  roles.
 *     tags: [roles]
 *     parameters:
 *      - name: Auth
 *        in: header

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.post('/roles', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        const newRole = {
            name: req.body.name,
            categoryId: req.body.categoryId,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        var role = await Role.create(newRole);
        return res.json({
            role
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary:  JSONPlaceholder.
 *     tags: [roles]
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

router.put('/roles/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    try {
        var role = await Role.findOne({ where: { id: req.params.id } })

        role.name = req.body.name;
        role.categoryId = req.body.categoryId;
        role.updatedAt = new Date();
        await role.save();

        return res.json({
            role
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary:  JSONPlaceholder.
 *     tags: [roles]
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

router.delete('/roles/:id', verifyAccess.authenticateAdminToken, async(req, res) => {
    const id = req.params.id
    try {
        const role = await Role.findOne({ where: { id } })

        await role.destroy()

        return res.json({ message: 'role deleted!' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
});


module.exports = router;