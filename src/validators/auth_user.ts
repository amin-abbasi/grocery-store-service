import Joi from 'joi'
import config from '../configs'
import { validate } from '../services/validator'

const objectId    = Joi.string().regex(config.regex.objectId)
const emailSchema = Joi.string().max(50).email().description('User Email')

const exportResult = {

  // Login User
  login: validate({
    params: Joi.object({}),
    body: Joi.object({
      email:    emailSchema.required(),
      password: Joi.string().min(6).max(32).required().description('User Password OR OTP Verify Code'),
      rememberMe: Joi.boolean().default(false).description('Auth Password Remember'),
    }),
    query: Joi.object({})
  }),

  // Logout User
  logout: validate({
    params: Joi.object({}),
    query: Joi.object({})
  }),

  // Refresh Users Access Token using Refresh Token
  refreshAccessToken: validate({
    params: Joi.object({}),
    query: Joi.object({})
  }),

  // Show User Details
  details: validate({
    params: Joi.object({
      username: Joi.string().lowercase().regex(config.regex.username).description('User Name'),
    }),
    query: Joi.object({})
  }),

  // Update User
  update: validate({
    body: Joi.object({
      fullName: Joi.string().max(100).allow('').description('User First Name'),
      gender:   Joi.string().valid(...Object.keys(config.genderTypes)).description('User Gender'),
    }),
    params: Joi.object({}),
    query: Joi.object({})
  }),

  // Change Password
  changePassword: validate({
    params: Joi.object({}),
    body: Joi.object({
      oldPassword: Joi.string().min(6).max(32).required().description('User New Password'),
      newPassword: Joi.string().min(6).max(32).required().description('User New Password'),
    }),
    query: Joi.object({})
  }),

}

export default exportResult
