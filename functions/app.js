var express = require("express");
var bodyParser = require("body-parser");
var expressJwt = require("express-jwt");
var path = require("path");
var http = require("http");
var url = require("url");
waterfall = require("run-waterfall");
var btoa = require("btoa");
var i18n = require("i18n");
var helmet = require("helmet");
var validator = require("express-validator");
var cookieParser = require("cookie-parser");
var cors = require("cors");
var fileupload = require("express-fileupload");
// const formidable = require('formidable');

require("dotenv").config();
global.__rootRequire = function (relpath) {
    return require(path.join(__dirname, relpath));
};

global.__debug = function () {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "local" || process.env.NODE_ENV === "development" || process.env.NODE_ENV === "aws") {
    }
};

i18n.configure({
    locales: "en",
    directory: __dirname + "/app/locales",
    updateFiles: false,
});

var app = express();
app.use(cors({ origin: true }));
// app.use(formidable())
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.use(helmet.hidePoweredBy());
app.use(
    helmet({
        frameguard: false,
    })
);
app.use(bodyParser.json());
app.use(fileupload());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

process.env.NODE_ENV = process.env.NODE_ENV || "local"; //local server
//process.env.NODE_ENV = process.env.NODE_ENV || 'staging'; //staging server
// process.env.NODE_ENV = process.env.NODE_ENV || 'live'; //live server

// const pino = require("pino");
// const expressPino = require("express-pino-logger");

// const logger = pino({
//   level: "info",
//   prettyPrint: { colorize: true },
// });
// const expressLogger = expressPino({ logger });

// app.use(expressLogger);

const config = require("./app/config/config.js").get(process.env.NODE_ENV);
// const config = require('./app/config/config.js').get('default');

app.use(function (req, res, next) {
    i18n.init(req, res);
    next();
});
app.set("view engine", "html");
// app.set('views', __dirname + '/views');
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
// app.use(function (req, res, next) {
// for (var item in req.body) {
// req.sanitize(item).escape();
// }
// next();
// });
app.use(bodyParser.json());
// routesnpm start
console.log(path.join(__dirname, "/dist/index.html"), "sssss");
app.use(express.static(path.join(__dirname, "/dist")));
// app.use(express.static(path.join(__dirname, 'public/modules/dashboard')));

// app.use('*', function (req, res) {
// res.sendFile(path.join(__dirname, '/public/dist/index.html'));
// })

// app.use('/', function (req, res) {
// res.sendfile(',/public/dist/index.html');
// });

app.use("/uploads", express.static(path.join(__dirname, "./app/uploads/productImages")));
app.use("/bulkUpload", express.static(path.join(__dirname, "./app/uploads/bulkUpload")));

app.use("/api/v1", require("./app/api/v1/routes")(express));
app.get("/timestamp", (req, res) => {
    res.send(`${Date.now()}`);
});



module.exports = app;

// var port = process.env.PORT || config.port;

// app.listen(port).timeout = 1800000; //30 min
// console.log("Available on:", config.baseUrl);

// //socket
// var socketport = process.env.SOCKETPORT || 5900;
// console.log("socketport No is", socketport);
// var socket = require("http").Server(app);
// // var socket = require('http').Server(app);

// socket.listen(socketport);
// var io = require("socket.io")(socket, { origins: "*:*" });

// io.on("connection", function (socket) {
//   console.log("connected socket!");

//   socket.on("disconnect", function () {
//     console.log("Socket disconnected");
//   });
// });

// app.set("io", io);
// require("./app/api/v1/modules/chat/controllers/chat").chatConfig(io);
// require("./app/utils/fileUpload").listBuckets();

/**
 * active offers sent, buy doesn't make sense- sf 13
active offers section message doesn't properly carry over and you're not showing shipping address- sf 14
transaction count doesn't increase for a user - sf38
testing for collective child mobile end for live deployement
 */
