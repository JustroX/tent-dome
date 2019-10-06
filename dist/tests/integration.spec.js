"use strict";
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
var index_1 = require("../index");
var chai = require("chai");
var assert = chai.assert, expect = chai.expect, use = chai.use;
var chaiHttp = require("chai-http");
chai.use(chaiHttp);
var dotenv_1 = require("dotenv");
dotenv_1.config();
describe("Tent integration run 1.", function () {
    var Tent = new index_1.TentDome();
    var entity;
    it("should initialize properly", function () {
        expect(function () {
            Tent.init({
                "mongodb uri": process.env.TEST_MONGODB_URI
            });
        }).to.not["throw"]();
    });
    it("should create new entity", function () {
        expect(function () {
            entity = Tent.Entity("client", {
                name: String,
                number: Number,
                list: [{
                        number: Number,
                        text: String,
                        date: { type: Date, "default": Date.now }
                    }]
            }, {
                toObject: { virtuals: true },
                toJSON: { virtuals: true },
                id: false
            });
            entity.Schema.virtual("virtual", {
                get: function () {
                    return "Get " + this.name;
                },
                set: function (val) {
                    this.name = "Set " + val;
                }
            });
            //expose routes
            entity.Routes.create();
            entity.Routes.update();
            entity.Routes.read();
            entity.Routes.list();
            entity.Routes["delete"]();
            entity.register();
        }).to.not["throw"]();
    });
    it("should start properly", function (done) {
        Tent.register();
        Tent.start().then(function () {
            done();
        })["catch"](done);
    });
    describe("CURLD Requests", function () {
        var _id;
        describe("LIST Request", function () {
            it("should return proper value", function (done) {
                chai.request(Tent.app())
                    .get("/api/clients")
                    .send()
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.deep.equal([]);
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                })["catch"](function (err) {
                    done(err);
                });
            });
        });
        describe("CREATE Request", function () {
            it("should return proper value", function (done) {
                var _this = this;
                var sample_body = { name: "First Client", number: 20, list: [{ number: 1, text: "Hello" }] };
                chai.request(Tent.app())
                    .post("/api/clients")
                    .send(sample_body)
                    .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        try {
                            expect(res).to.have.status(200);
                            expect(res.body._id).to.exist;
                            _id = res.body._id;
                            delete res.body._id;
                            delete res.body.__v;
                            delete res.body.list[0]._id;
                            expect(res.body.list[0].date).to.exist;
                            delete res.body.list[0].date;
                            expect(res.body).to.be.eql(__assign(__assign({}, sample_body), { virtual: "Get First Client" }));
                            done();
                        }
                        catch (err) {
                            done(err);
                        }
                        return [2 /*return*/];
                    });
                }); })["catch"](function (err) {
                    done(err);
                });
            });
        });
        describe("READ Request", function () {
            it("should return proper value", function (done) {
                var _this = this;
                var sample_body = { _id: _id, name: "First Client", number: 20, list: [{ number: 1, text: "Hello" }] };
                chai.request(Tent.app())
                    .get("/api/clients/" + _id)
                    .send()
                    .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        try {
                            expect(res).to.have.status(200);
                            expect(res.body._id).to.exist;
                            delete res.body.__v;
                            delete res.body.list[0]._id;
                            expect(res.body.list[0].date).to.exist;
                            delete res.body.list[0].date;
                            expect(res.body).to.be.eql(__assign(__assign({}, sample_body), { virtual: "Get First Client" }));
                            done();
                        }
                        catch (err) {
                            done(err);
                        }
                        return [2 /*return*/];
                    });
                }); })["catch"](function (err) {
                    done(err);
                });
            });
        });
        describe("UPDATE Request", function () {
            it("should return proper value", function (done) {
                var _this = this;
                var sample_body = { name: "First Client - edited" };
                chai.request(Tent.app())
                    .put("/api/clients/" + _id)
                    .send(sample_body)
                    .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        try {
                            expect(res).to.have.status(200);
                            expect(res.body.name).to.be.eql(sample_body.name);
                            done();
                        }
                        catch (err) {
                            done(err);
                        }
                        return [2 /*return*/];
                    });
                }); })["catch"](function (err) {
                    done(err);
                });
            });
        });
        describe("UPDATE Request with virtuals", function () {
            it("should return proper value", function (done) {
                var _this = this;
                var sample_body = { virtual: "Person" };
                chai.request(Tent.app())
                    .put("/api/clients/" + _id)
                    .send(sample_body)
                    .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        try {
                            expect(res).to.have.status(200);
                            expect(res.body.name).to.be.equal("Set Person");
                            done();
                        }
                        catch (err) {
                            done(err);
                        }
                        return [2 /*return*/];
                    });
                }); })["catch"](function (err) {
                    done(err);
                });
            });
        });
        describe("DELETE Request", function () {
            it("should return proper value", function (done) {
                var _this = this;
                var sample_body = { name: "First Client - edited" };
                chai.request(Tent.app())["delete"]("/api/clients/" + _id)
                    .send()
                    .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                    var _a, err_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 2, , 3]);
                                expect(res).to.have.status(200);
                                _a = expect;
                                return [4 /*yield*/, entity.Schema.model.find({}).exec()];
                            case 1:
                                _a.apply(void 0, [(_b.sent()).length]).to.be.equal(0);
                                done();
                                return [3 /*break*/, 3];
                            case 2:
                                err_1 = _b.sent();
                                done(err_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })["catch"](function (err) {
                    done(err);
                });
            });
        });
        after(function (done) {
            entity.Schema.model.deleteMany({}, done);
        });
    });
    after(function () {
        Tent.AppServer.close();
    });
});
