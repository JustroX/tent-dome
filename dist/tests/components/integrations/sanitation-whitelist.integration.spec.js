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
var sanitation_1 = require("../../../components/plugins/sanitation");
var chai = require("chai");
var chaiHttp = require("chai-http");
var dotenv_1 = require("dotenv");
dotenv_1.config();
var assert = chai.assert, expect = chai.expect, use = chai.use;
use(chaiHttp);
describe("Sanitation Plugin - Integration", function () {
    var entity;
    it("should initialize properly", function () {
        expect(function () {
            index_1.Tent.init({
                "mongodb uri": process.env.TEST_MONGODB_URI
            });
        }).to.not["throw"]();
    });
    it("should create new entity", function () {
        expect(function () {
            entity = index_1.Tent.Entity("Book", {
                name: String,
                readOnly: { type: String, "default": "unwritable" },
                writeOnly: String
            }, {
                toObject: { virtuals: true },
                toJSON: { virtuals: true },
                id: false
            });
            //expose routes
            //inbound
            entity.Routes.create();
            entity.Routes.update();
            //outbound
            entity.Routes.read();
            entity.Routes.list();
            entity.Routes["delete"]();
            entity.install(new sanitation_1.Sanitation());
            var sanitation = entity.plugins.sanitation;
            sanitation.inbound.whitelist(["writeOnly", "name"]);
            sanitation.outbound.whitelist(["readOnly", "name"]);
            entity.register();
            entity.Schema.model.deleteMany({}).exec();
            console.log(entity.Routes.builder("/", "GET").expose());
        }).to.not["throw"]();
    });
    var _id = "";
    describe("#inbound", function () {
        it('should block readonly request', function (done) {
            var _this = this;
            chai.request(index_1.Tent.app())
                .post("/api/books")
                .send({
                name: "inboundBook",
                readOnly: "attempted",
                writeOnly: "modified"
            })
                .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                var a, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            expect(res).to.have.status(200);
                            return [4 /*yield*/, entity.Schema.model.find({}).exec()];
                        case 1:
                            a = (_a.sent())[0];
                            expect(a.readOnly).to.be.equal("unwritable");
                            _id = a._id.toString();
                            done();
                            return [3 /*break*/, 3];
                        case 2:
                            err_1 = _a.sent();
                            done(err_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })["catch"](done);
        });
    });
    describe("#outbound", function () {
        it('should block writeonly GET requests', function (done) {
            chai.request(index_1.Tent.app())
                .get("/api/books/" + _id)
                .then(function (res) {
                try {
                    expect(res).to.have.status(200);
                    expect(res.body.readOnly).to.be.equal("unwritable");
                    expect(res.body.writeOnly).to.not.exist;
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
        it('should block writeonly LIST requests', function (done) {
            chai.request(index_1.Tent.app())
                .get("/api/books/")
                .then(function (res) {
                try {
                    expect(res).to.have.status(200);
                    expect(res.body[0].readOnly).to.be.equal("unwritable");
                    expect(res.body[0].writeOnly).to.not.exist;
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
    });
    it("should start properly", function (done) {
        index_1.Tent.register();
        index_1.Tent.start(3023).then(function () {
            done();
        })["catch"](done);
    });
    after(function () {
        index_1.Tent.AppServer.close();
    });
});
