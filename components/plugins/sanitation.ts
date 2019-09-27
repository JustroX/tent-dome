/**
* ## Sanitation Plugin
*
* This plugin will attach middlewares that would whitelist / blacklist inbound and outbound data of a `Model`.
*
* ### Definition
* - **Inbound Data**  - this is the request body for `PUT` and `POST` - `req.body`
* - **Outbound Data** - this is the `req.tent.document` and `req.tent.list` before `present` or `show` middleware is called.
*
* ### Motivation
* Sanitize requests so users can't alter model fields that are readonly for `user`.
* Also, sanitize responses so users can't read sensitive information.
*
* ### Installation
* Sanitation module comes prebuilt to tent.
*
* ```js
* import { Sanitation } from "tent-dome";
*
* var BooksEntity = tent.Entity("Book",{
* 	name 		  	 : String,
* 	date 		 	 : { type: Date, default: Date.now },
* 	writeonlyField   : String,
* 	readonlyField    : String
* });
* BooksEntity.install(new Sanitation());
*
* ```
*
* ### Usage
*
* Define access rules.
* ```js
*
* 	var rules = BooksEntity.plugins.sanitation;
* 	rules.inbound.blacklist("readonlyField");
* 	rules.outbound.whitelist(["readonlyField", "name", "date"]);
*
* ```
*
* @module SanitationPlugin
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

import { Plugin, PluginInterface } from '../plugin'
import { Accessor, Document } from '../routes/accessor'
import { Request as ExpressRequest, Response, NextFunction } from 'express'
import { Model } from '../model'
import assert = require('assert');

interface Request extends ExpressRequest
{
	tent?: Accessor<any>
}

function isKey<T> (field : (keyof T) | (keyof T)[]) : field is keyof T {
  return typeof field === 'string'
}

class Bound<T> {
	whitelisted : (keyof T)[] = [];
	blacklisted : (keyof T)[] = [];

	whitelist (field : (keyof T) | (keyof T)[]) : void {
	  assert(!this.blacklisted.length, 'You can only whitelist or blaclist but not both.')

	  if (isKey<T>(field)) { this.whitelisted.push(field) } else { this.whitelisted.push(...field) }
	}

	blacklist (field : (keyof T) | (keyof T)[]) : void {
	  assert(!this.whitelisted.length, 'You can only whitelist or blaclist but not both.')

	  if (isKey<T>(field)) { this.blacklisted.push(field) } else { this.blacklisted.push(...field) }
	}
}

interface Dictionary
{
	[ key : string ] : any;
}

@Plugin({
  name: 'sanitation',
  dependencies: []
})
export class Sanitation<T> {
	inbound : Bound<T>;
	outbound : Bound<T>;
	model ?: Model<T>;

	constructor () {
	  this.inbound = new Bound<T>()
	  this.outbound = new Bound<T>()
	}

	init () {
	  if (this.model) {
	    this.model.Routes.builder('/', 'POST').post('model', this.inboundMiddleware())
	    this.model.Routes.builder('/', 'PUT').post('model', this.inboundMiddleware())

	    this.model.Routes.builder('/', 'GET').pre('show', this.outboundMiddleware())
	    this.model.Routes.builder('/', 'LIST').pre('present', this.outboundMiddleware())
	  }
	}

	inboundMiddleware () {
	  const _this = this
	  return function (req: Request, res: Response, next : NextFunction) {
	    const inbound = _this.inbound

	    if (inbound.whitelisted.length) {
	      const body : Partial<T> = {}
	      for (const i of inbound.whitelisted) { body[i] = req.body[i] }
	      req.body = body
	    } else {
	      for (const i of inbound.blacklisted) {
	        if (i in req.body) { delete req.body[i] }
	      }
	    }
	    next()
	  }
	}

	outboundMiddleware () {
	  const _this = this
	  return function (req: Request, res: Response, next : NextFunction) {
	    const tent : Accessor<T> = req.tent as Accessor<T>

	    // sanitize list
	    const outbound = _this.outbound

	    if (outbound.whitelisted.length) {
	      if (tent.list) {
	        tent.list = tent.list.map((x : Document<T>) => {
	          const d : Document<T> = {} as Document<T>

	          for (const i of outbound.whitelisted) { d[i] = x.get(i as string) }

	          return d
	        })
	      }
	      if (tent.document) {
	        const d : Document<T> = {} as Document<T>
	        for (const i of outbound.whitelisted) { d[i] = tent.document.get(i as string) }
	        tent.document = d
	      }
	    } else {
	      if (tent.list) {
	        tent.list = tent.list.map((x : Document<T>) => {
	          for (const i of outbound.blacklisted) {
	            if (x[i]) { delete x[i] }
	          }
	          return x
	        })
	      }
	      if (tent.document) {
	        for (const i of outbound.blacklisted) {
	          if (tent.document[i]) { delete tent.document[i] }
	        }
	      }
	    }

	    next()
	  }
	}
}

export interface Sanitation<T> extends PluginInterface{}
