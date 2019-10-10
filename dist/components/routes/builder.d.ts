/**
* ### Builder Module
* This module is used for intuitive construction of route enpoints via chaining middlewares
*
* Example:
*
* ```
* let builder = new Builder("Builder");
* builder
*    .parseBody()
*    .parseCookie()
*    .getDatabaseDocument()
*    .custom((req,res,next)=>
*    {
*      	console.log("Hello");
*      	next();
*    })
*    .userDefined1()
*    .userDefined2()
*    .success();
*
*
* let middlewares = builder.expose();
* ```
*
* @module Builder
*/
import { Accessor, Dispatcher } from './accessor';
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
export interface Request extends ExpressRequest {
    tent: Accessor<any>;
}
export interface Response extends ExpressResponse {
    tent: Dispatcher;
}
/** Builder options */
export interface BuilderOptions {
    'import builtin': boolean;
}
/** Middleware definition */
declare type Middleware = (req: Request, res: Response, next: NextFunction) => void;
/**
* Route endpoint builder. A class for intuitive construction of route enpoints by chaining middlewares.
*
* @typeparam T Schema interface.
*
*/
export declare class Builder<T> {
    /** Current middleware sequence */
    middlewares: (Middleware)[];
    /** Current head index */
    head: number;
    /** Name of the builder */
    name: string;
    /** Other middleware factories. */
    [key: string]: any;
    /** Dictionary for defined middleware factories */
    builds: {
        /** Middleware factory. Adds a middleware after the current head. Moves head by one. */
        [name: string]: (() => Builder<T>) & {
            tag?: string;
        };
    };
    /**
    * @param name Name of the builder.
    * @param options builder options.
    */
    constructor(name: string, options?: BuilderOptions);
    /**
    * Adds a custom middleware after the current head. Moves head by one.
    * @param mw Middleware to add.
    */
    custom(mw: Middleware): this;
    /**
    * Points head to another index.
    * @param index New head index.
    */
    pointHead(index: number): this;
    /**
    * Returns the current middleware pointed by the head.
    */
    lookHead(): Middleware;
    /**
    * Points head to the previous middleware.
    */
    prevHead(): this;
    /**
    * Points head to the next middleware.
    */
    nextHead(): this;
    /**
    * Replaces middleware on the head by another middleware.
    * @param mw Middlware to replace.
    */
    replaceHead(mw: Middleware): void;
    /**
    * Removes the last middleware on the sequence. Moves the head to the previous one if the head is pointing to the last element.
    */
    pop(): void;
    /**
    * Import built in middlewares.
    */
    importBuiltIn(): void;
    /**
    * Defines a reusable middleware inside the builder. Chainable middleware factory will be available once called.
    * @param name Name of the middleware
    * @param mw Middleware
    */
    define(name: string, mw: (...args: any[]) => Middleware): void;
    /**
    * Inserts a middleware before a reusable middleware.
    * @param name Name of the reusable middleware
    * @param mw Middleware
    */
    pre(name: string, mw: Middleware): void;
    /**
    * Inserts a middleware after a reusable middleware.
    * @param name Name of the reusable middleware
    * @param mw Middleware
    */
    post(name: string, mw: Middleware): void;
    /**
    * Returns the sequence of middlewares.
    */
    expose(): (Middleware)[];
}
export {};
