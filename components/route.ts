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



	/**
	 * Default Builders
	 */

	create( endpoint : string , fresh :  boolean = false ) : Builder<T>
	{
		let builder : Builder<T> = this.endpoint( endpoint , "POST" , fresh );
		
		builder
		 .model()
		 .create()
		 .sanitize()
		 .assign()
		 .save();
		

		return builder;
	}

	update( endpoint : string , fresh :  boolean = false ) : Builder<T>
	{
		let builder : Builder<T> = this.endpoint( endpoint , "PUT" , fresh );
		
		builder
		 .model()
		 .read()
		 .sanitize()
		 .assign()
		 .save();

		return builder;
	}

	read( endpoint : string , fresh :  boolean = false ) : Builder<T>
	{
		let builder : Builder<T> = this.endpoint( endpoint , "GET" , fresh );
		
		builder
		 .model()
		 .read()

		return builder;
	}
	
	list( endpoint : string , fresh :  boolean = false ) : Builder<T>
	{
		let builder : Builder<T> = this.endpoint( endpoint , "LIST" , fresh );
		
		builder
		 .model()
		 .param()
		 .list()

		return builder;
	}
	
	delete( endpoint : string , fresh :  boolean = false ) : Builder<T>
	{
		let builder : Builder<T> = this.endpoint( endpoint , "DELETE" , fresh );
		
		builder
		 .model()
		 .read()
		 .remove()

		return builder;
	}



}

export function RegisterRoute() : Router
{
	let prefix = Tent.get<string>("api prefix");
	let router = new Router();

	router.use( "/" + prefix , Middlewares.initTent );
	return router;
}