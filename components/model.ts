import { TentDome, Tent } from "../index";

import { Schema , SchemaConfig , SchemaDefinition } from "./schema"
import { Permissions } from "./permission";
import { Routes	, RegisterRoute } from "./route";
import { Method 	 } from "./method";
import { Validation  } from "./validation";
import {  Expand } from "./expand";


import { Application as ExpressApp } from "express";
import * as pluralize from "pluralize";

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
	
	Schema 		: Schema;
	Permissions ;
	Method		;
	Routes		: Routes<T>;
	Expand 		: Expand;

	constructor(name : string)
	{
		this.name = name;
		this.dbname = pluralize(name);

		this.Routes = new Routes<T>( this.name );
		this.Schema = new Schema( name );
		this.Method = new Method();
	}

	define( schema : SchemaDefinition, config : SchemaConfig = {} ) : void
	{
		this.Schema.define( schema, config );
	}

	register() : void
	{
		this.Schema.register();
		this.Method.register();
		this.Routes.register();

		Models[ this.name ] = this;
	}
}
