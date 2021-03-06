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

import { Tent } from '../../../index'

import { Model, get } from '../../model'
import { Request, Response } from '../../routes/builder'
import { Accessor, Collection } from '../../routes/accessor'
import { NextFunction } from 'express'

import bcrypt = require('bcrypt-nodejs');
import jwt = require('jsonwebtoken');
import Joi = require('@hapi/joi');
import assert = require('assert');

/** Authentication Validation Options */
interface AuthValidationOptions{
  emailPattern: RegExp,
  passwordPattern: RegExp,
  emailMin: number,
  emailMax: number,
  passwordMin: number,
  passwordMax: number
}

/** @hidden */
function isTentAvailable (tent: Accessor<any> | undefined) : tent is Accessor<any> {
  return tent !== undefined
}

/** @hidden */
function isTentCollectionAvailable (collection : Collection<any> | undefined) : collection is Collection<any> & { [ staticName : string ] : Function } {
  return collection !== undefined
}

/** @hidden */
export function buildSchema () {
  const userModelName 	= Tent.get<string>('auth user')
  const emailToken	 	= Tent.get<string>('auth email token')
  const passwordToken 	= Tent.get<string>('auth password token')
  const secret			= Tent.get<string>('auth secret')
  const options			= Tent.get<any>('auth jwt options')
  const isSignUp			= Tent.get<boolean>('auth signup')
  const activationToken		= Tent.get<string>('auth activation token')

  assert(userModelName, 'Please set global `auth user` in the Tent configuration. ')
  assert(emailToken, 'Please set global `auth email token` in the Tent configuration. ')
  assert(passwordToken, 'Please set global `auth password token` in the Tent configuration. ')
  assert(secret, 'Please set global `auth secret` in the Tent configuration. ')

  if (isSignUp) { assert(activationToken, 'Please set global `auth activation token` in the Tent configuration.') }

  const UserModel = get(userModelName)
  addValidPasswordMethod(UserModel)

  const validationMW = (req: Request, res: Response, next: NextFunction) => {
    const {
      emailPattern,
      emailMax,
      emailMin,

      passwordPattern,
      passwordMax,
      passwordMin
    } : Partial<AuthValidationOptions> =
     Tent.get<Partial<AuthValidationOptions>>('auth validation options') || {}

    // validation
    const raw : any = {}

    // for emails
    let emailValidator = Joi.string().required()
    if (emailMax) emailValidator = emailValidator.max(emailMax)
    if (emailMin) emailValidator = emailValidator.min(emailMin)
    if (emailPattern) emailValidator = emailValidator.regex(emailPattern)
    raw[emailToken] = emailValidator

    // for emails
    let passwordValidator = Joi.string().required()
    if (passwordMax) passwordValidator = passwordValidator.max(passwordMax)
    if (passwordMin) passwordValidator = passwordValidator.min(passwordMin)
    if (passwordPattern) passwordValidator = passwordValidator.regex(passwordPattern)
    raw[passwordToken] = passwordValidator

    const schema = Joi.object(raw)

    const { error } = schema.validate(req.body)
    if (error) {
      return res.tent.apiError(400, 'Validation failed.')
    }

    next()
  }

  const tokenizeMW = function (req: Request, res: Response, next: NextFunction) {
    const token = jwt.sign(req.tent.document, secret, options || { expiresIn: 129600 });
    (req.tent.document as any) = { token }
    next()
  };

  (tokenizeMW as any).tag = 'tokenize'

  UserModel.Routes.endpoint('/login', 'POST')
    .model(userModelName)
    .custom(validationMW)
    .custom(async (req: Request, res: Response, next: NextFunction) => {
      // Authentication

      const tent = req.tent
      const collection = tent.collection
      if (!isTentAvailable(tent)) throw new Error('Model is not yet called.')
      if (!isTentCollectionAvailable(collection)) throw new Error('Model is not yet called.')
      try {
        const user = await collection.findUser(req.body[emailToken])
        if (!user) return res.tent.apiError(401, 'User is non-existent.')

        tent.vars.user = user
        if (!user.validPassword(req.body[passwordToken])) { return res.tent.apiError(401, 'Password is incorrect.') }

        (req.tent.document as any) = { id: user.id, username: user[emailToken] }
        next()
      } catch (e) {
        res.tent.apiError(500, 'Something went wrong.')
        throw e
      }
    })
    .custom(tokenizeMW)
    .show()

  if (isSignUp) {
    UserModel.Routes.endpoint('/signup', 'POST')
      .model(userModelName)
      .custom(validationMW)
      .model(userModelName)
      .custom(async (req: Request, res: Response, next: NextFunction) => {
        // check if email is already taken
        const tent = req.tent
        const collection = tent.collection

        if (!isTentAvailable(tent)) throw new Error('Model is not yet called.')
        if (!isTentCollectionAvailable(collection)) throw new Error('Model is not yet called.')

        try {
          if (await collection.findUser(req.body[emailToken], true)) {
            return res.tent.apiError(409, 'User identifier is already taken.')
          } else { next() }
        } catch (e) {
          res.tent.apiError(500, 'Something went wrong.')
          throw e
        }
      })
      .custom(async (req: Request, res: Response, next: NextFunction) => {
        // Authentication
        const tent = req.tent
        const collection = tent.collection

        if (!isTentAvailable(tent)) throw new Error('Model is not yet called.')
        if (!isTentCollectionAvailable(collection)) throw new Error('Model is not yet called.')

        const Collection = collection
        const user = new Collection()
        user.set(activationToken,	false)
        user.set(emailToken, 		req.body[emailToken])
        user.setPassword(req.body[passwordToken])

        try {
          await user.save()
          tent.vars.user = user
        } catch (e) {
          res.tent.apiError(500, 'Something went wrong.')
          throw e
        }
        (req.tent.document as any) = { id: user.id, username: user[emailToken] }
        next()
      })
      .custom(tokenizeMW)
      .show()
  }
}

/** @hidden */
function addValidPasswordMethod (User : Model<any>) {
  const passwordToken = Tent.get<string>('auth password token')
  const activationToken = Tent.get<string>('auth activation token')
  const isSignUp = Tent.get<boolean>('auth signup')

  User.Schema.method('validPassword', function (this: any, password : string) {
    if (this[passwordToken] && password) { return bcrypt.compareSync(password, this[passwordToken]) }
	    return false
  })

  User.Schema.method('setPassword', function (this: any, password: string) {
    this[passwordToken] = bcrypt.hashSync(password, bcrypt.genSaltSync(8))
  })

  User.Schema.static('findUser', async function (this: any, email: string, activation ?: boolean) {
    const emailToken = Tent.get<string>('auth email token')
    const query : any = {}
    query[emailToken] 	 = email

    if (isSignUp || activation) { query[activationToken] = true }

    return (await (User.Schema.model as any).find(query))[0]
  })
}
