import { Request, Response, NextFunction } from 'express'
import Boom     from '@hapi/boom'
import config   from '../configs'
import * as JWT from './jwt'
import { IUserToken } from '../../types/express'

// Function to get header auth if there is any
export async function getToken(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authToken: string | undefined = req.headers.authorization?.split(' ')[1]
    if (!authToken || authToken === '') next()
    else {
      const user: false | IUserToken = await JWT.isValid(authToken, JWT.TokenTypes.ACCESS_TOKEN)
      if(user !== false) req.user = user
      next()
    }
  } catch (error) { next(error) }
}

// Function to set needed header auth
export async function checkToken(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authToken: string | undefined = req.headers.authorization?.split(' ')[1]
    if (!authToken || authToken === '') throw Boom.unauthorized('Invalid Token.')
    const user = await JWT.isValid(authToken, JWT.TokenTypes.ACCESS_TOKEN)
    if (!user) throw Boom.unauthorized('Invalid Token.')
    req.user = user as IUserToken
    next()
  } catch (error) { next(error) }
}

// Function to set needed header auth & check roles
export function checkRole(roles: string[]): (req: Request, _res: Response, next: NextFunction) => void {
  return async function (req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      // 1- Check Token
      const authToken: string | undefined = req.headers.authorization?.split(' ')[1]
      if (!authToken || authToken === '') throw Boom.unauthorized('Invalid Token.')
      const user = await JWT.isValid(authToken, JWT.TokenTypes.ACCESS_TOKEN)
      if (!user) throw Boom.unauthorized('Invalid Token.')
      req.user = user as IUserToken

      // 2- Check Role
      if (!roles.includes(user.role)) throw Boom.forbidden('User is not authorized.')

      next()
    } catch (error) { next(error) }
  }
}
