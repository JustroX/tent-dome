/**
*	@module Schema
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
import { Schema as MongooseSchema, Document, Model, SchemaDefinition as Definition } from 'mongoose';
/**
* Virtual field definition
* @typeparam T data type of the field
*/
interface VirtualInterface<T> {
    /** setter function of the virtual */
    set?: (value: T) => void;
    /** getter function of the virtual */
    get?: () => T;
    /** configuration for the virtuals  **/
    config?: {
        [key: string]: any;
    };
    [key: string]: any;
}
/**
* Dictionary interface for numerous virtual fields
*/
interface VirtualsStoreInterface {
    [key: string]: VirtualInterface<any>;
}
/**
* Options for Mongoose Schema
*/
export interface SchemaConfig {
    [key: string]: any;
}
/**
* Mongoose Schema Type definition
* @typeparam T plain type schema
*/
export declare type SchemaDefinition<T> = T & Document;
/** Dictionary for methods */
interface MethodStore {
    [key: string]: Function;
}
/**
* This is the Schema class which encapsulates the Mongoose business part of the model.
* @typeparam T Schema interface of the model
*/
export declare class Schema<T> {
    private name;
    schema: Definition;
    config: SchemaConfig;
    virtuals: VirtualsStoreInterface;
    methods: MethodStore;
    statics: MethodStore;
    model: Model<SchemaDefinition<T>> | undefined;
    mongooseSchema: MongooseSchema | undefined;
    /**
    * @param name The name of the model
    */
    constructor(name: string);
    /**
    * Define a Mongoose model.
    * @param schema Definition of the model. Mongoose schema
    * @param config Mongoose schema configuration.
    */
    define(schema: Definition, config?: SchemaConfig): void;
    /**
    * Defines a virtual field for the object
    * @param key name of the virtual field
    * @param virtual virtual field definition
    * @typeparam T data type of the virtual field
    */
    virtual<T>(key: string, virtual: VirtualInterface<T>): void;
    /**
    * Sets a schema configuration
    * @param key name of the configuration option
    * @param value value of the configuration option
    */
    set(key: string, value: any): void;
    /**
    * Returns the schema configuration
    * @param key name of the configuration option
    */
    get(key: string): any;
    /** Define a method. */
    method(name: string, func: Function): void;
    /** Define a static method. */
    static(name: string, func: Function): void;
    /**
    * Registers the schema. Creates a mongoose schema and mongoose model.
    */
    register(): void;
}
export {};
