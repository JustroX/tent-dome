/**
* @module AuthenticationPlugin
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
import { PluginInterface } from '../plugin';
import { Methods } from '../route';
import { NextFunction } from 'express';
import { Request, Response } from '../routes/builder';
declare type Middleware = (req: Request, res: Response, next: NextFunction) => (void | Promise<void>);
export declare class AuthenticationPlugin {
    /** All endpoints with no authentication */
    noAuth: {
        endpoint: string;
        method: Methods;
    }[];
    /** Allow non-authenticated user to access a certain enpoint */
    allow(endpoint: string, method: Methods): void;
    /** Allow non-authenticated user to access POST /  */
    create(): void;
    /** Allow non-authenticated user to access GET /  */
    read(): void;
    /** Allow non-authenticated user to access PUT /  */
    update(): void;
    /** Allow non-authenticated user to access DELETE /  */
    delete(): void;
    /** Allow non-authenticated user to access LIST /  */
    list(): void;
    /** Allow non-authenticated user to access a model method  */
    method(methodName: string, method: Methods): void;
    /** Allow non-authenticated user to access a model static method  */
    static(methodName: string, method: Methods): void;
    /** Middleware that returns `403` when non-authenticated users access the endpoint.  */
    failHandler(req: Request, res: Response): void;
    /** Replaces default failHandler.  */
    onFail(mw: Middleware): void;
    /** Replaces default authMiddleware.  */
    onAuth(mw: Middleware): void;
    /** Middleware that blocks if user is unauthenticated */
    authMiddleware(req: Request, res: Response, next: NextFunction): any;
    /** Blocks access of non-authenticated user in the current model */
    init(): void;
}
export interface AuthenticationPlugin extends PluginInterface {
}
export {};
