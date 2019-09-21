"use strict";
exports.__esModule = true;
var middlewares_1 = require("./middlewares");
var Assert = require("assert");
var Builder = /** @class */ (function () {
    function Builder(name, options) {
        if (options === void 0) { options = {
            "import builtin": true
        }; }
        this.middlewares = [];
        this.head = 0;
        this.name = "";
        //Builtin functions
        this.model = undefined;
        this.create = undefined;
        this.save = undefined;
        this.read = undefined;
        this.remove = undefined;
        this.assign = undefined;
        this.sanitize = undefined;
        this.param = undefined;
        this.list = undefined;
        this.success = undefined;
        this.show = undefined;
        this.present = undefined;
        this.builds = {};
        this.name = name;
        if (options["import builtin"])
            this.importBuiltIn();
    }
    Builder.prototype.custom = function (mw) {
        this.middlewares.splice(this.head, 0, mw);
        this.head++;
        return this;
    };
    Builder.prototype.pointHead = function (index) {
        Assert(index >= 0 && index < this.middlewares.length, "Head index out of range");
        this.head = index;
        return this;
    };
    Builder.prototype.lookHead = function () {
        return this.middlewares[this.head];
    };
    Builder.prototype.prevHead = function () {
        this.pointHead(this.head - 1);
        return this;
    };
    Builder.prototype.nextHead = function () {
        this.pointHead(this.head + 1);
        return this;
    };
    Builder.prototype.replaceHead = function (mw) {
        this.middlewares[this.head] = mw;
    };
    Builder.prototype.pop = function () {
        this.middlewares.pop();
        this.head = Math.min(this.head, this.middlewares.length - 1);
    };
    Builder.prototype.importBuiltIn = function () {
        this.define("model", middlewares_1.Middlewares.model(this.name));
        this.define("create", middlewares_1.Middlewares.create());
        this.define("save", middlewares_1.Middlewares.save());
        this.define("read", middlewares_1.Middlewares.read());
        this.define("remove", middlewares_1.Middlewares.remove());
        this.define("assign", middlewares_1.Middlewares.assign());
        this.define("sanitize", middlewares_1.Middlewares.sanitize());
        this.define("param", middlewares_1.Middlewares.param());
        this.define("list", middlewares_1.Middlewares.list());
        this.define("success", middlewares_1.Middlewares.success());
        this.define("show", middlewares_1.Middlewares.show());
        this.define("present", middlewares_1.Middlewares.present());
    };
    Builder.prototype.define = function (name, mw) {
        Assert(!this[name], "Builder pipe is already defined");
        var _this = this;
        this.builds[name] = function () {
            _this.middlewares.splice(_this.head, 0, mw);
            _this.head++;
            return _this;
        };
        this.builds[name].tag = name;
        Object.defineProperty(this, name, {
            get: function () {
                return this.builds[name];
            }
        });
    };
    Builder.prototype.pre = function (name, mw) {
        for (var i = 0; i < this.middlewares.length; i++) {
            if (this.middlewares[i].tag == name) {
                this.middlewares.splice(i, 0, mw);
                return;
            }
        }
    };
    Builder.prototype.post = function (name, mw) {
        for (var i = 0; i < this.middlewares.length; i++) {
            if (this.middlewares[i].tag == name) {
                this.middlewares.splice(i + 1, 0, mw);
                return;
            }
        }
    };
    Builder.prototype.expose = function () {
        return this.middlewares;
    };
    return Builder;
}());
exports.Builder = Builder;
