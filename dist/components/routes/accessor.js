"use strict";
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
var assign = require("object-assign");
var model_1 = require("../model");
var flatten = require("flat");
var Assert = require("assert");
var params_1 = require("./params");
var unflatten = flatten.unflatten;
var Accessor = /** @class */ (function () {
    function Accessor(req, res) {
        this.res = res;
        this.req = req;
    }
    Accessor.prototype.Model = function (name) {
        this.model = model_1.get(name);
        this.collection = this.model.Schema.model;
    };
    Accessor.prototype.Sanitize = function (body) {
        Assert(this.collection && this.model, "Sanitize can not be called without first calling Model");
        var payload = {};
        var paths = this.collection.schema.paths;
        var _body = flatten(body, { safe: true });
        for (var i in _body) {
            if (paths[i])
                payload[i] = _body[i];
        }
        this.payload = payload;
    };
    Accessor.prototype.Assign = function () {
        Assert(this.payload, "Assign can not be called without first calling Sanitize");
        Assert(this.document, "Assign can not be called without first calling Read or FreshDocument");
        for (var i in this.payload)
            this.document.set(i, this.payload[i]);
    };
    Accessor.prototype.Read = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Assert(this.collection, "Read cannot be used when model is not yet called.");
                        _a = this;
                        return [4 /*yield*/, this.collection.find({ _id: id }).exec()];
                    case 1:
                        _a.document = (_b.sent())[0];
                        Assert(this.document, "Document not found");
                        return [2 /*return*/];
                }
            });
        });
    };
    Accessor.prototype.List = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, sort, filters, populate, pagination, query, _i, populate_1, field, _b, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = this.param, sort = _a.sort, filters = _a.filters, populate = _a.populate, pagination = _a.pagination;
                        query = this.collection.find(filters);
                        query.sort(sort)
                            .limit(pagination.limit)
                            .skip(pagination.offset * pagination.limit);
                        for (_i = 0, populate_1 = populate; _i < populate_1.length; _i++) {
                            field = populate_1[_i];
                            query.populate(field);
                        }
                        _b = this;
                        return [4 /*yield*/, query.exec()];
                    case 1:
                        _b.list = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _c.sent();
                        throw e_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Accessor.prototype.Save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Assert(this.document, "Save can not be called without first calling Read or FreshDocument");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.document.save()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        throw e_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Accessor.prototype.Delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Assert(this.document, "Delete can not be called without first calling Read");
                        Assert(!this.document.isNew, "Delete can not be called when Fresh Document is called.");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.document.remove()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        throw e_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Accessor.prototype.Param = function (params) {
        var str = "";
        for (var i in params)
            str += i + "=" + params[i] + '&';
        str = str.slice(0, str.length - 1);
        this.param = params_1.Parse(str);
    };
    Accessor.prototype.FreshDocument = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                Assert(this.collection, "`Model` should be called first before calling `FreshDocument`");
                this.document = new this.collection();
                return [2 /*return*/];
            });
        });
    };
    Accessor.prototype.Present = function () {
        Assert(this.list, "Present can not be called without first calling List");
        /**
        * @Todo sanitize output
        */
        return this.list;
    };
    Accessor.prototype.Show = function () {
        Assert(this.document, "Show can not be called without first calling Read");
        Assert(!this.document.isNew, "Show can not be called when FreshDocument is called.");
        /**
        * @Todo sanitize output
        */
        return this.document;
    };
    return Accessor;
}());
exports.Accessor = Accessor;
var Dispatcher = /** @class */ (function () {
    function Dispatcher(req, res) {
        this.res = res;
        this.req = req;
    }
    /**
    * From KeystoneJS
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
        if (!detail && typeof error === 'object'
            && error.toString() === '[object Object]'
            && error.error && error.detail) {
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
