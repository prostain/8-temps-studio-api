const express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    return res.send("/api");
});

module.exports = router;