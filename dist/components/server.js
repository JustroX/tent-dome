"use strict";
/**
* @module Server
* Tent Server
*/
exports.__esModule = true;
/*******
*
*	Copyright (C) 2019  Justine Che T. Romero
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
********/
var http_1 = require("http");
var Express = require("express");
var CookieParser = require("cookie-parser");
var BodyParser = require("body-parser");
var Mongoose = require("mongoose");
var morgan = require("morgan");
var urlencodedParser = BodyParser.urlencoded({ extended: true });
;
/**
*	This is the Server class that encapsulates database connection and the http server.
*/
var Server = /** @class */ (function () {
    function Server() {
        this.app = Express();
        this.server = http_1.createServer(this.app);
        this.initDefaultMiddlewares();
    }
    /**
    *	Initializes default middlewares
    */
    Server.prototype.initDefaultMiddlewares = function () {
        this.app.use(morgan('dev'));
        this.app.use(urlencodedParser);
        this.app.use(BodyParser.json());
        this.app.use(CookieParser());
    };
    /**
    *	Connects App to the database
    *
    *	@param databaseURI URI of the database
    */
    Server.prototype.initDatabase = function (databaseURI) {
        Mongoose.connect(databaseURI, { useNewUrlParser: true, useUnifiedTopology: true });
    };
    /**
    *	Start the Server
    *
    *	@param port Port to listen to
    *
    */
    Server.prototype.start = function (port) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.server.listen(port, function () {
                resolve();
            });
        });
    };
    /**
    *	Close the Server
    */
    Server.prototype.close = function () {
        this.server.close();
        Mongoose.connection.close();
    };
    return Server;
}());
exports.Server = Server;
