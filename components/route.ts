import { Tent } from "../index";

import { Model } from "./model";

import { Middlewares } from "./routes/middlewares";
import { Builder } from "./routes/builder";
import { Router } from "express";


interface BuilderConfig<T>
{
	builder : Builder<T>,
	method	: "GET" | "POST" | "PUT" | "DELETE" | "LIST" ,
	endpoint : string
}

type Methods  = "GET" | "POST" | "PUT" | "DELETE" | "LIST";
type MethodsFunc = "get" | "post" | "put" | "delete" | "list";


export class Routes<T>
{
	router  : Router ;
	builders : BuilderConfig<T>[] = [];
	name : string = "";

	constructor( name : string )
	{
		this.name = name;
		this.router = Router();
	}

	register() : void
	{
		for(let i in this.builders)
		{
			let item 	: BuilderConfig<T> = this.builders[i];
			let endpoint : string  = item.endpoint;
			let method 	: MethodsFunc  = ( item.method as Methods ).toLowerCase() as MethodsFunc;
			let builder : Builder<T> = item.builder;

			if( method == "list" )
				this.router.get(endpoint , ...builder.expose() );
			else if(method == "post")
				this.router.post(endpoint , ...builder.expose() );
			else
				this.router[method](endpoint + ":id", ...builder.expose() );

		}
	}

	endpoint( endpoint : string , method: Methods , fresh : boolean = false) : Builder<T>
	{
		let a : BuilderConfig<T> = 
		{
			builder : new Builder<T>( this.name ),
			method  : method,
			endpoint : endpoint
		};

		this.builders.push(a);
		return a.builder;
	}

	expose() : Router
	{
		return this.router;
	}



	/**
	 * Default Builders
	 */

	create() : Builder<T>
	{
		let builder : Builder<T> = this.endpoint( "/" , "POST" , false );
		
		builder
		 .model(this.name)
		 .create()
		 .sanitize()
		 .assign()
		 .save()
		 .show();
		

		return builder;
	}

	update() : Builder<T>
	{
		let builder : Builder<T> = this.endpoint( "/" , "PUT" , false );
		
		builder
		 .model(this.name)
		 .read()
		 .sanitize()
		 .assign()
		 .save()
		 .show();

		return builder;
	}

	read() : Builder<T>
	{
		let builder : Builder<T> = this.endpoint( "/" , "GET" , false );
		
		builder
		 .model(this.name)
		 .read()
		 .show();

		return builder;
	}
	
	list() : Builder<T>
	{
		let builder : Builder<T> = this.endpoint( "/" , "LIST" , false );
		builder
		 .model(this.name)
		 .param()
		 .list()
		 .present();
		return builder;
	}
	
	delete() : Builder<T>
	{
		let builder : Builder<T> = this.endpoint( "/" , "DELETE" , false );
		
		builder
		 .model(this.name)
		 .read()
		 .remove()
		 .success();

		return builder;
	}




}

export function RegisterRoute() : Router
{
	let router = Router();

	router.use( "/" , Middlewares.initTent as any );
	return router;
}