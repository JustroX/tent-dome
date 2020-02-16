"use strict";
/**
* @module Accessor
*/
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var model_1 = require("../model");
var params_1 = require("./params");
var assign = require("object-assign");
var flatten = require("flat");
var Assert = require("assert");
/** Accessor class. This would be binded to `req.tent` for the middlewares to access.
* @typeparam T Schema interface
*/
var Accessor = /** @class */ (function () {
    /**
    * Returns a new accessor instance.
    * @param req Express request
    * @param res Express response
    */
    function Accessor(req, res) {
        /** Scope reserved for plugins. */
        this.plugins = {};
        /** Scope reserved for reusable variables */
        this.vars = {};
        /** Query information */
        this.info = { numOfDocs: 0 };
        this.res = res;
        this.req = req;
    }
    /**
    * Assigns value for `Accessor.model` and `Accessor.collection`.
    * @param name Name of the model
    */
    Accessor.prototype.Model = function (name) {
        this.model = model_1.get(name);
        this.collection = this.model.Schema.model;
    };
    /**
    * Assigns value for `Accessor.payload`. Removes fields that are not defined in the schema.
    * @param body Request body
    */
    Accessor.prototype.Sanitize = function (body) {
        Assert(this.collection && this.model, 'Sanitize can not be called without first calling Model');
        if (!this.model)
            return;
        var payload = {};
        var paths = this.collection.schema.paths;
        paths = __assign(__assign({}, paths), this.model.Schema.virtuals);
        var _body = flatten(body, { safe: true });
        for (var i in _body) {
            if (paths[i]) {
                payload[i] = _body[i];
            }
        }
        this.payload = payload;
    };
    /**
    * Assigns `Accessor.payload` to `Accessor.document`.
    */
    Accessor.prototype.Assign = function () {
        Assert(this.payload, 'Assign can not be called without first calling Sanitize');
        Assert(this.document, 'Assign can not be called without first calling Read or FreshDocument');
        for (var i in this.payload) {
            if (this.payload[i] || this.payload[i] === false) {
                this.document.set(i, this.payload[i]);
            }
        }
    };
    /**
    * Fetches the document with an `_id` of `id` from the database and assigns it in `Accessor.document`.
    * @param id _id of the document.
    */
    Accessor.prototype.Read = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Assert(this.collection, 'Read cannot be used when model is not yet called.');
                        _a = this;
                        return [4 /*yield*/, this.collection.find({ _id: id }).exec()];
                    case 1:
                        _a.document = (_b.sent())[0];
                        Assert(this.document, 'Document not found');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
    * Fetches the a query of Documents from the database and assigns them to `Accessor.list`.
    * @param id _id of the document.
    */
    Accessor.prototype.List = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, sort, filters, populate, pagination, options, numOfDocs, query, _i, populate_1, field, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.param, sort = _a.sort, filters = _a.filters, populate = _a.populate, pagination = _a.pagination, options = _a.options;
                        if (!options) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.collection.countDocuments(filters).exec()];
                    case 1:
                        numOfDocs = _c.sent();
                        this.info = { numOfDocs: numOfDocs };
                        return [3 /*break*/, 4];
                    case 2:
                        query = this.collection.find(filters);
                        query.sort(sort)
                            .limit(pagination.limit)
                            .skip(pagination.offset * pagination.limit);
                        for (_i = 0, populate_1 = populate; _i < populate_1.length; _i++) {
                            field = populate_1[_i];
                            query.populate(field, this.model.Expand.expose()[field]);
                        }
                        _b = this;
                        return [4 /*yield*/, query.exec()];
                    case 3:
                        _b.list = _c.sent();
                        _c.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
    * Save changes of `Accessor.document` to the database.
    */
    Accessor.prototype.Save = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Assert(this.document, 'Save can not be called without first calling Read or FreshDocument');
                        return [4 /*yield*/, this.document.save()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
    * Deletes `Accessor.document` from the database.
    */
    Accessor.prototype.Delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Assert(this.document, 'Delete can not be called without first calling Read');
                        Assert(!this.document.isNew, 'Delete can not be called when Fresh Document is called.');
                        return [4 /*yield*/, this.document.remove()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
    * Parses request query and assigns them to `Accessor.param` .
    * @param params Req.query instance
    */
    Accessor.prototype.Param = function (params) {
        var _this = this;
        var str = '';
        for (var i in params) {
            str += i + '=' + params[i] + '&';
        }
        str = str.slice(0, str.length - 1);
        var param = params_1.Parse(str);
        // schema keys
        var paths = Object.keys(this.collection.schema.paths);
        // remove fields that are not expandable
        param.populate = param.populate.filter(function (x) { return _this.model.Expand.isExpandable(x); });
        // remove fields that are not defined
        param.populate = param.populate.filter(function (x) { return _this.model.Expand.isExpandable(x); });
        // sort
        for (var i in param.sort) {
            if (paths.indexOf(i) === -1) {
                delete param.sort[i];
            }
        }
        // filters
        for (var i in param.filters) {
            if (paths.indexOf(i) === -1) {
                delete param.filters[i];
            }
        }
        this.param = param;
    };
    /**
    * Assigns a new Mongoose Document at `Accessor.document` .
    */
    Accessor.prototype.FreshDocument = function () {
        Assert(this.collection, '`Model` should be called first before calling `FreshDocument`');
        this.document = new this.collection();
    };
    /**
    *  Returns `Accessor.list`
    */
    Accessor.prototype.Present = function () {
        if (this.param.options) {
            return this.info;
        }
        Assert(this.list, 'Present can not be called without first calling List');
        return this.list;
    };
    /**
    *  Returns `Accessor.document`
    */
    Accessor.prototype.Show = function () {
        Assert(this.document, 'Show can not be called without first calling Read');
        Assert(!this.document.isNew, 'Show can not be called when FreshDocument is called.');
        return this.document;
    };
    /**
    * Runs method `name` and returns it at `req.tent.returnVal`
    * @param name Name of the method.
    */
    Accessor.prototype.Method = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Assert(this.collection, 'Method can not be called without first calling `Model`');
                        Assert(this.document, 'Method can not be called without first calling `FreshDocument` or `Read`');
                        if (this.document === undefined)
                            return [2 /*return*/];
                        Assert(this.document[name], 'Method `' + name + '`is nonexistent.');
                        _a = this;
                        return [4 /*yield*/, this.document[name]()];
                    case 1:
                        _a.returnVal = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
    * Runs static `name` and returns it at `req.tent.returnVal`
    * @param name Name of the static.
    */
    Accessor.prototype.Static = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Assert(this.collection, 'Static can not be called without first calling `Model`');
                        Assert(this.collection[name], 'Static `' + name + '`is nonexistent.');
                        _a = this;
                        return [4 /*yield*/, this.collection[name]()];
                    case 1:
                        _a.returnVal = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
    * Returns the value of `req.tent.returnVal`
    */
    Accessor.prototype.Return = function () {
        Assert(this.returnVal, 'Return can not be called without first calling `Method` or `Static`');
        return this.returnVal;
    };
    return Accessor;
}());
exports.Accessor = Accessor;
/** Dispatcher class. This would be binded to `res.tent` for the middlewares to access.
*/
var Dispatcher = /** @class */ (function () {
    function Dispatcher(req, res) {
        this.res = res;
        this.req = req;
    }
    /**
    * sends an error response to the client.
    */
    Dispatcher.prototype.apiError = function (statusCode, error, detail) {
        if (typeof statusCode !== 'number' && detail === undefined) {
            detail = error;
            error = statusCode;
            statusCode = 500;
        }
        if (statusCode) {
            this.res.status(statusCode);
        }
        if (!detail && typeof error === 'object' &&
            error.toString() === '[object Object]' &&
            error.error && error.detail) {
            detail = error.detail;
            error = error.error;
        }
        if (error instanceof Error) {
            error = error.name !== 'Error' ? error.name + ': ' + error.message : error.message;
        }
        if (detail instanceof Error) {
            detail = detail.name !== 'Error' ? detail.name + ': ' + detail.message : detail.message;
        }
        var data = typeof error === 'string' || (error && detail)
            ? { error: error, detail: detail }
            : error;
        this.res.send(data);
        return assign({
            statusCode: statusCode
        }, data);
    };
    return Dispatcher;
}());
exports.Dispatcher = Dispatcher;
