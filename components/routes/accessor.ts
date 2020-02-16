/**
* @module Accessor
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

import { Request, Response } from 'express'
import { Model, get } from '../model'
import { Parse, QueryParams } from './params'
import { Document as MongooseDocument, Model as MongooseModel, Schema } from 'mongoose'
import assign = require('object-assign');
import flatten = require('flat');
import Assert = require('assert');

/** Document */
export type Document<T> = MongooseDocument & Partial<T>;

/** Mongoose model interface */
export type Collection<T> = MongooseModel< Document<T> >;

/** Dictionary Interface */
interface Dictionary
{
	[ key : string ] : any;
}

interface ResultInfo{
	numOfDocs : number
}

/** Accessor class. This would be binded to `req.tent` for the middlewares to access.
* @typeparam T Schema interface
*/
export class Accessor<T> {
	/** Express request object */
	res 		: Response ;

	/** Express response object */
	req 		: Request ;

	/** Tent Model */
	model 		: Model<T> | undefined;

	/** Model Document */
	document 	: Document<T> | undefined ;

	/** Mongoose model */
	collection 	: Collection<T> | undefined;

	/** Payload. Value is undefined until Assign() is called */
	payload 	: Dictionary | undefined;

	/** List of Model Documents */
	list		: Document<T>[] | undefined;

	/** Parsed url parameters. Value is undefined untial Param() is called */
	param		: QueryParams | undefined;

	/** Scope reserved for plugins. */
	plugins 	: Dictionary = {};

	/** Returned value by `method` and `static` */
	returnVal 	: any;

	/** Scope reserved for reusable variables */
	vars : Dictionary = {};

	/** Query information */
	info : ResultInfo = { numOfDocs: 0 };

	/**
	* Returns a new accessor instance.
	* @param req Express request
	* @param res Express response
	*/
	constructor (req : Request, res : Response) {
	  this.res = res
	  this.req = req
	}

	/**
	* Assigns value for `Accessor.model` and `Accessor.collection`.
	* @param name Name of the model
	*/
	Model (name : string) {
	  this.model 		= get(name)
	  this.collection = this.model.Schema.model
	}

	/**
	* Assigns value for `Accessor.payload`. Removes fields that are not defined in the schema.
	* @param body Request body
	*/
	Sanitize (body : T) {
	  Assert(this.collection && this.model, 'Sanitize can not be called without first calling Model')

	  if (!this.model) return

	  const payload : Dictionary = {} as Dictionary

	  let paths : Dictionary = ((this.collection as Collection<T>).schema as Schema & { paths: Dictionary}).paths

	  paths =
		{
		  ...paths,
		  ...this.model.Schema.virtuals
		}

	  const _body : Dictionary = flatten(body, { safe: true })
	  for (const i in _body) {
	    if (paths[i]) { payload[i] = _body[i] }
	  }

	  this.payload = payload
	}

	/**
	* Assigns `Accessor.payload` to `Accessor.document`.
	*/
	Assign () {
	  Assert(this.payload, 'Assign can not be called without first calling Sanitize')
	  Assert(this.document, 'Assign can not be called without first calling Read or FreshDocument')
	  for (const i in this.payload) {
	  	if (this.payload[i] || this.payload[i]===false) { (this.document as Document<T>).set(i, this.payload[i]) }
	  }
	}

	/**
	* Fetches the document with an `_id` of `id` from the database and assigns it in `Accessor.document`.
	* @param id _id of the document.
	*/
	async Read (id : string) : Promise<void> {
	  Assert(this.collection, 'Read cannot be used when model is not yet called.')
	  this.document = (await (this.collection as Collection<T>).find({ _id: id }).exec())[0]
	  Assert(this.document, 'Document not found')
	}

	/**
	* Fetches the a query of Documents from the database and assigns them to `Accessor.list`.
	* @param id _id of the document.
	*/
	async List () : Promise<void> {
	  const { sort, filters, populate, pagination, options } = this.param as QueryParams

	  if (options) {
	    const numOfDocs = await (this.collection as Collection<T>).countDocuments(filters).exec()
	    this.info = { numOfDocs }
	  } else {
		  const query = (this.collection as Collection<T>).find(filters)
		  query.sort(sort)
				 .limit(pagination.limit)
				 .skip(pagination.offset * pagination.limit)

		  for (const field of populate) { query.populate(field, this.model.Expand.expose()[field]) }

		  this.list = await query.exec()
	  }
	}

	/**
	* Save changes of `Accessor.document` to the database.
	*/
	async Save () : Promise< void > {
	  Assert(this.document, 'Save can not be called without first calling Read or FreshDocument')
	  await (this.document as Document<T>).save()
	}

	/**
	* Deletes `Accessor.document` from the database.
	*/
	async Delete () : Promise< void > {
	  Assert(this.document, 'Delete can not be called without first calling Read')
	  Assert(!(this.document as Document<T>).isNew, 'Delete can not be called when Fresh Document is called.')
	  await (this.document as Document<T>).remove()
	}

	/**
	* Parses request query and assigns them to `Accessor.param` .
	* @param params Req.query instance
	*/
	Param (params : { [key:string] : string }) {
	  let str : string = ''
	  for (const i in params) { str += i + '=' + params[i] + '&' }

	  str = str.slice(0, str.length - 1)
	  const param = Parse(str)

	  // schema keys
	  const paths : string[] = Object.keys(((this.collection as Collection<T>).schema as Schema & { paths: Dictionary}).paths)

	  // remove fields that are not expandable
	  param.populate = param.populate.filter((x : string) => (this.model as Model<T>).Expand.isExpandable(x))
	  // remove fields that are not defined
	  param.populate = param.populate.filter((x : string) => (this.model as Model<T>).Expand.isExpandable(x))

	  // sort
	  for (const i in param.sort) {
	    if (paths.indexOf(i) === -1) { delete param.sort[i] }
	  }

	  // filters
	  for (const i in param.filters) {
	    if (paths.indexOf(i) === -1) { delete param.filters[i] }
	  }

	  this.param = param
	}

	/**
	* Assigns a new Mongoose Document at `Accessor.document` .
	*/
	FreshDocument () {
	  Assert(this.collection, '`Model` should be called first before calling `FreshDocument`')
	  this.document = new (this.collection as Collection<T>)()
	}

	/**
	*  Returns `Accessor.list`
	*/
	Present () {
	  if (this.param.options) {
	   return this.info
	  }
	  Assert(this.list, 'Present can not be called without first calling List')
	  return this.list
	}

	/**
	*  Returns `Accessor.document`
	*/
	Show () {
	  Assert(this.document, 'Show can not be called without first calling Read')
	  Assert(!(this.document as Document<T>).isNew, 'Show can not be called when FreshDocument is called.')
	  return this.document
	}

	/**
	* Runs method `name` and returns it at `req.tent.returnVal`
	* @param name Name of the method.
	*/
	async Method (name : string) {
	  Assert(this.collection, 'Method can not be called without first calling `Model`')
	  Assert(this.document, 	'Method can not be called without first calling `FreshDocument` or `Read`')

	  if (this.document === undefined) return

	  Assert((this.document as any)[name], 'Method `' + name + '`is nonexistent.')

	  this.returnVal = await ((this.document as any)[name] as Function)()
	}

	/**
	* Runs static `name` and returns it at `req.tent.returnVal`
	* @param name Name of the static.
	*/
	async Static (name : string) {
	  Assert(this.collection, 'Static can not be called without first calling `Model`')
	  Assert((this.collection as any)[name], 'Static `' + name + '`is nonexistent.')

	  this.returnVal = await ((this.collection as any)[name] as Function)()
	}

	/**
	* Returns the value of `req.tent.returnVal`
	*/
	Return () {
	  Assert(this.returnVal, 'Return can not be called without first calling `Method` or `Static`')
	  return this.returnVal
	}
}

/** Dispatcher class. This would be binded to `res.tent` for the middlewares to access.
*/
export class Dispatcher {
	/** Express request object */
	req : Request	;

	/** Express response object */
	res : Response	;

	constructor (req : Request, res : Response) {
	  this.res = res
	  this.req = req
	}

	/**
	* sends an error response to the client.
	*/
	apiError (statusCode: any, error? : any, detail ?: any) {
	  if (typeof statusCode !== 'number' && detail === undefined) {
	    detail = error
	    error = statusCode
	    statusCode = 500
	  }

	  if (statusCode) {
	    this.res.status(statusCode)
	  }

	  if (!detail && typeof error === 'object' &&
			error.toString() === '[object Object]' &&
			error.error && error.detail) {
	    detail = error.detail
	    error = error.error
	  }

	  if (error instanceof Error) {
	    error = error.name !== 'Error' ? error.name + ': ' + error.message : error.message
	  }
	  if (detail instanceof Error) {
	    detail = detail.name !== 'Error' ? detail.name + ': ' + detail.message : detail.message
	  }

	  var data = typeof error === 'string' || (error && detail)
	    ? { error: error, detail: detail }
	    : error

	  this.res.send(data)

	  return assign({
	    statusCode: statusCode
	  }, data)
	}
}
