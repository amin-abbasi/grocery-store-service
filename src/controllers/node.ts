/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express'
import Boom   from '@hapi/boom'
import config from '../configs'
import * as Node from '../models/node'
import { checkPermission } from '../services/methods'

const { manager } = config.roleTypes

const exportResult = {

  // Create new Node
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body: Node.INode = req.body, user = req.user
      const actorId = user ? user.id : 'admin'
      body.createdBy = actorId
      body.managedBy = actorId

      if(body.parent && user.role === manager) {
        const check = await checkPermission(user.id, body.parent)
        if(!check) throw Boom.forbidden('Manager can not create node outside his descendants.')
      }
      const node = await Node.init(body)
      res.result = node
      next(res)
    } catch (err) { next(err) }
  },

  // List all Node
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: Node.IQueryData = req.query as Node.IQueryData
      const role: string = req.user.role
      // if(role === employee)
      const result = await Node.list(query)
      res.result = result
      next(res)
    }
    catch (err) { next(err) }
  },

  // Show Node Profile
  async details(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const nodeId: string = req.params.nodeId
      const node = await Node.getByID(nodeId)
      res.result = node
      next(res)
    }
    catch (err) { next(err) }
  },

  // Update Node Profile
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const nodeId = req.params.nodeId, user = req.user
      const managerId: string = user ? user.id : 'admin'

      if(user.role === manager) {
        const check = await checkPermission(user.id, nodeId)
        if(!check) throw Boom.forbidden('Manager can not update node outside his descendants.')
      }

      const node = await Node.updateById(nodeId, req.body, managerId)
      res.result = node
      next(res)
    }
    catch (err) { next(err) }
  },

  // Delete Node [Soft delete]
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const nodeId: string = req.params.nodeId, user = req.user
      const managerId: string = user ? user.id : 'admin'

      if(user.role === manager) {
        const check = await checkPermission(user.id, nodeId)
        if(!check) throw Boom.forbidden('Manager can not delete node outside his descendants.')
      }

      const node = await Node.archive(nodeId, managerId)
      res.result = node
      next(res)
    }
    catch (err) { next(err) }
  },

}

export default exportResult