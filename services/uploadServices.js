'use strict';

const { Sequelize } = require('sequelize');
const { sequelize, User } = require('../lib/models');
var multer = require('multer');
var bodyParser = require('body-parser');
var fileupload = require("express-fileupload");
const path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var getDimensions = require('get-video-dimensions');
var probe = require('node-ffprobe');
const { promises } = require("fs");
const MediaInfoFactory = require("mediainfo.js");
var ffmetadata = require("ffmetadata");

require('dotenv').config();
var exec = require('mz/child_process').execFile;
var assert = require('assert');

module.exports = class UploadService {
    constructor() {}


    async generateAccessToken(user) {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1800s' });
    }

    async videoStorage() {
        try {
            return multer.diskStorage({
                destination: 'assets', // Destination to store video 
                filename: (req, file, cb) => {
                    cb(null, Date.now() +
                        path.extname(req.files.video.originalname))
                }
            });
        } catch (err) {
            console.error(err.message, err.name);
        }
    }

    async videoUpload(date, req, res) {
        let sampleFile;
        let uploadPath;

        if (!req.files.video || Object.keys(req.files.video).length === 0) {
            // res.status(400).send('No files were uploaded.');
            return;
        }

        sampleFile = req.files.video;
        var extension = req.files.video.mimetype.split('/')[1]
        uploadPath = path.resolve(__dirname, "../", 'public/assets/uploads/videos/' + date + "." + extension);

        let fileMoved = await sampleFile.mv(uploadPath);


        let fileDimentions = await this.getDimentions(uploadPath)
        console.log(fileDimentions.height)

    }

    async getDimentions(filename) {
        return exec('ffprobe', [
            '-v', 'error',
            '-of', 'flat=s=_',
            '-select_streams', 'v:0',
            '-show_entries', 'stream=height,width',
            filename
        ]).then(function(out) {
            var stdout = out[0].toString('utf8');
            var width = /width=(\d+)/.exec(stdout);
            var height = /height=(\d+)/.exec(stdout);
            assert(width && height, 'No dimensions found!');
            return {
                width: parseInt(width[1]),
                height: parseInt(height[1]),
            };
        });
    }

    async miniatureUpload(date, req, res) {
        let sampleFile;
        let uploadPath;

        if (!req.files.miniature || Object.keys(req.files.miniature).length === 0) {
            // res.status(400).send('No files were uploaded.');
            return;
        }

        sampleFile = req.files.miniature;
        var extension = req.files.miniature.mimetype.split('/')[1]
        uploadPath = path.resolve(__dirname, "../", 'public/assets/uploads/miniatures/' + date + "." + extension);
        await sampleFile.mv(uploadPath, function(err) {
            /* if (err) {
                 throw err
             }*/

        });
    }



}