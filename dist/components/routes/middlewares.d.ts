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
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { Accessor, Dispatcher } from './accessor';
/** Express request with `.tent` property */
declare type Request<T> = ExpressRequest & {
    tent?: Accessor<T>;
};
/** Express response with `.tent` property */
declare type Response = ExpressResponse & {
    tent?: Dispatcher;
};
/** Collection of built-in middlewares. */
declare class Middleware {
    /** Middleware that initializes tent.
      * @param req Express request
      * @param res Express response
      * @param next Express next function
      * @typeparam T Schema interface of the model.
      */
    initTent<T>(req: Request<T>, res: Response, next: NextFunction): void;
    /** Returns a middleware that makes the Model available in the request object.
      * @param name Name of the tent model.
      */
    model<T>(name: string): (req: Request<T>, res: Response, next: NextFunction) => void;
    /** Returns a middleware that fetches a document from the database. The document id will be from `req.params.id` and will be saved at `req.tent.document`.
      * @typeparam T Schema interface of the model.
      */
    read<T>(): (req: Request<T>, res: Response, next: NextFunction) => Promise<any>;
    /** Returns a middleware that generates a new database document.
      * The new document is accessible via `req.tent.document`
      * @typeparam T Schema interface of the model.
      */
    create<T>(): (req: Request<T>, res: Response, next: NextFunction) => void;
    /** Returns a middleware that assigns `req.body` to `req.tent.payload` while removing the fields which were not defined in the schema of the model.
      * @typeparam T Schema interface of the model.
      */
    sanitize<T>(): (req: Request<T>, res: Response, next: NextFunction) => void;
    /** Returns a middleware that sets `req.tent.document` to `req.tent.payload`.
      * @typeparam T Schema interface of the model.
      */
    assign<T>(): (req: Request<T>, res: Response, next: NextFunction) => void;
    /** Returns a middleware that saves `req.tent.document` to the database.
      * @typeparam T Schema interface of the model.
      */
    save<T>(): (req: Request<T>, res: Response, next: NextFunction) => Promise<void>;
    /** Returns a middleware that removes `req.tent.document` from the database.
      * @typeparam T Schema interface of the model.
      */
    remove<T>(): (req: Request<T>, res: Response, next: NextFunction) => Promise<void>;
    /** Returns a middleware that would query `req.tent.param` from the database and assigns the result to `req.tent.list`.
      * @typeparam T Schema interface of the model.
      */
    list<T>(): (req: Request<T>, res: Response, next: NextFunction) => Promise<void>;
    /** Returns a middleware that would parse `req.query` into a tent-readable format and saves it at `req.tent.param`.
      * @typeparam T Schema interface of the model.
      */
    param<T>(): (req: Request<T>, res: Response, next: NextFunction) => void;
    /** Returns a middleware that would respond a status code of 200.
    * @typeparam T Schema interface of the model.
    */
    success<T>(): (req: Request<T>, res: Response) => void;
    /** Returns a middleware that would call `method` of the model.
    * @param name Name of the method.
    * @typeparam T Schema interface of the model.
    */
    method<T>(name: string): (req: Request<any>, res: Response, next: NextFunction) => Promise<void>;
    /** Returns a middleware that would call `static` of the model.
    * @param name Name of the static method.
    * @typeparam T Schema interface of the model.
    */
    static<T>(name: string): (req: Request<any>, res: Response, next: NextFunction) => Promise<void>;
    /** Returns a middleware that would respond a status code of 200 and `req.tent.document`
      * @typeparam T Schema interface of the model.
      */
    show<T>(): (req: Request<T>, res: Response) => import("express-serve-static-core").Response;
    /** Returns a middleware that would respond a status code of 200 and `req.tent.list`
      * @typeparam T Schema interface of the model.
      */
    present<T>(): (req: Request<T>, res: Response) => import("express-serve-static-core").Response;
    /** Returns a middleware that would respond a status code of 200 and `req.tent.returnVVal`
    * @typeparam T Schema interface of the model.
    */
    return<T>(): (req: Request<T>, res: Response) => import("express-serve-static-core").Response;
}
export declare var Middlewares: Middleware;
export {};
