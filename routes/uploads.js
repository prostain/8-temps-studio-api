'use strict';

const express = require('express');
const { Sequelize } = require('sequelize');
const { sequelize, video } = require('../lib/models');
var VerifyAccess = require('../services/verifyAccess.js');
const verifyAccess = new VerifyAccess();
const fs = require('fs-extra'); // Classic fs
const path = require('path');
const bodyParser = require('body-parser');

const publicDirectory = path.join(__dirname, '../public');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const router = express.Router();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const busboy = require('connect-busboy');
const mime = require('mime');
// app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

const uploadImage = async(req, res, next) => {

    try {

        // to declare some path to store your converted image
        const filePath = __publicdir + '/assets/uploads/miniatures/' + Date.now() + '.png'

        const imgdata = req.body.base64image;
        console.log(filePath);
        // to convert base64 format into random filename
        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');

        fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });

        return res.send(filePath);

    } catch (e) {
        next(e);
    }
}

router.post('/videos', uploadImage)


module.exports = router;