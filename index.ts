/**
* # Tent Framework
* This module contains functions and definitions needed to setup a tent app.
* @module Tent
*/

/**
*
* Copyright (C) 2019  Justine Che T. Romero
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
********/

import { SchemaDefinition as Definition, Schema } from 'mongoose'
import { Model, RegisterModels, Models } from './components/model'
import { Server, HttpServerInterface } from './components/server'
import { SchemaConfig } from './components/schema'

// Expose Plugin Module
import * as PluginModule from './components/plugin'

// Expose Route Module
import * as RouteModule from './components/route'

// Expose Prebuilt Plugins

import * as SanitationPluginModule from './components/plugins/sanitation'
import * as ValidationModule from './components/plugins/validation'
import * as AuthenticationModule from './components/plugins/authentication'
import * as PermissionModule from './components/plugins/permission'
import assert = require('assert');

/** Expose Plugin Class */
export var Plugin = PluginModule.Plugin
/** Expose Plugin Interface */
export interface PluginInterface extends PluginModule.PluginInterface {};

/** Expose Route Class */
export var Route = RouteModule.Routes
export var Sanitation = SanitationPluginModule.Sanitation
export var Validation = ValidationModule.Validation
export var Authentication = AuthenticationModule.AuthenticationPlugin
export var Permission = PermissionModule.Permission

/** Expose mongoose types */
export var Types = Schema.Types

/**
* Configuration options for Tent
*/
export interface TentOptionsInterface
{
	'api prefix' ?: string,
	'mongodb uri' ?: string,
	[ key : string ]: any
}

/**
* Tent-Dome module.
*/
export class TentDome {
	/**
		Application Server
	*/
	AppServer : Server					= {} as Server;
	TentOptions: TentOptionsInterface	= {} as TentOptionsInterface;

	Models : Model<any>[] = [];

	/** Tent Application Plugins */
	plugins : { [ pluginName : string ] : PluginInterface } = {};

	constructor () {
	  this.setDefaultOptions()
	}

	/**
	*  Initialize the app.
	* @param options  Tent application configuration.
	*/
	init (options : TentOptionsInterface) : void {
	  for (const i in options) { this.TentOptions[i] = options[i] }
	  this.AppServer = new Server()
	}

	/**
	* Sets the default options for the application.
	*/
	setDefaultOptions () {
	  this.set<string>('api prefix', 'api')
	}

	/**
	 * Sets an application variable
	 * @param key  Variable name
	 * @param value  Variable value
	 */
	set<T> (key : string, value : T) : void {
	  this.TentOptions[key] = value
	}

	/**
	 * Get the value of an application variable
	 *
	 * @param key  Variable name
	 */
	get<T> (key : string) : T {
	  return this.TentOptions[key]
	}

	/**
	 *Creates a new database model entity.
	 * @param name  Name of the entity.
	 * @param schema  Mongoose schema of the model.
	 * @param config  Mongoose model configuration.
	 * @typeparam T Schema interface of the model.
	 */
	Entity<T> (name: string, schema : Definition, config : SchemaConfig = {}) : Model<T> {
	  const model = new Model<T>(name)

	  if (schema) { model.define(schema, config) }

	  return model
	}

	/**
	*Start the application
	*
	*@param port The port of the server.
	*/

	start (port : number = 7072) : Promise<void> {
	  RegisterModels(this.app())
	  this.AppServer.initDatabase(this.get<string>('mongodb uri'))
	  return this.AppServer.start(port)
	}

	/**
	* Returns the http server.
	*/
	server () : HttpServerInterface {
	  return this.AppServer.server
	}

	/**
	*Returns the express app.
	*/
	app () {
	  return this.AppServer.app
	}

	/**
	* Installs a plugin globally.
	* @param plugin The plugin instance
	*/
	install (plugin : any & PluginInterface) {
	  assert(!this.plugins[plugin.name], 'Plugin is already installed.')
	  assert(plugin.name, 'Trying to install an invalid plugin.')
	  assert(plugin.dependencies, 'Trying to install an invalid plugin.')
	  assert(plugin.initGlobal, 'Trying to install an invalid global plugin.')

	  this.plugins[plugin.name] = plugin
	}

	/**
	* Registers all global plugins and model routes. Add the express app on their scope.
	*/
	register () {
	  for (const i in this.plugins) {
	    this.plugins[i].app = this.app();
	    (this.plugins[i].initGlobal as Function)()
	  }

	  for (const i in Models) {
			  Models[i].Routes.register()
	  }
	}
}

export var Tent = new TentDome()
