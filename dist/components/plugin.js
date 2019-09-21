"use strict";
exports.__esModule = true;
function Plugin(options) {
    return function (constructorFn) {
        if (!constructorFn.prototype.init)
            throw "Plugins should have an init() method.";
        constructorFn.prototype.name = options.name;
        constructorFn.prototype.dependencies = options.dependencies;
    };
}
exports.Plugin = Plugin;
