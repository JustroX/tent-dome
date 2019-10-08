"use strict";
/**
* ### Plugins
*
* Sometimes there is a need to extend the funcionality of a certain Model entity.
* An instance of this would be to add caching capabilities, user-defined sanitation, rate-limiting and etc.
* Hence, Tent-Dome provide ways to implement plugins.
*
* ## Defining a plugin.
*
* The three requirements for having a valid plugin would be `name` and `dependecy` property and an `init()` method.
*
* ```js
*
* class SamplePlugin
* {
*	constructor()
*	{
*		this.name 		= "sample-plugin";
*		this.dependency = [ "dependency-1", "dependency-2" ];
*	}
*   init() {}
* }
*
* ```
*
* or using Typescript decorators.
*
* ```ts
* import { Plugin, PluginInterface } from "tent-dome";
*
* @Plugin({
*   name 	   : "sample-plugin",
*   dependency :  [ "dependency-1", "dependency-2" ]
* })
* class SamplePlugin()
* {
*	constructor() {}
*   init() {}
* }
*
* interface SamplePlugin extends PluginInterface{}
*
* ```
*
* - `name` 		- name of the plugin.
* - `dependecy` - list of the names of the dependency plugins.
* - `init`		- this function will be called whenever the model is registered.
*
*
* ## Installing a plugin
*
* To install a plugin in a given model, call `model.install()` and pass the instance of the plugin.
*
* ```js
*
*	//Model definition
*
*	var UserEntity = tent.Entity("User",{
*		name : String,
*		password : String
*	});
*
*	UserEntity.Routes.create();
*	UserEntity.Routes.update();
*	UserEntity.Routes.read();
*	UserEntity.Routes.list();
*	UserEntity.Routes.delete();
*
*	//install plugin
*   UserEntity.install( new SamplePlugin() ) ;
*
*	//Register model
* 	UserEntity.register();
*
* ```
*
* When the `Model.register()` is called, the plugin will be initialized.
*
* ## Defining the plugin
*
* Once the `Model.register()` is called, `this.model` will be available to the plugin.
* Model customization can now be done via `init()`.
*
* ```js
*
* init()
* {
*
*	//add encryption middleware before the tagged `save` middleware.
*
*	this.model.Routes.builder("/","POST").pre("save", encryptionMiddleware );
*	this.model.Routes.builder("/","PUT" ).pre("save", encryptionMiddleware );
*
* }
*
* ```
*
* The plugin is now ready and can now be used into multiple models.
*
*
*
*
*
*
* @module Plugin
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
        if (!constructorFn.prototype.init) {
            throw new Error('Plugins should have an init() method.');
        }
        constructorFn.prototype.name = options.name;
        constructorFn.prototype.dependencies = options.dependencies;
    };
}
exports.Plugin = Plugin;
var PluginClass = /** @class */ (function () {
    function PluginClass() {
    }
    return PluginClass;
}());
exports.PluginClass = PluginClass;
