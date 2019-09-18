"use strict";
exports.__esModule = true;
var http_1 = require("http");
var Express = require("express");
var CookieParser = require("cookie-parser");
var BodyParser = require("body-parser");
var Mongoose = require("mongoose");
var urlencodedParser = BodyParser.urlencoded({ extended: true });
;
var Server = /** @class */ (function () {
    function Server() {
        this.app = Express();
        this.server = http_1.createServer(this.app);
        this.initDefaultMiddlewares();
    }
    Server.prototype.initDefaultMiddlewares = function () {
        this.app.use(urlencodedParser);
        this.app.use(BodyParser.json());
        this.app.use(CookieParser());
    };
    Server.prototype.initDatabase = function (databaseURI) {
        Mongoose.connect(databaseURI, { useNewUrlParser: true });
    };
    Server.prototype.start = function (port) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.server.listen(port, function () {
                resolve();
            });
        });
    };
    Server.prototype.close = function () {
        this.server.close();
        Mongoose.connection.close();
    };
    return Server;
}());
exports.Server = Server;
