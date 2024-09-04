var express = require("express"),
    bodyParser = require("body-parser"),
    swaggerJsdoc = require("swagger-jsdoc"),
    swaggerUi = require("swagger-ui-express");
const { Sequelize, DATE } = require('sequelize');
const { sequelize, Role } = require('./lib/models');
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('morgan');
var pjson = require('./package.json');

const app = express();

require('dotenv').config();

const port = process.env.APP_PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
global.__publicdir = __dirname + "/public";

const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

const jwt = require('jsonwebtoken')
    // chargement du fichier d'env
require('dotenv').config();
// accès au variables

app.use(
    cors()
);

app.use(
    logger('dev')
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({ extended: false })
);

app.use(
    cookieParser()
);

app.use(
    express.static(path.join(__dirname, 'public'))
);

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const rolesRouter = require('./routes/roles');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const difficultiesRouter = require('./routes/difficulties');
const stylesRouter = require('./routes/styles');
const videosRouter = require('./routes/videos');
const uploadsRouter = require('./routes/uploads');
const favoritesRouter = require('./routes/favorites');
const reductionsRouter = require('./routes/reductions');
const dateHistoriesRouter = require('./routes/dateHistories');
const subscriptionsRouter = require('./routes/subscriptions');
const professorsRouter = require('./routes/professor');


const passwd = bcrypt.hashSync("admin1234", saltRounds);

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Express API with Swagger",
            version: pjson.version,
            description: "This is a simple CRUD API application made with Express and documented with Swagger",
        },
        servers: [{
            url: process.env.BASE_URI,
        }],
    },
    apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
);

app.use(
    express.static(path.join(__dirname, 'public'))
);

app.use('/api', indexRouter);
app.use('/api', authRouter);
app.use('/api', rolesRouter);
app.use('/api', categoriesRouter);
app.use('/api', difficultiesRouter);
app.use('/api', stylesRouter);
app.use('/api', usersRouter);
app.use('/api', videosRouter);
app.use('/api', uploadsRouter);
app.use('/api', favoritesRouter);
app.use('/api', reductionsRouter);
app.use('/api', dateHistoriesRouter);
app.use('/api', subscriptionsRouter);
app.use('/api', professorsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(process.env.PORT || port, () => console.log(`Server running on port ${port} ! : http://localhost:${port}`));

module.exports = app;