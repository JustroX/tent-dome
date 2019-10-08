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

/*******
*
*	Copyright (C) 2019  Justine Che T. Romero
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
********/

import { Model } from './model'

/**
* Plugin Options for creating new plugins via Plugin decorator.
*/
export interface PluginOptions
{
	/** Name  of the plugin */
	name : string,
	/** Dependencies  of the plugin */
	dependencies : string[],
}

/**
* Plugin interface.
*/
export interface PluginInterface
{
	/** Name of the Plugin */
	name : string,

	/** Dependencies of the Plugin */
	dependencies: string[],

	/** Initialization function. */
	init() : void,

	/** Initialization of global function. */
	initGlobal? : Function,

	/** Model which plugin instance is installed. */
	model ?: Model<any>,

	/** Other plugin declarations. */
	[ key : string ] : any
}

/** Plugin constructor function */
type Constructor<T> = { new(...args: any[]) : T }

/**
* Plugin decorator factory
* @param options Plugin options
*/
export function Plugin (options : PluginOptions) {
  /**
	* Plugin Decorator
	* @param constructorFn Constructor function of the class
	*/
  return function (constructorFn : Constructor<any>) {
    if (!constructorFn.prototype.init) { throw new Error('Plugins should have an init() method.') }
    constructorFn.prototype.name = options.name
    constructorFn.prototype.dependencies = options.dependencies
  }
}

export class PluginClass {
	name : string;
	dependencies : string[]
}
