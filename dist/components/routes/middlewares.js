"use strict";
/**
* @module Middlewares
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var accessor_1 = require("./accessor");
var Assert = require("assert");
/** Collection of built-in middlewares.*/
var Middleware = /** @class */ (function () {
    function Middleware() {
    }
    ;
    /** Middleware that initializes tent.
    * @param req Express request
    * @param res Express response
    * @param next Express next function
    * @typeparam T Schema interface of the model.
    */
    Middleware.prototype.initTent = function (req, res, next) {
        req.tent = new accessor_1.Accessor(req, res);
        res.tent = new accessor_1.Dispatcher(req, res);
        next();
    };
    /** Returns a middleware that makes the Model available in the request object.
    * @param name Name of the tent model.
    */
    Middleware.prototype.model = function (name) {
        return function modelMiddleware(req, res, next) {
            req.tent.Model(name);
            next();
        };
    };
    /** Returns a middleware that fetches a document from the database. The document id will be from `req.params.id` and will be saved at `req.tent.document`.
    * @typeparam T Schema interface of the model.
    */
    Middleware.prototype.read = function () {
        return function readMiddleware(req, res, next) {
            return __awaiter(this, void 0, void 0, function () {
                var e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Assert(req.params.id, "Id parameter is missing.");
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, req.tent.Read(req.params.id)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            if (e_1.name == "AssertionError" || e_1.name == "CastError")
                                return [2 /*return*/, res.tent.apiError(404, "Document not found")];
                            throw e_1;
                        case 4:
                            next();
                            return [2 /*return*/];
                    }
                });
            });
        };
    };
    /** Returns a middleware that generates a new database document.
    * The new document is accessible via `req.tent.document`
    * @typeparam T Schema interface of the model.
    */
    Middleware.prototype.create = function () {
        return function createMiddleware(req, res, next) {
            Assert(req.tent.collection, "'create' middleware can not be called without calling 'model' middleware first.");
            req.tent.FreshDocument();
            next();
        };
    };
    /** Returns a middleware that assigns `req.body` to `req.tent.payload` while removing the fields which were not defined in the schema of the model.
    * @typeparam T Schema interface of the model.
    */
    Middleware.prototype.sanitize = function () {
        return function sanitizeMiddleware(req, res, next) {
            Assert(req.tent.collection, "'sanitize' middleware can not be called without calling 'model' middleware first.");
            Assert(req.tent.document, "'sanitize' middleware can not be called without calling 'create' or 'read' middleware first.");
            req.tent.Sanitize(req.body);
            next();
        };
    };
    /** Returns a middleware that sets `req.tent.document` to `req.tent.payload`.
    * @typeparam T Schema interface of the model.
    */
    Middleware.prototype.assign = function () {
        return function assignMiddleware(req, res, next) {
            Assert(req.tent.collection, "'assign' middleware can not be called without calling 'model' middleware first.");
            Assert(req.tent.document, "'assign' middleware can not be called without calling 'create' or 'read' middleware first.");
            Assert(req.tent.payload, "'assign' middleware can not be called without calling 'sanitize' middleware first.");
            req.tent.Assign();
            next();
        };
    };
    /** Returns a middleware that saves `req.tent.document` to the database.
    * @typeparam T Schema interface of the model.
    */
    Middleware.prototype.save = function () {
        return function saveMiddleware(req, res, next) {
            return __awaiter(this, void 0, void 0, function () {
                var e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Assert(req.tent.collection, "'save' middleware can not be called without calling 'model' middleware first.");
                            Assert(req.tent.document, "'save' middleware can not be called without calling 'create' or 'read' middleware first.");
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, req.tent.Save()];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_2 = _a.sent();
                            throw e_2;
                        case 4:
                            next();
                            return [2 /*return*/];
                    }
                });
            });
        };
    };
    /** Returns a middleware that removes `req.tent.document` from the database.
    * @typeparam T Schema interface of the model.
    */
    Middleware.prototype.remove = function () {
        return function removeMiddleware(req, res, next) {
            return __awaiter(this, void 0, void 0, function () {
                var e_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Assert(req.tent.collection, "'remove' middleware can not be called without calling 'model' middleware first.");
                            Assert(req.tent.document, "'remove' middleware can not be called without calling 'read' middleware first.");
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, req.tent.Delete()];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_3 = _a.sent();
                            throw e_3;
                        case 4:
                            next();
                            return [2 /*return*/];
                    }
                });
            });
        };
    };
    /** Returns a middleware that would query `req.tent.param` from the database and assigns the result to `req.tent.list`.
    * @typeparam T Schema interface of the model.
    */
    Middleware.prototype.list = function () {
        return function listMiddleware(req, res, next) {
            return __awaiter(this, void 0, void 0, function () {
                var e_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Assert(req.tent.collection, "'list' middleware can not be called without calling 'model' middleware first.");
                            Assert(req.tent.param, "'list' middleware can not be called without calling 'param' middleware first.");
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, req.tent.List()];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_4 = _a.sent();
                            throw e_4;
                        case 4:
                            next();
                            return [2 /*return*/];
                    }
                });
            });
        };
    };
    /** Returns a middleware that would parse `req.query` into a tent-readable format and saves it at `req.tent.param`.
    * @typeparam T Schema interface of the model.
    */
    Middleware.prototype.param = function () {
        return function paramMiddleware(req, res, next) {
            req.tent.Param(req.query);
            next();
        };
    };
    /** Returns a middleware that would respond a status code of 200.
    * @typeparam T Schema interface of the model.
    */
    Middleware.prototype.success = function () {
        return function successMiddleware(req, res, next) {
            res.status(200).send({
                message: "Success",
                code: 200
            });
        };
    };
    /** Returns a middleware that would respond a status code of 200 and `req.tent.document`
    * @typeparam T Schema interface of the model.
    */
    Middleware.prototype.show = function () {
        return function showMiddleware(req, res, next) {
            Assert(req.tent.document, "'show' middleware can not be called without calling 'read' or 'create' middleware first.");
            res.status(200).send(req.tent.Show());
        };
    };
    /** Returns a middleware that would respond a status code of 200 and `req.tent.list`
    * @typeparam T Schema interface of the model.
    */
    Middleware.prototype.present = function () {
        return function presentMiddleware(req, res, next) {
            res.status(200).send(req.tent.Present());
        };
    };
    return Middleware;
}());
exports.Middlewares = new Middleware();
