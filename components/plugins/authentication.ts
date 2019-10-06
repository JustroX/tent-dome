/**
* @module AuthenticationPlugin
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

import { Methods } from '../route'
import { Tent } from '../../index'

import { NextFunction } from 'express'
import { Request, Response } from '../routes/builder'
import { buildSchema } from './authentication/utils'

import exjwt = require('express-jwt');
import assert = require('assert');

type Middleware = (req: Request, res: Response, next: NextFunction)=> (void | Promise<void>);

@Plugin({
  name: 'auth',
  dependencies: []
})
export class AuthenticationPlugin {
	/** All endpoints with no authentication */
	noAuth : { endpoint : string, method : Methods }[] = [];

	/** Allow non-authenticated user to access a certain enpoint */
	allow (endpoint : string, method: Methods) {
	  this.noAuth.push({
	    endpoint,
	    method
	  })
	}

	/** Allow non-authenticated user to access POST /  */
	create () {
	  this.allow('/', 'POST')
	}

	/** Allow non-authenticated user to access GET /  */
	read () {
	  this.allow('/', 'GET')
	}

	/** Allow non-authenticated user to access PUT /  */
	update () {
	  this.allow('/', 'PUT')
	}

	/** Allow non-authenticated user to access DELETE /  */
	delete () {
	  this.allow('/', 'DELETE')
	}

	/** Allow non-authenticated user to access LIST /  */
	list () {
	  this.allow('/', 'LIST')
	}

	/** Allow non-authenticated user to access a model method  */
	method (methodName : string, method: Methods) {
	  this.allow('/do/' + methodName, method)
	}

	/** Allow non-authenticated user to access a model static method  */
	static (methodName : string, method: Methods) {
	  this.allow('/do/' + methodName, method)
	}

	/** Middleware that returns `403` when non-authenticated users access the endpoint.  */
	failHandler (req : Request, res : Response) : void {
	  res.tent.apiError(403, 'Forbidden.')
	}

	/** Replaces default failHandler.  */
	onFail (mw : Middleware) {
	  (this.failHandler as any) = mw
	}

	/** Replaces default authMiddleware.  */
	onAuth (mw : Middleware) {
	  (this.authMiddleware as any) = mw
	}

	/** Middleware that blocks if user is unauthenticated */
	async authMiddleware (req : Request, res: Response, next : NextFunction) {
	  if ((req as any).user) {
	    next()
	  } else { return res.tent.apiError(403, 'Forbidden.') }
	}

	/** Blocks access of non-authenticated user in the current model */
	init () {
	  if (!this.model) throw new Error('No model is defined.')
	  const _this = this

	  const secret = Tent.get<string>('auth secret')
	  assert(secret, 'Please set global `auth secret` in the Tent configuration.')

	  const jwtMW = exjwt({ secret })

	    const userModelName = Tent.get<string>('auth user')
	  if (userModelName === this.model.name) { buildSchema() }

	  // Tent.app().use();

	    (this.authMiddleware as any).tag = 'auth'

	  for (const i in this.model.Routes.builders) {
	    const builderObj = this.model.Routes.builders[i]
	    const builder 	= builderObj.builder
	    const method = builderObj.method
	    const endpoint	= builderObj.endpoint

	    if (this.noAuth.filter((x : { method : Methods, endpoint : string }) => {
	      return (x.method === method && x.endpoint === endpoint)
	    }).length === 0) {
	      if (userModelName === this.model.name && method === 'POST' && (endpoint === '/login' || endpoint === '/signup')) { continue } else {
	        builder.pre('model', jwtMW)
	        builder.pre('model', function (err : Error, req : any, res: any, next: any) {
					    if (err.name === 'UnauthorizedError') {
					    	if (res.tent) { (_this.failHandler as any)(req, res, next) } else { res.status(403).send({ error: 'Unauthorized.', err: err.name }) }
					    } else { next(err) }
				    } as any)
	        builder.pre('model', this.authMiddleware)
	      }
	    }
	  }
	};
}

export interface AuthenticationPlugin extends PluginInterface{};
