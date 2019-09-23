"use strict";
/**
 * @module Plugin
 *
 *
 */
exports.__esModule = true;
/**
* Plugin decorator factory
* @param options Plugin options
*/
function Plugin(options) {
    /**
    * Plugin Decorator
    * @param constructorFn Constructor function of the class
    */
    return function (constructorFn) {
        if (!constructorFn.prototype.init)
            throw "Plugins should have an init() method.";
        constructorFn.prototype.name = options.name;
        constructorFn.prototype.dependencies = options.dependencies;
    };
}
exports.Plugin = Plugin;
