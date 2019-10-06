/**
 * @module Routes
 *
 *
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

import { Middlewares } from './routes/middlewares'
import { Builder } from './routes/builder'
import { Router } from 'express'

import assert = require('assert');

/**
* HTTP method type
*/
export type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'LIST';

/**
* Lowercase HTTP method
*/
type MethodsFunc = 'get' | 'post' | 'put' | 'delete' | 'list';

/**
* Builder Defintion
* @typeparam T schema of the model
*/
interface BuilderConfig<T>
{
	/** builder instance */
	builder : Builder<T>,

	/** HTTP method */
	method	: Methods,

	/** URL endpoint */
	endpoint : string
}

/**
* Routes class. This class is responsible for organizing and structuring routers and url endpoints of the model.
* @typeparam T schema of the model
*/
export class Routes<T> {
	/** Express router */
	router : Router ;

	/** List of builder definitions */
	builders : BuilderConfig<T>[] = [];

	/** Name of the current model. */
	name : string = '';

	/**
	* @param name pluralized name of the current model
	*/
	constructor (name : string) {
	  this.name = name
	  this.router = Router()
	}

	/**
	* Registers the current route. Exposes the builders to their endpoints.
	*/
	register () : void {
	  for (const i in this.builders) {
	    const item 	: BuilderConfig<T> = this.builders[i]
	    const endpoint : string = item.endpoint
	    const method 	: MethodsFunc = (item.method as Methods).toLowerCase() as MethodsFunc
	    const builder : Builder<T> = item.builder
	    if (method === 'list') {
	    	this.router.get(endpoint, ...builder.expose() as ((...args : any[])=>void)[])
	    } else if (method === 'post') {
	      this.router.post(endpoint, ...builder.expose() as ((...args : any[])=>void)[])
	    } else {
	      this.router[method]('/:id' + endpoint, ...builder.expose() as ((...args : any[])=>void)[])
	    }
	  }
	}

	/**
	* Constructs a new endpoint. Returns the builder.
	* @param endpoint name of the new endpoint
	* @param method HTTP method
	*/
	endpoint (endpoint : string, method: Methods) : Builder<T> {
	  const a : BuilderConfig<T> =
		{
		  builder: new Builder<T>(this.name),
		  method: method,
		  endpoint: endpoint
		}

	  this.builders.push(a)
	  return a.builder
	}

	/**
	* Returns the builder of an already defined endpoint in this route.
	* @param endpoint name of the endpoint
	* @param method HTTP method
	*/
	builder (endpoint: string, method: Methods) : Builder<T> {
	  const builder = this.builders.filter((x: BuilderConfig<T>) => x.endpoint === endpoint && x.method === method)[0]
	  assert(builder, 'Builder endpoint is not yet defined.')
	  return builder.builder
	}

	/**
	* Returns an express router.
	*/
	expose () : Router {
	  return this.router
	}

	/**
	 * Creates a new endpoint with predefined middlewares to create a new document. Returns the builder.
	 */
	create () : Builder<T> {
	  const builder : Builder<T> = this.endpoint('/', 'POST')

	  builder
		 .model(this.name)
		 .create()
		 .sanitize()
		 .assign()
		 .save()
		 .show()

	  return builder
	}

	/**
	 * Creates a new endpoint with predefined middlewares to update a new document. Returns the builder.
	 */
	update () : Builder<T> {
	  const builder : Builder<T> = this.endpoint('/', 'PUT')

	  builder
		 .model(this.name)
		 .read()
		 .sanitize()
		 .assign()
		 .save()
		 .show()

	  return builder
	}

	/**
	 * Creates a new endpoint with predefined middlewares to read a new document. Returns the builder.
	 */
	read () : Builder<T> {
	  const builder : Builder<T> = this.endpoint('/', 'GET')

	  builder
		 .model(this.name)
		 .read()
		 .show()

	  return builder
	}

	/**
	 * Creates a new endpoint with predefined middlewares to list a query. Returns the builder.
	 */
	list () : Builder<T> {
	  const builder : Builder<T> = this.endpoint('/', 'LIST')
	  builder
		 .model(this.name)
		 .param()
		 .list()
		 .present()
	  return builder
	}

	/**
	 * Creates a new endpoint with predefined middlewares to delete a new document. Returns the builder.
	 */
	delete () : Builder<T> {
	  const builder : Builder<T> = this.endpoint('/', 'DELETE')

	  builder
		 .model(this.name)
		 .read()
		 .remove()
		 .success()

	  return builder
	}

	/**
	 * Creates a new endpoint with predefined middlewares to execute a method of a document. Returns the builder.
	 * @param name Name of the method
	 * @param requestMethod Request method.
	 */
	method (name : string, requestMethod: 'GET' | 'PUT' | 'DELETE') : Builder<T> {
	  const builder : Builder<T> = this.endpoint('/do/' + name, requestMethod)

	  builder
		 .model(this.name)
		 .read()
		 .method(name)
		 .return()

	  return builder
	}

	/**
	 * Creates a new endpoint with predefined middlewares to execute a static method of a model. Returns the builder.
	 * @param name Name of the static method
	 * @param requestMethod Request method.
	 */
	static (name : string, requestMethod: 'LIST' | 'POST') : Builder<T> {
	  const builder : Builder<T> = this.endpoint('/do/' + name, requestMethod)

	  builder
		 .model(this.name)
		 .static(name)
		 .return()

	  return builder
	}
}

/**
 * Inserts the tent configuration middleware to an express router. Returns the router.
 */
export function RegisterRoute () : Router {
  const router = Router()

  router.use('/', Middlewares.initTent as any)
  return router
}
