"use strict";
exports.__esModule = true;
var plugin_1 = require("../../components/plugin");
var chai_1 = require("chai");
describe("Plugin", function () {
    describe("Plugin Decorator", function () {
        it("should throw when class has no init() method", function () {
            var A = /** @class */ (function () {
                function A() {
                }
                return A;
            }());
            ;
            chai_1.expect(function () {
                plugin_1.Plugin({
                    name: "Sample",
                    dependencies: ["a", "b"]
                })(A);
            }).to["throw"]();
        });
        it("should add name and dependecies", function () {
            var cons = /** @class */ (function () {
                function cons() {
                }
                cons.prototype.init = function () { };
                return cons;
            }());
            ;
            plugin_1.Plugin({
                name: "Sample",
                dependencies: ["a", "b"]
            })(cons);
            chai_1.expect(cons.prototype.name).to.be.equal("Sample");
            chai_1.expect(cons.prototype.dependencies).to.be.deep.equal(["a", "b"]);
        });
    });
});
