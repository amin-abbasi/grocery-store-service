/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express'
import Boom   from '@hapi/boom'
import bcrypt from 'bcrypt'
import config from '../configs'
import { checkPermission } from '../services/methods'

import * as JWT  from '../services/jwt'
import * as User from '../models/user'

const { admin, employee, manager } = config.roleTypes

const exportResult = {

  // Login Admin
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password, rememberMe } = req.body
      if(!(config.env.ADMIN_PASS && config.env.ADMIN_USER))
        throw Boom.expectationFailed('Admin Credentials Issue.')
      const checkUserName: boolean = username === config.env.ADMIN_USER
      const checked: boolean = bcrypt.compareSync(password, config.env.ADMIN_PASS)
      if(!checked || !checkUserName) throw Boom.notFound('Invalid username or password.')

      // Set JWT Token in Header
      const tokenData = {
        id   : username,
        role : admin,
      }
      res.header('authorization', JWT.setToken(tokenData, rememberMe))

      res.result = { success: true }
      next(res)
    } catch (err) { next(err) }
  },

  // Logout Admin
  logout(req: Request, res: Response, next: NextFunction): void {
    try {
      const authToken = req.headers.authorization?.split(' ')[1]

      // Revoke/Blacklist Token
      JWT.block(authToken, JWT.TokenTypes.ACCESS_TOKEN)

      res.result = { success: true }
      next(res)
    } catch (err) { next(err) }
  },

  // Create new User
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body: User.IUser = req.body
      const creator = req.user
      if(creator.role === manager) {
        const isOK = await checkPermission(creator.id, body.nodeId)
        if(!isOK) throw Boom.forbidden('Manager can not add new user to given node.')
      }
      const user: any = await User.init(body)
      delete user._doc.password
      res.result = user._doc
      next(res)
    } catch (err) { next(err) }
  },

  // List all User
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: User.IQueryData = req.query as User.IQueryData
      const userId: string | undefined = (req.user.role === employee) ? req.user.id : undefined
      const result = await User.list(query, userId)
      res.result = result
      next(res)
    }
    catch (err) { next(err) }
  },

  // Show User Profile
  async details(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId: string = req.params.userId
      const user: any = await User.getByID(userId)
      res.result = { ...user._doc }
      next(res)
    }
    catch (err) { next(err) }
  },

  // Update User Profile
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId
      const user: any = await User.updateById(userId, req.body)
      res.result = { ...user._doc }
      next(res)
    }
    catch (err) { next(err) }
  },

  // Delete User [Soft delete]
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId: string = req.params.userId
      const user: any = await User.archive(userId)
      res.result = user._doc
      next(res)
    }
    catch (err) { next(err) }
  },

}

export default exportResult