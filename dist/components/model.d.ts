/**
* ### Model Module
* This module is the parent class of all entities for the tent app.
*
* @module Model
*/
import { SchemaDefinition } from 'mongoose';
import { Schema, SchemaConfig } from './schema';
import { Routes } from './route';
import { Expand } from './expand';
import { PluginInterface } from './plugin';
import { Application as ExpressApp } from 'express';
/**
* Dictionary interface for storing Models
*/
interface ModelStore<T> {
    [key: string]: Model<T>;
}
/**
* Dictionary for storing Models
*/
export declare var Models: ModelStore<any>;
/**
* Returns a specified Model.
* @param name  Name of the model
*/
export declare function get<T>(name: string): Model<T>;
/**
* Registers all the model to the express app.
* @param app  Express application
*/
export declare function RegisterModels(app: ExpressApp): void;
/**
* This is the Model class used for defining database entities.
* @typeparam T Schema interface of the model
*/
export declare class Model<T> {
    /**
    * Name of the model
    */
    name: string;
    /**
    * Pluralized name of the model.
    */
    dbname: string;
    /**
    * Schema of the Model.
    */
    Schema: Schema<T>;
    /**
    * Routes of the Model.
    */
    Routes: Routes<T>;
    /**
    * Expand definitions of the Model.
    */
    Expand: Expand;
    /**
    * Dictionary to store the plugins.
    */
    plugins: {
        [pluginName: string]: PluginInterface;
    };
    /**
    * @param name  name of the model
    */
    constructor(name: string);
    /**
    * Defines the model schema.
    * @param schema  Mongoose schema of the model.
    * @param config  Mongoose model configuration.
    */
    define(schema: SchemaDefinition, config?: SchemaConfig): void;
    /**
    * Registers the model
    */
    register(): void;
    /**
    * Installs a plugin.
    * @param plugin  Plugin to install.
    */
    install(plugin: any): void;
}
export {};
