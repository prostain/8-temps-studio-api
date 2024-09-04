"use strict";

const express = require("express");
const { Sequelize, Op } = require("sequelize");
const {
    sequelize,
    video,
    Difficulty,
    Style,
    User,
    Subscription,
    SubscriptionUser,
    Professor
} = require("../lib/models");
var VerifyAccess = require("../services/verifyAccess.js");
var UploadServices = require("../services/uploadServices");
var UtilsServices = require("../services/utilsServices");
const verifyAccess = new VerifyAccess();
const uploadServices = new UploadServices();
const utilsServices = new UtilsServices();
const fs = require("fs");
const path = require("path");
const publicDirectory = path.join(__dirname, "../public");
var multer = require("multer");
var bodyParser = require("body-parser");
var fileupload = require("express-fileupload");
const subscription = require("../lib/models/subscription");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const router = express.Router();
router.use(fileupload());
const server = require("http").Server(app);
const io = require("socket.io")(server);

/**
 * @swagger
 * /videos:
 *   get:
 *     summary:  list of videos.
 *     tags: [videos]
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
 *      - name: styleId
 *        in: query
 *        required: false
 *      - name: professorId
 *        in: query
 *        required: false
 *      - name: difficultyId
 *        in: query
 *        required: false
 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.get("/videos", verifyAccess.authenticateUserToken, async(req, res) => {
    try {
        const page = req.query.page,
            size = req.query.size;
        const { limit, offset } = await utilsServices.getPagination(page, size);

        let operation = {};

        if (req.query.name != null) {
            operation = {
                [Op.or]: [{
                    title: {
                        [Op.like]: "%" + req.query.name + "%",
                    },
                }, ],
            };
        }

        if (req.query.styleId != null) {
            operation.styleId = req.query.styleId;
        }

        if (req.query.professorId != null) {
            operation.professorId = req.query.professorId;
        }

        if (req.query.difficultyId != null) {
            operation.difficultyId = req.query.difficultyId;
        }


        let data = await User.findOne({
            where: {
                id: req.user.id,
                subscriptionId: {
                    [Op.not]: null
                },
                subscriptionFinishedAt: {
                    [Op.gte]: new Date()
                },
            },
            include: [{
                model: Subscription,
                as: "subscription",
                where: {
                    isActive: true,
                },
            }, ],
        });

        if (data == null) {
            operation.isFree = true;
        }
        video
            .findAndCountAll({
                where: operation,
                limit,
                offset,
                order: ["id"],
                include: [
                    { model: Difficulty, as: "difficulty" },
                    { model: Style, as: "style" },
                    { model: Professor, as: "professor" },
                ],
            })
            .then(async(data) => {
                const response = await utilsServices.getPagingData(data, page, limit);
                res.send(response);
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving.",
                });
            });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});


/**
 * @swagger
 * /videos/{id}:
 *   get:
 *     summary:  Video details.
 *     tags: [videos]
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

router.get(
    "/videos/:id",
    verifyAccess.authenticateUserToken,
    async(req, res) => {
        try {
            var videoReq = await video.findOne({
                where: { id: req.params.id },
                include: [
                    { model: Difficulty, as: "difficulty" },
                    { model: Style, as: "style" },
                    { model: Professor, as: "professor" },
                ],
            });
            return res.json({
                videoReq,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    }
);

/**
 * @swagger
 * /videos/{videoId}/video:
 *   get:
 *     summary:  Video flux.
 *     tags: [videos]
 *     parameters:
 *      - name: token
 *        in: query
 *      - name: range
 *        in: header
 *      - name: videoId
 *        in: path

 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */
router.get('/videos/:videoId/video', verifyAccess.authenticateVideoToken, async(req, res) => {
    try {
        var videoReq = await video.findOne({
            where: { videoId: req.params.videoId },
        });
        if (!videoReq) {
            return res
                .status(400)
                .send({ error: "Aucune video trouvé avec cette id" });
        }

        const range = req.headers.range;
        if (!range) {
            res.status(400).send("Requires Range header");
        }
        const videoPatho = publicDirectory + "/assets/videos";

        // get video stats (about 61MB)
        const videoPath = `${videoPatho}/${req.params.videoId}.mp4`;
        const videoSize = fs.statSync(videoPath).size;

        // Parse Range
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

        var user = await User.findOne({ where: { id: req.user.id } });
        await user.addVideo(videoReq, { through: { chunk_size: start } });

        // Create headers
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };

        // HTTP Status 206 for Partial Content
        res.writeHead(206, headers);

        // create video read stream for this particular chunk
        const videoStream = fs.createReadStream(videoPath, { start, end });

        // Stream the video chunk to the client
        videoStream.pipe(res);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

/**
 * @swagger
 * /videos:
 *   post:
 *     summary:  videos.
 *     tags: [videos]
 *     parameters:
 *      - name: Auth
 *        in: header

 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: file
 *                 description: video.
 *               miniature:
 *                 type: file
 *                 description: miniature.
 *               data:
 *                 type: string
 *                 description: json stringify of.
 *                 example: {"title": "Video1", "description": "description video", "isFree": 1, "isLandscape": 1, "styleId":1, "professorId":1, "difficultyId": 1}
 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.post(
    "/videos",
    verifyAccess.authenticateAdminToken,
    async(req, res) => {
        try {
            let date = Date.now();
            await uploadServices.miniatureUpload(date, req, res);
            await uploadServices.videoUpload(date, req, res);

            let json = JSON.parse(req.body.data);
            console.log(req.files.video)
            let newVideo = {
                videoId: date.toString(),
                title: json.title,
                description: json.description,
                isFree: json.isFree,
                isLandscape: json.isLandscape,
                styleId: json.styleId,
                professorId: json.professorId,
                difficultyId: json.difficultyId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            await video.create(newVideo);
            newVideo.id = video.id;
            return res.send(newVideo);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    }
);

/**
 * @swagger
 * /videos/{id}:
 *   put:
 *     summary:  videos.
 *     tags: [videos]
 *     parameters:
 *      - name: Auth
 *        in: header

 *      - name: id
 *        in: path

 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: file
 *                 description: video.
 *               miniature:
 *                 type: file
 *                 description: miniature.
 *               data:
 *                 type: string
 *                 description: json stringify of.
 *                 example: {"title": "Video1", "description": "description video", "isFree": 1, "isLandscape": 1, "styleId":1, "professorId":1, "difficultyId": 1}
 *     description: prototyping or testing an API.
 *     responses:
 *       200:
 *         description: .
 */

router.put(
    "/videos/:id",
    verifyAccess.authenticateAdminToken,
    async(req, res) => {
        try {
            var newVideo = await video.findOne({ where: { id: req.params.id } });

            if (
                req.files !== null &&
                req.files.video !== null &&
                req.files.video.name.split("." [0]) != newVideo.videoId &&
                req.files.miniature !== null &&
                req.files.miniature.name.split("." [0]) != newVideo.videoId
            ) {
                let date = Date.now();
                await uploadServices.miniatureUpload(date, req, res);
                await uploadServices.videoUpload(date, req, res);

                newVideo.videoId = date.toString();
            }

            let json = JSON.parse(req.body.data);

            newVideo.title = json.title;
            newVideo.description = json.description;
            newVideo.isFreev = json.isFree;
            newVideo.isLandscape = json.isLandscape;
            newVideo.styleId = json.styleId;
            newVideo.difficultyId = json.difficultyId;
            newVideo.updatedAt = Date.now();

            newVideo.save();

            return res.send(newVideo);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    }
);

/**
 * @swagger
 * /videos/{id}:
 *   delete:
 *     summary:  videos.
 *     tags: [videos]
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

router.delete(
    "/videos/:id",
    verifyAccess.authenticateAdminToken,
    async(req, res) => {
        try {
            var newVideo = await video.findOne({ where: { id: req.params.id } });

            newVideo.destroy();

            return res.send({ message: "Video supprimée" });
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    }
);

module.exports = router;