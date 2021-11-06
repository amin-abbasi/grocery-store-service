import Joi from 'joi'
import config from '../configs'
import { validate } from '../services/validator'

const objectId = Joi.string().regex(config.regex.objectId)

const exportResult = {

  // Create new Node
  create: validate({
    params: Joi.object({}),
    body: Joi.object({
      name: Joi.string().max(200).required().description('Node Name'),
      type: Joi.string().valid(...Object.keys(config.nodeTypes)).required().description('Node Type'),
      location:  Joi.string().max(200).description('Node Location'),
      parent:    objectId.description('Parent Node ID'),
      managedBy: Joi.string().max(200).description('Node Manager ID'),
    }),
    query: Joi.object({})
  }),

  // List All Nodes
  list: validate({
    params: Joi.object({}),
    query: Joi.object({
      size: Joi.number().default(10).description('Node List Pagination Size'),
      page: Joi.number().default(1).description('Node List Pagination Page'),
      name: Joi.string().max(200).description('Node Name'),
      dateRange: Joi.object({
        from: Joi.date().timestamp().description('Date Range From'),
        to:   Joi.date().timestamp().description('Date Range To'),
      }).or('from', 'to').description('Date Range'),
    })
  }),

  // Show Node Details
  details: validate({
    params: Joi.object({
      nodeId: objectId.required().description('Node ID'),
    }),
    query: Joi.object({})
  }),

  // Update Node
  update: validate({
    params: Joi.object({
      nodeId: objectId.required().description('Node ID'),
    }),
    body: Joi.object({
      name: Joi.string().max(200).description('Node Name'),
    }),
    query: Joi.object({})
  }),

  // Delete Node [Soft delete]
  delete: validate({
    params: Joi.object({
      nodeId: objectId.required().description('Node ID'),
    }),
    query: Joi.object({})
  }),

}

export default exportResult