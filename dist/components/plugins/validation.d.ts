/**
* @module ValidationPlugin
*/
import { Accessor, Dispatcher } from '../routes/accessor';
import { Model } from '../model';
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import Joi = require('@hapi/joi');
interface Request extends ExpressRequest {
    tent: Accessor<any>;
}
interface Response extends ExpressResponse {
    tent: Dispatcher;
}
declare type Middleware = (req: Request, res: Response, next: NextFunction) => (void | Promise<void>);
/**
* Utility function for chainable constraints definition
*/
export declare class ConstraintUtility {
    /** Validation reference */
    parent: Validation;
    /**
    * @param parent Validation instance
    */
    constructor(parent: Validation);
    /**
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    and(...args: (string | ConstraintOptions)[]): void;
    /**
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    nand(...args: (string | ConstraintOptions)[]): void;
    /**
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    or(...args: (string | ConstraintOptions)[]): void;
    /**
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    oxor(...args: (string | ConstraintOptions)[]): void;
    /**
    * @param field field to have the relation.
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    with(field: string, ...args: (string[] | string | ConstraintOptions)[]): void;
    /**
    * @param field field to have the relation.
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    without(field: string, ...args: (string | ConstraintOptions)[]): void;
    /**
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    xor(...args: (string | ConstraintOptions)[]): void;
}
/**
* Validation Plugin
* This adds validation middleware on `POST` and `PUT`
*/
export declare class Validation {
    /** Joi reference. */
    joi: typeof Joi;
    /** Validation schema. */
    definition: Definition;
    /** Validation contraints */
    constraints: Constraint;
    /** Defines the validation Schema. */
    schema(schema: Definition): ConstraintUtility;
    /** Validation middleware factory. This will be called on init. */
    validationMiddleware(): Middleware;
    /** This function will replace the current `onFailMiddlewareFactory` by the parameter. */
    onFail(mw: () => Middleware): void;
    /** Default on fail middleware factory */
    onFailMiddlewareFactory(): Middleware;
    /** Plugin initialization */
    init(): void;
}
/**
* Definition interface for Joi schema.
*/
interface Definition {
    /**
    * Field defintion of schema
    */
    [key: string]: Joi.AnySchema;
}
/**
* Interface for constraint options.
*/
interface ConstraintOptions {
    separator?: boolean;
}
/**
* Interface for mutual constraints (many-to-many)
*/
interface MutualConstraint {
    peers: string[][];
    options: ConstraintOptions;
}
/**
*	Interface for single constraint one to many
*/
interface SingleConstraint {
    [key: string]: {
        peers: string[];
        options: ConstraintOptions;
    };
}
/**
* Interface for peer constraints of the schema
*/
interface Constraint {
    and: MutualConstraint;
    nand: MutualConstraint;
    or: MutualConstraint;
    oxor: MutualConstraint;
    xor: MutualConstraint;
    with: SingleConstraint;
    without: SingleConstraint;
}
/**
* Merged Declaration for Validation Plugin
*/
export interface Validation {
    name: string;
    dependencies: string[];
    model: Model<any>;
}
export {};
