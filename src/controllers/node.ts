/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express'
import Boom   from '@hapi/boom'
import config from '../configs'
import * as Node from '../models/node'

const { admin, employee, manager } = config.roleTypes

const exportResult = {

  // Create new Node
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body: Node.INode = req.body
      body.createdBy = req.user ? req.user.id : 'admin'
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
      const node: any = await Node.getByID(nodeId)
      res.result = { ...node._doc }
      next(res)
    }
    catch (err) { next(err) }
  },

  // Update Node Profile
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const nodeId = req.params.nodeId
      const node: any = await Node.updateById(nodeId, req.body)
      res.result = { ...node._doc }
      next(res)
    }
    catch (err) { next(err) }
  },

  // Delete Node [Soft delete]
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const nodeId: string = req.params.nodeId
      const node: any = await Node.archive(nodeId)
      res.result = node._doc
      next(res)
    }
    catch (err) { next(err) }
  },

}

export default exportResult