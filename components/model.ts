/**
* @module Model
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





import { TentDome, Tent } from "../index";
import { Document, SchemaDefinition } from "mongoose";

import { Schema , SchemaConfig } from "./schema"
import { Routes	, RegisterRoute } from "./route";
import { Expand } from "./expand";
import { PluginInterface } from "./plugin";


import { Application as ExpressApp } from "express";
import pluralize = require("pluralize");
import Assert 	 = require("assert");

/**
* Dictionary interface for storing Models
*/
interface ModelStore<T>
{
	[ key : string ] : Model<T>
}


/**
* Dictionary for storing Models
*/
var Models : ModelStore<any> = {};




/**
* Returns a specified Model.
* @param name  Name of the model
*/
export function get<T>( name : string ) : Model<T>
{
	return Models[name];
}

/**
* Registers all the model to the express app.
* @param app  Express application
*/
export function RegisterModels( app : ExpressApp )
{
	app.use( "/" + Tent.get<string>("api prefix") , RegisterRoute() );
	for(let name in Models)
	{
		let model : Model<any> = Models[name]; 
		app.use(  "/" + Tent.get<string>("api prefix") + "/" + model.dbname , model.Routes.expose());

	}
}

/**
* This is the Model class used for defining database entities.
* @typeparam T Schema interface of the model 
*/
export class Model<T> 
{
	/**
	* Name of the model
	*/
	name : string;

	/**
	* Pluralized name of the model.
	*/
	dbname : string;
	

	/**
	* Schema of the Model.
	*/
	Schema 		: Schema<T>;


	/**
	* Routes of the Model.
	*/
	Routes		: Routes<T>;


	/**
	* Expand definitions of the Model.
	*/
	Expand 		: Expand | undefined;


	/**
	* Dictionary to store the plugins.
	*/
	plugins : 
	{
		[ pluginName : string  ] : PluginInterface
	} = {};
	


	/**
	* @param name  name of the model
	*/
	constructor(name : string)
	{
		this.name = name;
		this.dbname = pluralize(name);

		this.Routes = new Routes<T>( this.name );
		this.Schema = new Schema<T>( name );
		this.Expand = new Expand();
	}



	/**
	* Defines the model schema.
	* @param schema  Mongoose schema of the model. 
	* @param config  Mongoose model configuration.
	*/
	define( schema : SchemaDefinition , config : SchemaConfig = {} ) : void
	{
		this.Schema.define( schema, config );
	}




	/**
	* Registers the model
	*/
	register() : void
	{
		(this.Schema as Schema<T>).register();
		(this.Routes as Routes<T>).register();

		for(let i in this.plugins)
		{
			this.plugins[i].model = this;
			this.plugins[i].init();
		}

		Models[ this.name ] = this;
	}





	/**
	* Installs a plugin.
	* @param plugin  Plugin to install.
	*/
	install( plugin : any )
	{
		//plugin validity
		Assert( plugin.name 		, "Invalid plugin." );
		Assert( plugin.dependencies , "Invalid plugin." );
		Assert( plugin.init 		, "Invalid plugin." );

		Assert( !(plugin.name in this.plugins) , "Plugin is already installed." );

		let missing_dependencies = plugin.dependencies.filter( (x : string) =>!(x in this.plugins) );
		Assert( !missing_dependencies.length, "Plugin dependencies are not yet installed : " + missing_dependencies.join(",") );

		this.plugins[plugin.name] = plugin;
	}
}
