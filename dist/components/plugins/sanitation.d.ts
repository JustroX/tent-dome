/**
* ## Sanitation Plugin
*
* This plugin will attach middlewares that would whitelist / blacklist inbound and outbound data of a `Model`.
*
* ### Definition
* - **Inbound Data**  - this is the request body for `PUT` and `POST` - `req.body`
* - **Outbound Data** - this is the `req.tent.document` and `req.tent.list` before `present` or `show` middleware is called.
*
* ### Motivation
* Sanitize requests so users can't alter model fields that are readonly for `user`.
* Also, sanitize responses so users can't read sensitive information.
*
* ### Installation
* Sanitation module comes prebuilt to tent.
*
* ```js
* import { Sanitation } from "tent-dome";
*
* var BooksEntity = tent.Entity("Book",{
* 	name 		  	 : String,
* 	date 		 	 : { type: Date, default: Date.now },
* 	writeonlyField   : String,
* 	readonlyField    : String
* });
* BooksEntity.install(new Sanitation());
*
* ```
*
* ### Usage
*
* Define access rules.
* ```js
*
* 	var rules = BooksEntity.plugins.sanitation;
* 	rules.inbound.blacklist("readonlyField");
* 	rules.outbound.whitelist(["readonlyField", "name", "date"]);
*
* ```
*
* @module SanitationPlugin
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
import { Accessor } from '../routes/accessor';
import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { Model } from '../model';
interface Request extends ExpressRequest {
    tent?: Accessor<any>;
}
declare class Bound<T> {
    whitelisted: (keyof T)[];
    blacklisted: (keyof T)[];
    whitelist(field: (keyof T) | (keyof T)[]): void;
    blacklist(field: (keyof T) | (keyof T)[]): void;
}
export declare class Sanitation<T> {
    inbound: Bound<T>;
    outbound: Bound<T>;
    model?: Model<T>;
    constructor();
    init(): void;
    inboundMiddleware(): (req: Request, res: Response, next: NextFunction) => void;
    outboundMiddleware(): (req: Request, res: Response, next: NextFunction) => void;
}
export interface Sanitation<T> extends PluginInterface {
}
export {};
