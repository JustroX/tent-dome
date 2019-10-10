/**
* @module Server
* Tent Server
*/
/// <reference types="node" />
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
import { Server as HttpServer } from 'http';
import { Application } from 'express';
export interface HttpServerInterface extends HttpServer {
}
/**
*	This is the Server class that encapsulates database connection and the http server.
*/
export declare class Server {
    app: Application;
    server: HttpServer;
    constructor();
    /**
    *	Initializes default middlewares
    */
    initDefaultMiddlewares(): void;
    /**
    *	Connects App to the database
    *
    *	@param databaseURI URI of the database
    */
    initDatabase(databaseURI: string): void;
    /**
    *	Start the Server
    *
    *	@param port Port to listen to
    *
    */
    start(port?: number): Promise<void>;
    /**
    *	Close the Server
    */
    close(): void;
}
