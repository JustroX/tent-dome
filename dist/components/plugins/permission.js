"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var plugin_1 = require("../plugin");
var index_1 = require("../../index");
var assert = require("assert");
/** Permission plugin. */
var Permission = /** @class */ (function () {
    function Permission() {
        /** Current endpoints and roles that will be allowed. */
        this.endpoints = {};
    }
    /**
    * Add an endpoint to authorization.
    * @param name Name of the endpoint.
    * @param method Request method ( GET | PUT | POST | DELETE | LIST )
    * @param role Role to be allowed.
    */
    Permission.prototype.endpoint = function (name, method, role) {
        var _a;
        if (typeof role == "string")
            role = [role];
        var identifier = name + "-" + method;
        if (identifier in this.endpoints)
            (_a = this.endpoints[identifier].allow).push.apply(_a, role);
        else
            this.endpoints[identifier] =
                {
                    endpoint: name,
                    method: method,
                    allow: role
                };
    };
    /**
    * Add `POST /` to authorization.
    * @param role Role to be allowed.
    */
    Permission.prototype.create = function (role) {
        this.endpoint("/", "POST", role);
    };
    /**
    * Add `GET /` to authorization.
    * @param role Role to be allowed.
    */
    Permission.prototype.read = function (role) {
        this.endpoint("/", "GET", role);
    };
    /**
    * Add `PUT /` to authorization.
    * @param role Role to be allowed.
    */
    Permission.prototype.update = function (role) {
        this.endpoint("/", "PUT", role);
    };
    /**
    * Add `DELETE /` to authorization.
    * @param role Role to be allowed.
    */
    Permission.prototype["delete"] = function (role) {
        this.endpoint("/", "DELETE", role);
    };
    /**
    * Add `LIST /` to authorization.
    * @param role Role to be allowed.
    */
    Permission.prototype.list = function (role) {
        this.endpoint("/", "LIST", role);
    };
    /**
    * Add `/do/{method}` to authorization.
    * @param methodName Name of the method.
    * @param requestMethod Request method ( GET | POST | PUT | DELETE | LIST )
    * @param role Roles to be allowed.
    */
    Permission.prototype.method = function (methodName, requestMethod, role) {
        this.endpoint("/do/" + methodName, requestMethod, role);
    };
    /**
    * Add `/do/{method}` to authorization.
    * @param methodName Name of the static.
    * @param requestMethod Request method ( GET | POST | PUT | DELETE | LIST )
    * @param role Roles to be allowed.
    */
    Permission.prototype.static = function (methodName, requestMethod, role) {
        this.endpoint("/do/" + methodName, requestMethod, role);
    };
    /**
    * Returns the permission middleware that will be added after `auth` middleware.
    */
    Permission.prototype.permissionMiddlewareFactory = function (endpoint, method) {
        var _this = this;
        var roleKey = index_1.Tent.get("permission payload role");
        var mw = function (req, res, next) {
            if ("user" in req) {
                var user_1 = req.user;
                if (!user_1[roleKey].length)
                    user_1[roleKey] = [index_1.Tent.get("permission bystander") || "bystander"];
                var roles = _this.endpoints[endpoint + "-" + method].allow
                    .filter(function (x) { return user_1[roleKey].includes(x); });
                if (!roles.length)
                    return res.tent.apiError(403, "Permission Denied.");
                next();
            }
            else
                return res.tent.apiError(403, "Permission Denied.");
        };
        mw.tag = "permission";
        return mw;
    };
    Permission.prototype.init = function () {
        var role = index_1.Tent.get("permission payload role");
        assert(role, "Please set `permission payload role` in Tent global variable.");
        var userModel = index_1.Tent.get("auth user");
        if (this.model.name == userModel) {
            var addRole = function (req, res, next) {
                req.tent.document[role] = req.tent.vars.user.get(role);
                next();
            };
            addRole.tag = "permissionPatch";
            //add middlewares for token
            this.model.Routes.builder("/login", "POST").pre("tokenize", addRole);
            this.model.Routes.builder("/signup", "POST").pre("tokenize", addRole);
        }
        //get all roles
        for (var i in this.endpoints) {
            var endpoint = this.endpoints[i];
            var name_1 = endpoint.endpoint;
            var method = endpoint.method;
            var builder = this.model.Routes.builder(name_1, method);
            builder.pre("model", this.permissionMiddlewareFactory(name_1, method));
        }
    };
    Permission = __decorate([
        plugin_1.Plugin({
            name: "permission",
            dependencies: ["auth"]
        })
    ], Permission);
    return Permission;
}());
exports.Permission = Permission;
;
