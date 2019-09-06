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
	res 		: Request;
	req 		: Response;
	model 		: Model.Model<SchemaInterface>;
	document 	: Document;
	collection 	: MongooseModel;
	payload 	: SchemaInterface;
	list		: Document[];

	param		: QueryParams;

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
			this.list = await this.collection.find(this.param).exec();
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

	Param( params : string )
	{
		this.param = Parse( params );
	}
	
	async FreshDocument()
	{
		this.document = new this.collection();
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
	
	apiError( statusCode: any, error : any, detail ?: any )
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
		
		this.res.json(data);
		
		return assign({
			statusCode: statusCode,
		}, data);
	}
}