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
import { Request, Response } from 'express';
import { Model } from '../model';
import { QueryParams } from './params';
import { Document as MongooseDocument, Model as MongooseModel } from 'mongoose';
/** Document */
export declare type Document<T> = MongooseDocument & Partial<T>;
/** Mongoose model interface */
export declare type Collection<T> = MongooseModel<Document<T>>;
/** Dictionary Interface */
interface Dictionary {
    [key: string]: any;
}
/** Accessor class. This would be binded to `req.tent` for the middlewares to access.
* @typeparam T Schema interface
*/
export declare class Accessor<T> {
    /** Express request object */
    res: Response;
    /** Express response object */
    req: Request;
    /** Tent Model */
    model: Model<T> | undefined;
    /** Model Document */
    document: Document<T> | undefined;
    /** Mongoose model */
    collection: Collection<T> | undefined;
    /** Payload. Value is undefined until Assign() is called */
    payload: Dictionary | undefined;
    /** List of Model Documents */
    list: Document<T>[] | undefined;
    /** Parsed url parameters. Value is undefined untial Param() is called */
    param: QueryParams | undefined;
    /** Scope reserved for plugins. */
    plugins: Dictionary;
    /** Returned value by `method` and `static` */
    returnVal: any;
    /** Scope reserved for reusable variables */
    vars: Dictionary;
    /**
    * Returns a new accessor instance.
    * @param req Express request
    * @param res Express response
    */
    constructor(req: Request, res: Response);
    /**
    * Assigns value for `Accessor.model` and `Accessor.collection`.
    * @param name Name of the model
    */
    Model(name: string): void;
    /**
    * Assigns value for `Accessor.payload`. Removes fields that are not defined in the schema.
    * @param body Request body
    */
    Sanitize(body: T): void;
    /**
    * Assigns `Accessor.payload` to `Accessor.document`.
    */
    Assign(): void;
    /**
    * Fetches the document with an `_id` of `id` from the database and assigns it in `Accessor.document`.
    * @param id _id of the document.
    */
    Read(id: string): Promise<void>;
    /**
    * Fetches the a query of Documents from the database and assigns them to `Accessor.list`.
    * @param id _id of the document.
    */
    List(): Promise<void>;
    /**
    * Save changes of `Accessor.document` to the database.
    */
    Save(): Promise<void>;
    /**
    * Deletes `Accessor.document` from the database.
    */
    Delete(): Promise<void>;
    /**
    * Parses request query and assigns them to `Accessor.param` .
    * @param params Req.query instance
    */
    Param(params: {
        [key: string]: string;
    }): void;
    /**
    * Assigns a new Mongoose Document at `Accessor.document` .
    */
    FreshDocument(): void;
    /**
    *  Returns `Accessor.list`
    */
    Present(): Document<T>[];
    /**
    *  Returns `Accessor.document`
    */
    Show(): Document<T>;
    /**
    * Runs method `name` and returns it at `req.tent.returnVal`
    * @param name Name of the method.
    */
    Method(name: string): Promise<void>;
    /**
    * Runs static `name` and returns it at `req.tent.returnVal`
    * @param name Name of the static.
    */
    Static(name: string): Promise<void>;
    /**
    * Returns the value of `req.tent.returnVal`
    */
    Return(): any;
}
/** Dispatcher class. This would be binded to `res.tent` for the middlewares to access.
*/
export declare class Dispatcher {
    /** Express request object */
    req: Request;
    /** Express response object */
    res: Response;
    constructor(req: Request, res: Response);
    /**
    * sends an error response to the client.
    */
    apiError(statusCode: any, error?: any, detail?: any): any;
}
export {};
