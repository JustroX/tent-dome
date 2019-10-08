/**
* @module PermissionsPlugin
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

import { Plugin, PluginInterface, PluginClass } from '../plugin'
import { Methods } from '../route'
import { NextFunction } from 'express'
import { Request, Response } from '../routes/builder'
import { Tent } from '../../index'

import assert = require('assert');

/** Single endpoint item */
interface EndpointItem
{
	endpoint : string,
	method 	 : Methods,
	allow : string[]
}

/** Permission plugin. */
@Plugin({
  name: 'permission',
  dependencies: ['auth']
})
export class Permission implements PluginClass {
	/** Current endpoints and roles that will be allowed. */
	endpoints : { [ endpoint : string] : EndpointItem } = {};

	/**
	* Add an endpoint to authorization.
	* @param name Name of the endpoint.
	* @param method Request method ( GET | PUT | POST | DELETE | LIST )
	* @param role Role to be allowed.
	*/
	endpoint (name : string, method: Methods, role : string | string[]) {
	  if (typeof role === 'string') { role = [role] }

	  const identifier = name + '-' + method

	  if (identifier in this.endpoints) { this.endpoints[identifier].allow.push(...role) } else {
	    this.endpoints[identifier] =
			{
			  endpoint: name,
			  method: method,
			  allow: role
			}
	  }
	}

	/**
	* Add `POST /` to authorization.
	* @param role Role to be allowed.
	*/
	create (role : string | string[]) {
	  this.endpoint('/', 'POST', role)
	}

	/**
	* Add `GET /` to authorization.
	* @param role Role to be allowed.
	*/
	read (role : string | string[]) {
	  this.endpoint('/', 'GET', role)
	}

	/**
	* Add `PUT /` to authorization.
	* @param role Role to be allowed.
	*/
	update (role : string | string[]) {
	  this.endpoint('/', 'PUT', role)
	}

	/**
	* Add `DELETE /` to authorization.
	* @param role Role to be allowed.
	*/
	delete (role : string | string[]) {
	  this.endpoint('/', 'DELETE', role)
	}

	/**
	* Add `LIST /` to authorization.
	* @param role Role to be allowed.
	*/
	list (role : string | string[]) {
	  this.endpoint('/', 'LIST', role)
	}

	/**
	* Add `/do/{method}` to authorization.
	* @param methodName Name of the method.
	* @param requestMethod Request method ( GET | POST | PUT | DELETE | LIST )
	* @param role Roles to be allowed.
	*/
	method (methodName : string, requestMethod : Methods, role : string | string[]) {
	  this.endpoint('/do/' + methodName, requestMethod, role)
	}

	/**
	* Add `/do/{method}` to authorization.
	* @param methodName Name of the static.
	* @param requestMethod Request method ( GET | POST | PUT | DELETE | LIST )
	* @param role Roles to be allowed.
	*/
	static (methodName : string, requestMethod : Methods, role : string | string[]) {
	  this.endpoint('/do/' + methodName, requestMethod, role)
	}

	/**
	* Returns the permission middleware that will be added after `auth` middleware.
	*/
	permissionMiddlewareFactory (endpoint : string, method: Methods) {
	  const _this : Permission = this
	  const roleKey : string = Tent.get<string>('permission payload role')

	  const mw : any = function (req : Request, res: Response, next : NextFunction) {
	    if ('user' in req) {
	      const user : any = (req as any).user
	      if (!user[roleKey].length) user[roleKey] = [Tent.get<string>('permission bystander') || 'bystander']
	      const roles = _this.endpoints[endpoint + '-' + method].allow
						  .filter(x => user[roleKey].includes(x))

	      if (!roles.length) return res.tent.apiError(403, 'Permission Denied.')
	      next()
	    } else { return res.tent.apiError(403, 'Permission Denied.') }
	  }

	  mw.tag = 'permission'

	  return mw
	}

	/** Plugin Initialization */
	init () {
	  const role = Tent.get<string>('permission payload role')
	  assert(role, 'Please set `permission payload role` in Tent global variable.')

	  const userModel = Tent.get<string>('auth user')
	  if (this.model.name === userModel) {
	    const addRole = function (req: Request, res: Response, next: NextFunction) {
	      req.tent.document[role] = req.tent.vars.user.get(role)
	      next()
	    };
	    (addRole as any).tag = 'permissionPatch'

	    // add middlewares for token
	    this.model.Routes.builder('/login', 'POST').pre('tokenize', addRole)
	    this.model.Routes.builder('/signup', 'POST').pre('tokenize', addRole)
	  }

	  // get all roles
	  for (const i in this.endpoints) {
	    const endpoint = this.endpoints[i]

	    const name = endpoint.endpoint
	    const method = endpoint.method
	    const builder = this.model.Routes.builder(name, method)
	    builder.pre('model', this.permissionMiddlewareFactory(name, method))
	  }
	}
}

export interface Permission extends PluginInterface{};
