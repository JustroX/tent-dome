/**
* @module ValidationPlugin
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

import { Plugin } from "../plugin";
import Joi = require("@hapi/joi");

import { Accessor , Dispatcher }  from "../routes/accessor";
import { Model } from "../model";

import { Request as ExpressRequest, Response  as ExpressResponse,NextFunction } from "express";
interface Request extends ExpressRequest
{
	tent: Accessor<any>
}
interface Response extends ExpressResponse
{
	tent: Dispatcher
}

type Middleware = ( req: Request , res: Response, next: NextFunction )=> (void | Promise<void>);

/**
* Utility function for chainable constraints definition
*/
export class ConstraintUtility
{
	/** Validation reference */
	parent : Validation;

	/** 
	* @param parent Validation instance
	*/
	constructor(parent : Validation)
	{
		this.parent = parent;
	}

	/** 
	* @param args - if `args[i]` is string, `args[i]` is a peer
					if `args[i]` is Constraint option, it will be the new option for the relation
	*/
	and( ... args : ( string | ConstraintOptions )[] )
	{
		let list : string[] = [];
		for(let arg of args)
		{
			if(typeof arg == "string")
				list.push(arg);
			else
				this.parent.constraints.and.options = arg;
		}
		this.parent.constraints.and.peers.push(list);
	}

	/** 
	* @param args - if `args[i]` is string, `args[i]` is a peer
					if `args[i]` is Constraint option, it will be the new option for the relation
	*/
	nand( ... args : ( string | ConstraintOptions )[] )
	{
		let list : string[] = [];
		for(let arg of args)
		{
			if(typeof arg == "string")
				list.push(arg);
			else
				this.parent.constraints.nand.options = arg;
		}
		this.parent.constraints.nand.peers.push(list);
	}


	/** 
	* @param args - if `args[i]` is string, `args[i]` is a peer
					if `args[i]` is Constraint option, it will be the new option for the relation
	*/
	or( ... args : ( string | ConstraintOptions )[] )
	{
		let list : string[] = [];
		for(let arg of args)
		{
			if(typeof arg == "string")
				list.push(arg);
			else
				this.parent.constraints.or.options = arg;
		}
		this.parent.constraints.or.peers.push(list);
	}


	/** 
	* @param args - if `args[i]` is string, `args[i]` is a peer
					if `args[i]` is Constraint option, it will be the new option for the relation
	*/
	oxor( ... args : ( string | ConstraintOptions )[] )
	{
		let list : string[] = [];
		for(let arg of args)
		{
			if(typeof arg == "string")
				list.push(arg);
			else
				this.parent.constraints.oxor.options = arg;
		}	
		this.parent.constraints.oxor.peers.push(list);
	}


	/**
	* @param field field to have the relation. 
	* @param args - if `args[i]` is string, `args[i]` is a peer
					if `args[i]` is Constraint option, it will be the new option for the relation
	*/
	with( field : string, ... args : ( string[] | string | ConstraintOptions )[] )
	{
		if(this.parent.constraints.with[field] == undefined)
			this.parent.constraints.with[field] = { peers: [], options: {} };
		for(let arg of args)
		{
			if(typeof arg == "string")
				this.parent.constraints.with[field].peers.push(arg);	
			else
			if(arg instanceof Array )
				this.parent.constraints.with[field].peers.push(...arg);	
			else
				this.parent.constraints.with[field].options = arg;	
		}
	}


	/**
	* @param field field to have the relation. 
	* @param args - if `args[i]` is string, `args[i]` is a peer
					if `args[i]` is Constraint option, it will be the new option for the relation
	*/
	without( field : string, ... args : ( string | ConstraintOptions )[] )
	{
		if(this.parent.constraints.without[field] == undefined)
			this.parent.constraints.without[field] = { peers: [], options: {} };
		for(let arg of args)
		{
			if(typeof arg == "string")
				this.parent.constraints.without[field].peers.push(arg);	
			else
			if(arg instanceof Array )
				this.parent.constraints.without[field].peers.push(...arg);	
			else
				this.parent.constraints.without[field].options = arg;	
		}
	}


	/** 
	* @param args - if `args[i]` is string, `args[i]` is a peer
					if `args[i]` is Constraint option, it will be the new option for the relation
	*/
	xor( ... args : ( string | ConstraintOptions )[] )
	{
		let list : string[] = [];
		for(let arg of args)
		{
			if(typeof arg == "string")
				list.push(arg);
			else
				this.parent.constraints.xor.options = arg;
		}	
		this.parent.constraints.xor.peers.push(list);
	}
}


/**
* Validation Plugin
* This adds validation middleware on `POST` and `PUT`
*/
@Plugin({
	name : "validation",
	dependencies : [],
})
export class Validation
{
	/** Joi reference. */
	joi = Joi;

	/** Validation schema. */
	definition : Definition = {};

	/** Validation contraints */
	constraints : Constraint =
	{
		and : { peers: [], options: {} },
		nand : { peers: [], options: {} },
		oxor : { peers: [], options: {} },
		or : { peers: [], options: {} },
		xor : { peers: [], options: {} },
		with : {},
		without : {}
	};

	constructor(){}	

	/** Defines the validation Schema. */
	schema( schema : Definition )
	{
		this.definition = schema;
		return new ConstraintUtility(this);
	}

	/** Validation middleware factory. This will be called on init. */
	validationMiddleware() : Middleware
	{
		let onFailMiddleware = this.onFailMiddlewareFactory();
		const _this = this;

		return function(req : Request, res: Response , next : NextFunction)
		{
			req.tent.plugins.validation = {};

			// Set up validation schema
			let validation = _this;
			let schema = Joi.object(validation.definition);
			const isRequired = req.method == "POST";
			if(!isRequired)
			{
				schema = schema.optionalKeys(Object.keys(validation.definition));
			}
			
			let constraints = validation.constraints; 
			for(let i in constraints)
			{
				switch (i) {
					case "and":  
						for(let peer of constraints.and.peers )
						schema.and( ...peer); break;
					case "nand": 
						for(let peer of constraints.nand.peers )
						schema.nand(...peer); break;
					case "oxor": 
						for(let peer of constraints.oxor.peers )
						schema.oxor(...peer); break;
					case "or":   
						for(let peer of constraints.or.peers )
						schema.or(  ...peer); break;
					case "xor":  
						for(let peer of constraints.xor.peers )
						schema.xor( ...peer); break;

					//with and withouts
				}
			}


			let  { value, error }  = schema.validate( req.tent.payload )

			req.tent.plugins.validation.value = value;
			req.tent.plugins.validation.error = error;
			
			if(error)
				onFailMiddleware(req,res,next);
			else
				next();	

		}
	}

	/** This function will replace the current `onFailMiddlewareFactory` by the parameter. */
	onFail( mw: () => Middleware )
	{
		this.onFailMiddlewareFactory  = mw;
	}

	/** Default on fail middleware factory */
	onFailMiddlewareFactory() : Middleware
	{
		/** On fail middleware */
		return function(req : Request, res: Response , next: NextFunction)
		{
			res.tent.apiError(400,"Request validation failed.")
		};
	}

	/** Plugin initialization */
	init()
	{
		this.model.Routes.builder("/","POST").post("sanitize",this.validationMiddleware());
		this.model.Routes.builder("/","PUT") .post("sanitize",this.validationMiddleware());
	}

}

/**
* Definition interface for Joi schema.
*/
interface Definition
{
	/**
	* Field defintion of schema
	*/
	[key : string] : Joi.AnySchema,
}

/**
* Interface for constraint options.
*/
interface ConstraintOptions
{
	separator ?: boolean
}

/**
* Interface for mutual constraints (many-to-many)
*/
interface MutualConstraint
{
	peers: string[][],
	options : ConstraintOptions
}

/**
*	Interface for single constraint one to many
*/
interface SingleConstraint
{
	[ key : string ] :
	{
		peers	: string[],
		options : ConstraintOptions 
	}
}

/**
* Interface for peer constraints of the schema  
*/
interface Constraint
{
	and		: MutualConstraint,
	nand	: MutualConstraint,
	or		: MutualConstraint,
	oxor	: MutualConstraint,   
	xor		: MutualConstraint,	

	with	: SingleConstraint,
	without : SingleConstraint
}

/**
* Merged Declaration for Validation Plugin
*/
export interface Validation
{
	name : string,
	dependencies : string[],
	model : Model<any>
}