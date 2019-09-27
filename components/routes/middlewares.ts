/**
* @module Middlewares
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

import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express'
import { Accessor, Dispatcher } from './accessor'
import Assert = require('assert');

/** Express request with `.tent` property */
type Request<T> = ExpressRequest & {tent ?: Accessor<T>};

/** Express response with `.tent` property */
type Response = ExpressResponse & {tent ?: Dispatcher};

/** Collection of built-in middlewares. */
class Middleware {
  /** Middleware that initializes tent.
	* @param req Express request
	* @param res Express response
	* @param next Express next function
	* @typeparam T Schema interface of the model.
	*/
  initTent<T> (req : Request<T>, res : Response, next : NextFunction) {
    req.tent = new Accessor<T>(req, res)
    res.tent = new Dispatcher(req, res)
    next()
  }

  /** Returns a middleware that makes the Model available in the request object.
	* @param name Name of the tent model.
	*/
  model<T> (name : string) {
    return function modelMiddleware (req : Request<T>, res : Response, next : NextFunction) {
      (req.tent as Accessor<T>).Model(name)
      next()
    }
  }

  /** Returns a middleware that fetches a document from the database. The document id will be from `req.params.id` and will be saved at `req.tent.document`.
	* @typeparam T Schema interface of the model.
	*/
  read<T> () {
    return async function readMiddleware (req : Request<T>, res : Response, next : NextFunction) {
      Assert(req.params.id, 'Id parameter is missing.')

      try {
        await (req.tent as Accessor<T>).Read(req.params.id)
      } catch (e) {
        if (e.name === 'AssertionError' || e.name === 'CastError') { return (res.tent as Dispatcher).apiError(404, 'Document not found') }
        throw e
      }

      next()
    }
  }

  /** Returns a middleware that generates a new database document.
	* The new document is accessible via `req.tent.document`
	* @typeparam T Schema interface of the model.
	*/
  create<T> () {
    return function createMiddleware (req : Request<T>, res : Response, next : NextFunction) {
      Assert((req.tent as Accessor<T>).collection, "'create' middleware can not be called without calling 'model' middleware first.");
      (req.tent as Accessor<T>).FreshDocument()
      next()
    }
  }

  /** Returns a middleware that assigns `req.body` to `req.tent.payload` while removing the fields which were not defined in the schema of the model.
	* @typeparam T Schema interface of the model.
	*/
  sanitize<T> () {
    return function sanitizeMiddleware (req : Request<T>, res : Response, next : NextFunction) {
      Assert((req.tent as Accessor<T>).collection, "'sanitize' middleware can not be called without calling 'model' middleware first.")
      Assert((req.tent as Accessor<T>).document, "'sanitize' middleware can not be called without calling 'create' or 'read' middleware first.");

      (req.tent as Accessor<T>).Sanitize(req.body)

      next()
    }
  }

  /** Returns a middleware that sets `req.tent.document` to `req.tent.payload`.
	* @typeparam T Schema interface of the model.
	*/
  assign<T> () {
    return function assignMiddleware (req : Request<T>, res : Response, next : NextFunction) {
      Assert((req.tent as Accessor<T>).collection, "'assign' middleware can not be called without calling 'model' middleware first.")
      Assert((req.tent as Accessor<T>).document, "'assign' middleware can not be called without calling 'create' or 'read' middleware first.")
      Assert((req.tent as Accessor<T>).payload, "'assign' middleware can not be called without calling 'sanitize' middleware first.");

      (req.tent as Accessor<T>).Assign()

      next()
    }
  }

  /** Returns a middleware that saves `req.tent.document` to the database.
	* @typeparam T Schema interface of the model.
	*/
  save<T> () {
    return async function saveMiddleware (req : Request<T>, res : Response, next : NextFunction) {
      Assert((req.tent as Accessor<T>).collection, "'save' middleware can not be called without calling 'model' middleware first.")
      Assert((req.tent as Accessor<T>).document, "'save' middleware can not be called without calling 'create' or 'read' middleware first.")

      await (req.tent as Accessor<T>).Save()
      next()
    }
  }

  /** Returns a middleware that removes `req.tent.document` from the database.
	* @typeparam T Schema interface of the model.
	*/
  remove<T> () {
    return async function removeMiddleware (req : Request<T>, res : Response, next: NextFunction) {
      Assert((req.tent as Accessor<T>).collection, "'remove' middleware can not be called without calling 'model' middleware first.")
      Assert((req.tent as Accessor<T>).document, "'remove' middleware can not be called without calling 'read' middleware first.")

      await (req.tent as Accessor<T>).Delete()
      next()
    }
  }

  /** Returns a middleware that would query `req.tent.param` from the database and assigns the result to `req.tent.list`.
	* @typeparam T Schema interface of the model.
	*/
  list<T> () {
    return async function listMiddleware (req : Request<T>, res : Response, next : NextFunction) {
      Assert((req.tent as Accessor<T>).collection, "'list' middleware can not be called without calling 'model' middleware first.")
      Assert((req.tent as Accessor<T>).param, "'list' middleware can not be called without calling 'param' middleware first.")
      await (req.tent as Accessor<T>).List()
      next()
    }
  }

  /** Returns a middleware that would parse `req.query` into a tent-readable format and saves it at `req.tent.param`.
	* @typeparam T Schema interface of the model.
	*/
  param<T> () {
    return function paramMiddleware (req : Request<T>, res : Response, next : NextFunction) {
      (req.tent as Accessor<T>).Param(req.query)
      next()
    }
  }

  /** Returns a middleware that would respond a status code of 200.
	* @typeparam T Schema interface of the model.
	*/
  success<T> () {
    return function successMiddleware (req : Request<T>, res : Response) {
      res.status(200).send({
        message: 'Success',
        code: 200
      })
    }
  }

  /** Returns a middleware that would respond a status code of 200 and `req.tent.document`
	* @typeparam T Schema interface of the model.
	*/
  show<T> () {
    return function showMiddleware (req : Request<T>, res : Response) {
      Assert((req.tent as Accessor<T>).document, "'show' middleware can not be called without calling 'read' or 'create' middleware first.")
      return res.status(200).send(
        (req.tent as Accessor<T>).Show()
      )
    }
  }

  /** Returns a middleware that would respond a status code of 200 and `req.tent.list`
	* @typeparam T Schema interface of the model.
	*/
  present<T> () {
    return function presentMiddleware (req : Request<T>, res : Response) {
      return res.status(200).send(
        (req.tent as Accessor<T>).Present()
      )
    }
  }
}

export var Middlewares = new Middleware()
