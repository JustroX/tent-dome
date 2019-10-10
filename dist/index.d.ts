/**
* # Tent Framework
* This module contains functions and definitions needed to setup a tent app.
* @module Tent
*/
/// <reference types="express" />
/**
*
* Copyright (C) 2019  Justine Che T. Romero
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
********/
import { SchemaDefinition as Definition, Schema } from 'mongoose';
import { Model } from './components/model';
import { Server, HttpServerInterface } from './components/server';
import { SchemaConfig } from './components/schema';
import * as PluginModule from './components/plugin';
import * as RouteModule from './components/route';
import * as SanitationPluginModule from './components/plugins/sanitation';
import * as ValidationModule from './components/plugins/validation';
import * as AuthenticationModule from './components/plugins/authentication';
import * as PermissionModule from './components/plugins/permission';
/** Expose Plugin Class */
export declare var Plugin: typeof PluginModule.Plugin;
/** Expose Plugin Interface */
export interface PluginInterface extends PluginModule.PluginInterface {
}
/** Expose Route Class */
export declare var Route: typeof RouteModule.Routes;
export declare var Sanitation: typeof SanitationPluginModule.Sanitation;
export declare var Validation: typeof ValidationModule.Validation;
export declare var Authentication: typeof AuthenticationModule.AuthenticationPlugin;
export declare var Permission: typeof PermissionModule.Permission;
/** Expose mongoose types */
export declare var Types: typeof Schema.Types;
/**
* Configuration options for Tent
*/
export interface TentOptionsInterface {
    'api prefix'?: string;
    'mongodb uri'?: string;
    [key: string]: any;
}
/**
* Tent-Dome module.
*/
export declare class TentDome {
    /**
        Application Server
    */
    AppServer: Server;
    TentOptions: TentOptionsInterface;
    Models: Model<any>[];
    /** Tent Application Plugins */
    plugins: {
        [pluginName: string]: PluginInterface;
    };
    constructor();
    /**
    *  Initialize the app.
    * @param options  Tent application configuration.
    */
    init(options: TentOptionsInterface): void;
    /**
    * Sets the default options for the application.
    */
    setDefaultOptions(): void;
    /**
     * Sets an application variable
     * @param key  Variable name
     * @param value  Variable value
     */
    set<T>(key: string, value: T): void;
    /**
     * Get the value of an application variable
     *
     * @param key  Variable name
     */
    get<T>(key: string): T;
    /**
     *Creates a new database model entity.
     * @param name  Name of the entity.
     * @param schema  Mongoose schema of the model.
     * @param config  Mongoose model configuration.
     * @typeparam T Schema interface of the model.
     */
    Entity<T>(name: string, schema: Definition, config?: SchemaConfig): Model<T>;
    /**
    *Start the application
    *
    *@param port The port of the server.
    */
    start(port?: number): Promise<void>;
    /**
    * Returns the http server.
    */
    server(): HttpServerInterface;
    /**
    *Returns the express app.
    */
    app(): import("express").Application;
    /**
    * Installs a plugin globally.
    * @param plugin The plugin instance
    */
    install(plugin: any & PluginInterface): void;
    /**
    * Registers all global plugins and model routes. Add the express app on their scope.
    */
    register(): void;
}
export declare var Tent: TentDome;
