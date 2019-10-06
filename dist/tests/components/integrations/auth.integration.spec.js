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
var index_1 = require("../../../index");
var authentication_1 = require("../../../components/plugins/authentication");
var chai = require("chai");
var chaiHttp = require("chai-http");
var dotenv_1 = require("dotenv");
dotenv_1.config();
var assert = chai.assert, expect = chai.expect, use = chai.use;
use(chaiHttp);
describe("Authentication Plugin - Integration", function () {
    var entity;
    it("should initialize properly", function () {
        expect(function () {
            index_1.Tent.init({
                "mongodb uri": process.env.TEST_MONGODB_URI,
                "auth user": "UserAuth",
                "auth email token": "email",
                "auth password token": "password",
                "auth secret": "Shhhhh",
                "auth signup": true,
                "auth activation token": "active"
            });
        }).to.not["throw"]();
    });
    it("should create new entity", function () {
        expect(function () {
            entity = index_1.Tent.Entity("UserAuth", {
                name: String,
                email: String,
                password: String,
                active: Boolean
            }, {
                toObject: { virtuals: true },
                toJSON: { virtuals: true },
                id: false
            });
            //expose routes
            entity.Routes.create();
            entity.Routes.update();
            entity.Routes.read();
            entity.Routes.list();
            entity.Routes["delete"]();
            entity.install(new authentication_1.AuthenticationPlugin());
            var auth = entity.plugins.auth;
            auth.allow("/", "LIST");
            entity.register();
        }).to.not["throw"]();
    });
    it("should start properly", function (done) {
        index_1.Tent.register();
        index_1.Tent.start().then(function () {
            done();
        })["catch"](done);
    });
    var token = "";
    describe("Signing up", function () {
        it("should deny malformed request", function (done) {
            chai.request(index_1.Tent.app())
                .post("/api/userauths/signup")
                .send({})
                .then(function (res) {
                try {
                    expect(res).to.have.status(400);
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
        it("should deny invalid inputs", function (done) {
            chai.request(index_1.Tent.app())
                .post("/api/userauths/signup")
                .send({
                email: "johnyNotEmail",
                password: "w"
            })
                .then(function (res) {
                try {
                    expect(res).to.have.status(400);
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
        it("create new user", function (done) {
            chai.request(index_1.Tent.app())
                .post("/api/userauths/signup")
                .send({
                email: "johny@gmail.com",
                password: "Iwannabeatutubi#2"
            })
                .then(function (res) {
                try {
                    expect(res).to.have.status(200);
                    expect(res.body.token).to.exist;
                    token = res.body.token;
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
    });
    describe("CURLD Requests with no auth", function () {
        var _id;
        describe("LIST Request", function () {
            it("should return proper value", function (done) {
                chai.request(index_1.Tent.app())
                    .get("/api/userauths")
                    .send()
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(200);
                        expect(res.body.length).to.be.equal(1);
                        _id = res.body[0]._id;
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
            it("should be denied", function (done) {
                var sample_body = { name: "First Client" };
                chai.request(index_1.Tent.app())
                    .post("/api/userauths")
                    .send(sample_body)
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(403);
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
        describe("READ Request", function () {
            it("should return proper value", function (done) {
                chai.request(index_1.Tent.app())
                    .get("/api/userauths/" + _id)
                    .send()
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(403);
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
        describe("UPDATE Request", function () {
            it("should return proper value", function (done) {
                var sample_body = {};
                chai.request(index_1.Tent.app())
                    .put("/api/userauths/" + _id)
                    .send(sample_body)
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(403);
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
        describe("DELETE Request", function () {
            it("should return proper value", function (done) {
                var _this = this;
                chai.request(index_1.Tent.app())["delete"]("/api/userauths/" + _id)
                    .send()
                    .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        try {
                            expect(res).to.have.status(403);
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
    });
    describe("Login", function () {
        before(function () {
            token = "";
        });
        describe("unactivated user", function () {
            it("should deny malformed request..", function (done) {
                chai.request(index_1.Tent.app())
                    .post("/api/userauths/login")
                    .send({
                    email: "johny@gmail.com",
                    password: "wrongpassword"
                })
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(400);
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                })["catch"](done);
            });
            it("should not found user.", function (done) {
                chai.request(index_1.Tent.app())
                    .post("/api/userauths/login")
                    .send({
                    email: "johny@gmail.com",
                    password: "Iwannabeatutubi#2"
                })
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(401);
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                })["catch"](done);
            });
        });
        describe("activated user", function () {
            before(function () {
                return __awaiter(this, void 0, void 0, function () {
                    var collection;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                collection = entity.Schema.model;
                                if (!collection)
                                    return [2 /*return*/];
                                return [4 /*yield*/, collection.updateMany({}, { $set: { active: true } })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            });
            it("should reject password.", function (done) {
                chai.request(index_1.Tent.app())
                    .post("/api/userauths/login")
                    .send({
                    email: "johny@gmail.com",
                    password: "wrongpassword"
                })
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(400);
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                });
            });
            it("should logged in.", function (done) {
                chai.request(index_1.Tent.app())
                    .post("/api/userauths/login")
                    .send({
                    email: "johny@gmail.com",
                    password: "Iwannabeatutubi#2"
                })
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(200);
                        expect(res.body.token).to.exist;
                        token = res.body.token;
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                });
            });
        });
    });
    describe("CURLD Requests with auth", function () {
        var _id;
        describe("LIST Request", function () {
            it("should return proper value", function (done) {
                chai.request(index_1.Tent.app())
                    .get("/api/userauths")
                    .set("Authorization", "Bearer " + token)
                    .send()
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(200);
                        expect(res.body.length).to.be.equal(1);
                        _id = res.body[0]._id;
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
                var sample_body = { name: "First Client" };
                chai.request(index_1.Tent.app())
                    .post("/api/userauths")
                    .set("Authorization", "Bearer " + token)
                    .send(sample_body)
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(200);
                        expect(res.body).to.exist;
                        _id = res.body._id;
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
        describe("READ Request", function () {
            it("should return proper value", function (done) {
                chai.request(index_1.Tent.app())
                    .get("/api/userauths/" + _id)
                    .set("Authorization", "Bearer " + token)
                    .send()
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(200);
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
        describe("UPDATE Request", function () {
            it("should return proper value", function (done) {
                var sample_body = { name: "First Client - Updated" };
                chai.request(index_1.Tent.app())
                    .put("/api/userauths/" + _id)
                    .set("Authorization", "Bearer " + token)
                    .send(sample_body)
                    .then(function (res) {
                    try {
                        expect(res).to.have.status(200);
                        expect(res.body.name).to.be.equal(sample_body.name);
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
        describe("DELETE Request", function () {
            it("should return proper value", function (done) {
                var _this = this;
                chai.request(index_1.Tent.app())["delete"]("/api/userauths/" + _id)
                    .set("Authorization", "Bearer " + token)
                    .send()
                    .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        try {
                            expect(res).to.have.status(200);
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
        after(function (done) {
            entity.Schema.model.deleteMany({}, done);
        });
    });
    after(function () {
        index_1.Tent.AppServer.close();
    });
});
