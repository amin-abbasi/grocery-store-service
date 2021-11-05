/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express'
import Boom from '@hapi/boom'
import config from '../configs'
import * as JWT from '../services/jwt'
import * as User from '../models/user'
import { IUserToken } from '../../types/express'
import { comparePassword } from '../services/methods'

const exportResult = {

  // Login User
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body
      const user: User.IUser = await User.getByEmail(email)

      // Check Password
      const checked: boolean = comparePassword(password, user.password)
      if(!checked) throw Boom.unauthorized('Invalid username or password.')

      // Set JWT Access Token in Header & Refresh Token
      const tokenData = {
        id   : user._id as string,
        role : user.role,
        email,
      }
      const token: string = JWT.setToken(tokenData, false)
      const refreshToken: string = JWT.setRefreshToken(tokenData)
      res.header('authorization', token)
      res.header('refresh_token', refreshToken)

      const result = { ...(user as any) }
      delete result._doc.password
      res.result = result._doc
      next(res)
    } catch (err) { next(err) }
  },

  // Refresh Users Access Token using Refresh Token
  async refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      // Get and check Access Token
      const oldAccessToken = req.headers.authorization?.split(' ')[1]
      if(!oldAccessToken) throw Boom.unauthorized('Invalid Access Token.')
      const accessTokenDecoded: IUserToken = JWT.decode(oldAccessToken)
      if(!accessTokenDecoded) throw Boom.unauthorized('Invalid Access Token.')

      // Get and check Refresh Token
      const refreshToken: string = req.headers['refresh_token'] as string
      if(!refreshToken) throw Boom.unauthorized('Invalid Refresh Token.')
      const refreshTokenDecoded = await JWT.isValid(refreshToken, JWT.TokenTypes.REFRESH_TOKEN)
      if(!refreshTokenDecoded) throw Boom.unauthorized('Invalid Refresh Token.')

      // Check Validity of tokens
      if(refreshTokenDecoded.id !== accessTokenDecoded.id) throw Boom.unauthorized('Invalid Refresh/Access Token.')

      // Revoke/Blacklist Access Token
      JWT.block(oldAccessToken, JWT.TokenTypes.ACCESS_TOKEN)

      // Create new Access Token
      delete accessTokenDecoded.exp
      const newAccessToken: string = JWT.setToken(accessTokenDecoded, false)
      res.header('authorization', newAccessToken)

      res.result = { success: true }
      next(res)
    }
    catch (err) { next(err) }
  },

  // Logout User
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const duId: string = req.query.duId as string
      const authToken = req.headers.authorization?.split(' ')[1]
      const refreshToken: string = req.headers['refresh_token'] as string
      if(!refreshToken) throw Boom.unauthorized('Invalid Refresh Token')

      // Revoke/Blacklist Token
      JWT.block(authToken, JWT.TokenTypes.ACCESS_TOKEN)
      JWT.block(refreshToken, JWT.TokenTypes.REFRESH_TOKEN)

      res.result = { success: true }
      next(res)
    } catch (err) { next(err) }
  },

  // Show User Profile
  async details(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId: string = req.user.id
      const user: User.IUser = await User.getByID(userId)
      res.result = { ...(user as any)._doc }
      next(res)
    }
    catch (err) { next(err) }
  },

  // Update User Profile
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId: string = req.user.id
      const user: any = await User.updateById(userId, req.body)
      res.result = { ...user._doc }
      next(res)
    }
    catch (err) { next(err) }
  },

  // Change Password
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body
      const user = await User.getByID(req.user.id)

      // Get access token & refresh token from headers
      const authToken = req.headers.authorization?.split(' ')[1]
      const refreshToken: string = req.headers['refresh_token'] as string
      if(!refreshToken) throw Boom.badRequest('Refresh token is required.')

      await User.changePassword(user._id, oldPassword, newPassword)

      // Revoke/Blacklist Token to login again with new password
      JWT.block(authToken, JWT.TokenTypes.ACCESS_TOKEN)
      JWT.block(refreshToken, JWT.TokenTypes.REFRESH_TOKEN)

      res.result = { success: true }
      next(res)
    }
    catch (err) { next(err) }
  },

}

export default exportResult
