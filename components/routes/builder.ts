/**
* ### Builder Module
* This module is used for intuitive construction of route enpoints via chaining middlewares
*
* Example:
*
* ```
* let builder = new Builder("Builder");
* builder
*    .parseBody()
*    .parseCookie()
*    .getDatabaseDocument()
*    .custom((req,res,next)=>
*    {
*      	console.log("Hello");
*      	next();
*    })
*    .userDefined1()
*    .userDefined2()
*    .success();
* 
*
* let middlewares = builder.expose();
* ```
*
* @module Builder
*/


/**
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
*/


import { Request, Response, NextFunction } from "express";
import { Middlewares } from "./middlewares";
import Assert = require("assert");

/** Builder options */
export interface BuilderOptions
{
	"import builtin" : boolean
}

/** Middleware definition */
type Middleware = ( req : Request , res: Response, next : NextFunction  )=> void;

/**
* Route endpoint builder. A class for intuitive construction of route enpoints by chaining middlewares.
* 
* @typeparam T Schema interface.
*
*/
export class Builder<T>
{
	/** Current middleware sequence*/
	middlewares : ( Middleware )[] = [];

	/** Current head index*/
	head : number = 0;

	/** Name of the builder */
	name : string = "";

	/** Other middleware factories. */
	[ key : string] : any;


	/** Dictionary for defined middleware factories*/
	builds : 
	{
		/** Middleware factory. Adds a middleware after the current head. Moves head by one. */
		[ name : string ]: (() => Builder<T>) & { tag?: string }
	} = {};
	
	/** 
	* @param name Name of the builder.
	* @param options builder options. 
	*/
	constructor( name : string 
			, options : BuilderOptions = 
			{
				"import builtin" : true
			}
	)
	{
		this.name = name;

		if( options["import builtin"] )
			this.importBuiltIn();
	}

	/**
	* Adds a custom middleware after the current head. Moves head by one.
	* @param mw Middleware to add.
	*/
	custom(mw :  Middleware  )
	{
		this.middlewares.splice( this.head , 0 , mw );
		this.head ++;
		return this;
	}

	/**
	* Points head to another index.
	* @param index New head index.
	*/
	pointHead( index : number )
	{
		Assert( index >=0  && index < this.middlewares.length , "Head index out of range" );
		this.head = index;
		return this;
	}

	/**
	* Returns the current middleware pointed by the head.
	*/
	lookHead()
	{
		return this.middlewares[this.head];
	}

	/**
	* Points head to the previous middleware.
	*/
	prevHead()
	{
		this.pointHead( this.head - 1 );
		return this;
	}

	/**
	* Points head to the next middleware.
	*/
	nextHead()
	{
		this.pointHead( this.head + 1 );
		return this;
	}

	/**
	* Replaces middleware on the head by another middleware.
	* @param mw Middlware to replace.
	*/
	replaceHead(mw : Middleware )
	{
		this.middlewares[this.head] = mw;
	}

	/**
	* Removes the last middleware on the sequence. Moves the head to the previous one if the head is pointing to the last element.
	*/
	pop()
	{
		this.middlewares.pop();
		this.head = Math.min( this.head, this.middlewares.length - 1 );
	}

	/**
	* Import built in middlewares.
	*/
	importBuiltIn()
	{
		this.define("model", Middlewares.model<T>(this.name) ); 
		this.define("create", Middlewares.create<T>() ); 
		this.define("save", Middlewares.save<T>() ); 
		this.define("read", Middlewares.read<T>() ); 
		this.define("remove", Middlewares.remove<T>() ); 
		this.define("assign", Middlewares.assign<T>() ); 
		this.define("sanitize", Middlewares.sanitize<T>() ); 
		this.define("param", Middlewares.param<T>() ); 
		this.define("list", Middlewares.list<T>() ); 
		this.define("success", Middlewares.success<T>() ); 
		this.define("show", Middlewares.show<T>() ); 
		this.define("present", Middlewares.present<T>() ); 
	}

	/**
	* Defines a reusable middleware inside the builder. Chainable middleware factory will be available once called.
	* @param name Name of the middleware
	* @param mw Middleware 
	*/
	define( name : string, mw :  Middleware  )
	{
		Assert( !(this as unknown as any)[name] , "Builder pipe is already defined" );
		
		const _this : Builder<T> = this;
		this.builds[name] = function()
		{ 
			_this.middlewares.splice( _this.head , 0 , mw );
			_this.head++;
			return _this;
		};

		this.builds[name].tag = name;

		Object.defineProperty(this,name,
		{
			get: function()
			{
				return this.builds[name]
			}
		}) 
	}

	

	/**
	* Inserts a middleware before a reusable middleware.
	* @param name Name of the reusable middleware
	* @param mw Middleware 
	*/
	pre( name : string, mw :  Middleware  )
	{
		for(let i=0; i<this.middlewares.length; i++)
		{
			if((this.middlewares[i] as any ).tag == name)
			{
				this.middlewares.splice( i , 0 , mw );
				return;
			}
		}	
	}
	


	/**
	* Inserts a middleware after a reusable middleware.
	* @param name Name of the reusable middleware
	* @param mw Middleware 
	*/
	post( name : string, mw :  Middleware  )
	{
		for(let i=0; i<this.middlewares.length; i++)
		{
			if((this.middlewares[i] as any ).tag == name)
			{
				this.middlewares.splice( i+1 , 0 , mw );
				return;
			}
		}	
	}
	

	/**
	* Returns the sequence of middlewares.
	*/
	expose() :  ( Middleware )[] 
	{
		return this.middlewares; 
	}
}