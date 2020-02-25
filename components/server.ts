/**
* @module Server
* Tent Server
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

import { Server as HttpServer, createServer } 	from 'http'
import { Application } 	 from 'express'

import { Tent } from '../index'

import Mongoose = require('mongoose');

import Express = require('express');
import CookieParser = require('cookie-parser');
import BodyParser = require('body-parser');
import morgan = require('morgan');

var urlencodedParser = BodyParser.urlencoded({ extended: true })

export interface HttpServerInterface extends HttpServer {};

/**
*	This is the Server class that encapsulates database connection and the http server.
*/
export class Server {
	app : Application;
	server : HttpServer;

	constructor () {
	  this.app = Express()
	  this.server = createServer(this.app)

	  this.initDefaultMiddlewares()
	}

	/**
	*	Initializes default middlewares
	*/
	initDefaultMiddlewares () {
	  this.app.use(morgan('dev'))
	  this.app.use(urlencodedParser)
	  this.app.use(BodyParser.json(Tent.get('bodyparser options')))
	  this.app.use(CookieParser())
	}

	/**
	*	Connects App to the database
	*
	*	@param databaseURI URI of the database
	*/
	initDatabase (databaseURI : string) {
	  Mongoose.connect(databaseURI, { useNewUrlParser: true, useUnifiedTopology: true })
	}

	/**
	*	Start the Server
	*
	*	@param port Port to listen to
	*
	*/
	start (port ?: number) : Promise<void> {
	  return new Promise<void>(
	    (resolve, reject) => {
	    	try {
		      this.server.listen(port, () => {
		        resolve()
		      })
	    	} catch (err) {
	    		reject(err)
	    	}
	    })
	}

	/**
	*	Close the Server
	*/
	close () {
	  this.server.close()
	  Mongoose.connection.close()
	}
}
