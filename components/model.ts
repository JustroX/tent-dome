import { TentDome, Tent } from "../index";
import { Document, SchemaDefinition } from "mongoose";

import { Schema , SchemaConfig } from "./schema"
import { Permissions } from "./permission";
import { Routes	, RegisterRoute } from "./route";
import { Method 	 } from "./method";
import { Validation  } from "./validation";
import {  Expand } from "./expand";
import {  PluginInterface } from "./plugin";


import { Application as ExpressApp } from "express";
import pluralize = require("pluralize");
import Assert 	 = require("assert");

interface ModelStore<T>
{
	[ key : string ] : Model<T>
}

var Models : ModelStore<any> = {};
export function get<T>( name : string ) : Model<T>
{
	return Models[name];
}

export function RegisterModels( app : ExpressApp )
{
	app.use( "/" + Tent.get<string>("api prefix") , RegisterRoute() );
	for(let name in Models)
	{
		let model : Model<any> = Models[name]; 
		app.use(  "/" + Tent.get<string>("api prefix") + "/" + model.dbname , model.Routes.expose());

	}
}

export class Model<T> 
{
	name : string;
	dbname : string;
	
	Schema 		: Schema<T>;
	Routes		: Routes<T>;
	Expand 		: Expand | undefined;
	Method 		: Method | undefined;

	plugins : 
	{
		[ pluginName : string  ] : PluginInterface
	} = {};
	
	constructor(name : string)
	{
		this.name = name;
		this.dbname = pluralize(name);

		this.Routes = new Routes<T>( this.name );
		this.Schema = new Schema<T>( name );
		this.Method = new Method();
		this.Expand = new Expand();
	}

	define( schema : SchemaDefinition , config : SchemaConfig = {} ) : void
	{
		this.Schema.define( schema, config );
	}

	register() : void
	{
		(this.Schema as Schema<T>).register();
		(this.Method as Method).register();
		(this.Routes as Routes<T>).register();

		Models[ this.name ] = this;
	}

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
