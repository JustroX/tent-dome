import { Request, Response } from "express";
import * as assign from "object-assign";
import * as Model from "../model";
import * as flatten from "flat";
import * as Assert from "assert";
import { Parse, QueryParams } from "./params";

var { unflatten } = flatten;

import { Document , MongooseModel } from "mongoose";

export class Accessor<SchemaInterface>
{
	res 		: Request | undefined;
	req 		: Response | undefined;
	model 		: Model.Model<SchemaInterface> | undefined;
	document 	: Document | undefined;
	collection 	: MongooseModel | undefined;
	payload 	: SchemaInterface | undefined;
	list		: Document[] | undefined;

	param		: QueryParams | undefined;

	constructor( req : Request , res : Response )
	{
		this.res = res;
		this.req = req;
	}

	Model( name : string )
	{
		this.model 		= Model.get(name);
		this.collection = this.model.Schema.model;
	}

	Sanitize(body : any)
	{
		let payload : SchemaInterface = {} as SchemaInterface;

		/**
		 *	@Todo Put validation code here
		 */

		for( let i in body )
		{
			payload[i] = body[i];
		}

		this.payload = flatten(payload);
	}

	Assign()
	{
		for(let i in this.payload)
			this.document.set( i , this.payload[i] );
	}

	async Read( id : string ) : Promise<void>
	{
		try
		{
			this.document = (await this.collection.find({ _id : id }).exec())[0];
			Assert(this.document, "Document not found");
		}
		catch(e)
		{
			throw e;
		}
	}
	
	async List() : Promise<void>
	{
		try
		{
			let { sort, filters, populate, pagination } = this.param as QueryParams; 

			let query = this.collection.find(filters);

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
		try
		{
			await this.document.save();
		}
		catch(e)
		{
			throw e;
		}
	}
	
	async Delete() : Promise< void >
	{
		try
		{
			await this.document.delete();
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
			str += i + ":" + params[i] + '&';
		this.param = Parse( str );
	}
	
	async FreshDocument()
	{
		Assert(this.collection,"`Model` should be called first before calling `FreshDocument`");
		this.document = new this.collection();
	}


	Present()
	{
		/**
		* @Todo sanitize output
		*/

		return this.list;
	}

	Show()
	{
		/**
		* @Todo sanitize output
		*/

		return this.document;
	}
}

export class Dispatcher
{
	res : Request;
	req : Response;

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