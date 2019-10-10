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
import { PluginInterface, PluginClass } from '../plugin';
import { Methods } from '../route';
/** Single endpoint item */
interface EndpointItem {
    endpoint: string;
    method: Methods;
    allow: string[];
}
/** Permission plugin. */
export declare class Permission implements PluginClass {
    /** Current endpoints and roles that will be allowed. */
    endpoints: {
        [endpoint: string]: EndpointItem;
    };
    /**
    * Add an endpoint to authorization.
    * @param name Name of the endpoint.
    * @param method Request method ( GET | PUT | POST | DELETE | LIST )
    * @param role Role to be allowed.
    */
    endpoint(name: string, method: Methods, role: string | string[]): void;
    /**
    * Add `POST /` to authorization.
    * @param role Role to be allowed.
    */
    create(role: string | string[]): void;
    /**
    * Add `GET /` to authorization.
    * @param role Role to be allowed.
    */
    read(role: string | string[]): void;
    /**
    * Add `PUT /` to authorization.
    * @param role Role to be allowed.
    */
    update(role: string | string[]): void;
    /**
    * Add `DELETE /` to authorization.
    * @param role Role to be allowed.
    */
    delete(role: string | string[]): void;
    /**
    * Add `LIST /` to authorization.
    * @param role Role to be allowed.
    */
    list(role: string | string[]): void;
    /**
    * Add `/do/{method}` to authorization.
    * @param methodName Name of the method.
    * @param requestMethod Request method ( GET | POST | PUT | DELETE | LIST )
    * @param role Roles to be allowed.
    */
    method(methodName: string, requestMethod: Methods, role: string | string[]): void;
    /**
    * Add `/do/{method}` to authorization.
    * @param methodName Name of the static.
    * @param requestMethod Request method ( GET | POST | PUT | DELETE | LIST )
    * @param role Roles to be allowed.
    */
    static(methodName: string, requestMethod: Methods, role: string | string[]): void;
    /**
    * Returns the permission middleware that will be added after `auth` middleware.
    */
    permissionMiddlewareFactory(endpoint: string, method: Methods): any;
    /** Plugin Initialization */
    init(): void;
}
export interface Permission extends PluginInterface {
}
export {};
