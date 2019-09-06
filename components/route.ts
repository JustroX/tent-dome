import { Tent } from "../index";

import { Model } from "./model";

import * as Middlewares from "./routes/middlewares";
import { Builder } from "./routes/builder";
import { Router } from "express";


interface BuilderConfig<T>
{
	builder : Builder<T>,
	method	: "GET" | "POST" | "PUT" | "DELETE" | "LIST" 
}

interface BuilderStore<T>
{
	[ key: string ] : BuilderConfig<T>
}


export class Routes<T>
{
	router  : Router;
	builders : BuilderStore<T>;
	name : string = "";

	constructor( name : string )
	{
		this.name = name;
		this.router = new Router();
	}

	register() : void
	{
		for(let endpoint in this.builders)
		{
			let item 	: BuilderConfig<T> = this.builders[endpoint];
			let method 	: string  = ( item.method as string ).toLowerCase();
			let builder : Builder<T> = item.builder;

			if( method == "list" )
				this.router.get(endpoint , ...builder.expose() );
			else if(method == "post")
				this.router.post(endpoint , ...builder.expose() );
			else
				this.router[method](endpoint + "/:id", ...builder.expose() );
		}
	}

	create( endpoint : string , fresh :  boolean = false ) : Builder<T>
	{
		return this.endpoint( endpoint , "POST" , fresh );
	}

	update( endpoint : string , fresh :  boolean = false ) : Builder<T>
	{
		return this.endpoint( endpoint , "PUT" , fresh );
	}

	read( endpoint : string , fresh :  boolean = false ) : Builder<T>
	{
		return this.endpoint( endpoint , "GET" , fresh );
	}
	
	list( endpoint : string , fresh :  boolean = false ) : Builder<T>
	{
		return this.endpoint( endpoint , "LIST" , fresh );
	}
	
	delete( endpoint : string , fresh :  boolean = false ) : Builder<T>
	{
		return this.endpoint( endpoint , "DELETE" , fresh );
	}



	endpoint( endpoint : string , method: "GET" | "POST" | "PUT" | "DELETE" | "LIST"  , fresh : boolean = false) : Builder<T>
	{
		let a : BuilderConfig<T> = 
		{
			builder : new Builder<T>( this.name ),
			method  : method
		};

		this.builders[endpoint] = a;
		return a.builder;
	}

	expose() : Router
	{
		return this.router;
	}

}

export function RegisterRoute() : Router
{
	let prefix = Tent.get<string>("api prefix");
	let router = new Router();

	router.use( "/" + prefix , Middlewares.initTent );
	return router;
}