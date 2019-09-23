/**
 * @module Plugin
 * 
 *
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


 import { Model } from "./model";

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
	/** Name of the Plugin*/
	name : string,

	/** Dependencies of the Plugin*/
	dependencies: string[],

	/** Initialization function.*/
	init() : void,

	/** Model which plugin instance is installed.*/
	model ?: Model<any>,

	/** Other plugin declarations.*/
	[ key : string ] : any
}

/** Plugin constructor function */
type Constructor<T> = { new(...args: any[]) : T }


/** 
* Plugin decorator factory
* @param options Plugin options
*/
export function Plugin( options : PluginOptions ) 
{
	/**
	* Plugin Decorator
	* @param constructorFn Constructor function of the class
	*/
	return function( constructorFn : Constructor<any> )
	{
		if(!constructorFn.prototype.init)
			throw "Plugins should have an init() method.";
		constructorFn.prototype.name = options.name;
		constructorFn.prototype.dependencies = options.dependencies;
	} 
}