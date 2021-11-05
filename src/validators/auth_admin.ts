import Joi from 'joi'
import config from '../configs'
import { validate } from '../services/validator'

const objectId = Joi.string().regex(config.regex.objectId)
const roleSchema = Joi.string().valid(...Object.keys(config.roleTypes)).description('Role Type')
const emailSchema = Joi.string().max(50).email().description('User Email')
const genderSchema = Joi.string().valid(...Object.keys(config.genderTypes)).description('User Gender')

const exportResult = {

  // Login Super Admin
  login: validate({
    params: Joi.object({}),
    body: Joi.object({
      username: Joi.string().max(50).required().description('Admin UserName'),
      password: Joi.string().max(50).required().description('Admin Password'),
      rememberMe: Joi.boolean().default(false).description('Auth Password Remember'),
    }),
    query: Joi.object({})
  }),

  // Logout Super Admin
  logout: validate({
    params: Joi.object({}),
    body: Joi.object({}),
    query: Joi.object({})
  }),

  // Create new User
  create: validate({
    params: Joi.object({}),
    body: Joi.object({
      email:    emailSchema.required(),
      gender:   genderSchema.required(),
      password: Joi.string().min(6).max(32).required().description('User Password'),
      fullName: Joi.string().max(200).required().description('User Full Name'),
      role:     roleSchema.required(),
      nodeId:   objectId.required().description('Node ID'),
    }),
    query: Joi.object({})
  }),

  // List All Users
  list: validate({
    params: Joi.object({}),
    query: Joi.object({
      size:  Joi.number().default(10).description('User List Pagination Size'),
      page:  Joi.number().default(1).description('User List Pagination Page'),
      descendants: Joi.boolean().default(false).description('Flag to show descendants nodes users'),
      fullName:  Joi.string().max(100).description('User Full Name'),
      sortType:  Joi.string().valid(...Object.keys(config.sortTypes)).description('Sort Type'),
      dateRange: Joi.object({
        from: Joi.date().timestamp().description('Date Range From'),
        to:   Joi.date().timestamp().description('Date Range To'),
      }).or('from', 'to').description('Date Range'),
    })
  }),

  // Show User Details
  details: validate({
    params: Joi.object({
      userId: objectId.required().description('User ID'),
    }),
    query: Joi.object({})
  }),

  // Update User
  update: validate({
    params: Joi.object({
      userId: objectId.required().description('User ID'),
    }),
    body: Joi.object({
      fullName: Joi.string().max(100).description('User Full Name'),
      gender: genderSchema,
    }),
    query: Joi.object({})
  }),

  // Delete User [Soft delete]
  delete: validate({
    params: Joi.object({
      userId: objectId.required().description('User ID'),
    }),
    query: Joi.object({})
  }),

}

export default exportResult