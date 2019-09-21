import { Request, Response } from "express";
import assign = require("object-assign");
import { Model , get } from "../model";
import flatten  = require("flat");
import Assert  = require("assert");
import { Parse, QueryParams } from "./params";

var { unflatten } = flatten;

import { Document as MongooseDocument , Model as MongooseModel, Schema } from "mongoose";

export type Document<T> = MongooseDocument & Partial<T>;
type Collection<T> = MongooseModel<Document<T>>;

interface Dictionary
{
	[ key : string ] : any;
}

export class Accessor<T>
{
	res 		: Response ;
	req 		: Request  ;
	model 		: Model<T> | undefined;
	document 	: Document<T> | undefined ;
	collection 	: Collection<Document<T>> | undefined;
	payload 	: Dictionary | undefined;
	list		: Document<T>[] | undefined;

	param		: QueryParams | undefined;

	constructor( req : Request , res : Response )
	{
		this.res = res;
		this.req = req;
	}

	Model( name : string )
	{
		this.model 		= get(name);
		this.collection = this.model.Schema.model;
	}

	Sanitize(body : T )
	{
		Assert(this.collection && this.model ,"Sanitize can not be called without first calling Model");

		let payload : Dictionary = {} as Dictionary;

		let paths : Dictionary = ((this.collection as Collection<T>).schema as Schema & { paths: Dictionary}).paths ;
		let _body : Dictionary = flatten(body,{safe: true})
		for( let i in _body )
		{
			if(paths[i])
				payload[i] = _body[i];
		}

		this.payload = payload;
	}

	Assign()
	{
		Assert(this.payload,"Assign can not be called without first calling Sanitize");
		Assert(this.document,"Assign can not be called without first calling Read or FreshDocument");
		for(let i in this.payload)
			(this.document as Document<T> ).set( i , this.payload[i] );
	}

	async Read( id : string ) : Promise<void>
	{
		Assert(this.collection,"Read cannot be used when model is not yet called.")
		this.document = (await (this.collection as Collection<T>).find({ _id : id }).exec())[0];
		Assert(this.document, "Document not found");
		
	}
	
	async List() : Promise<void>
	{
		try
		{
			let { sort, filters, populate, pagination } = this.param as QueryParams; 

			let query = (this.collection as Collection<T>).find(filters);

			query.sort(sort)
				 .limit(pagination.limit)
				 .skip(pagination.offset * pagination.limit);

			for(let field of populate)
				query.populate( field );

			this.list = await query.exec();
		}
		catch(e)
		{
			throw e;
		}
	}

	async Save() : Promise< void >
	{
		Assert(this.document,"Save can not be called without first calling Read or FreshDocument");
		try
		{
			await (this.document as Document<T>).save();
		}
		catch(e)
		{
			throw e;
		}
	}
	
	async Delete() : Promise< void >
	{
		Assert(this.document,"Delete can not be called without first calling Read");
		Assert(!(this.document as Document<T>).isNew,"Delete can not be called when Fresh Document is called.");
		try
		{
			await (this.document as Document<T>).remove();
		}
		catch(e)
		{
			throw e;
		}
	}

	Param( params : { [key:string] : string } )
	{
		let str : string= "";
		for(let i in params)
			str += i + "=" + params[i] + '&';
		str = str.slice(0,str.length-1);

		this.param = Parse( str );
	}
	
	async FreshDocument()
	{
		Assert(this.collection,"`Model` should be called first before calling `FreshDocument`");
		this.document = new (this.collection as Collection<T>)();
	}


	Present()
	{
		Assert(this.list,"Present can not be called without first calling List");

		/**
		* @Todo sanitize output
		*/

		return this.list;
	}

	Show()
	{
		Assert(this.document,"Show can not be called without first calling Read");
		Assert(!(this.document as Document<T>).isNew,"Show can not be called when FreshDocument is called.");
	
		/**
		* @Todo sanitize output
		*/

		return this.document;
	}
}

export class Dispatcher
{
	req : Request	;
	res : Response	;

	constructor( req : Request , res : Response )
	{
		this.res = res;
		this.req = req;
	}

	/**
	* From KeystoneJS
	*/
	
	apiError( statusCode: any, error? : any, detail ?: any )
	{
		if (typeof statusCode !== 'number' && detail === undefined) {
			detail = error;
			error = statusCode;
			statusCode = 500;
		}

		if (statusCode) {
			this.res.status(statusCode);
		}

		if (!detail && typeof error === 'object'
			&& error.toString() === '[object Object]'
			&& error.error && error.detail)
		{
			detail = error.detail;
			error = error.error;
		}

		if (error instanceof Error) {
			error = error.name !== 'Error' ? error.name + ': ' + error.message : error.message;
		}
		if (detail instanceof Error) {
			detail = detail.name !== 'Error' ? detail.name + ': ' + detail.message : detail.message;
		}

		var data = typeof error === 'string' || (error && detail)
			? { error: error, detail: detail }
			: error;
		
		this.res.send(data);
		
		return assign({
			statusCode: statusCode,
		}, data);
	}
}