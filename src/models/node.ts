/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Document } from 'mongoose'
import Boom   from '@hapi/boom'
import config from '../configs'
import { mergeDeep } from '../services/methods'

export interface INode extends Document {
  name : string
  type : string
  createdBy  : string
  managedBy  : string
  location   : string
  children   : string[]
  parent     : string | null
  createdAt? : number
  updatedAt? : number
  deletedAt? : number
}

export interface INodeUpdate {
  type?      : INode['type']
  location?  : INode['location']
  children?  : INode['children']
  managedBy? : INode['managedBy']
}

// Add your own attributes in schema
const schema = new Schema({
  name: { type: Schema.Types.String, required: true, trim: true, unique: true },
  type: { type: Schema.Types.String, required: true, enum: Object.keys(config.nodeTypes) },
  createdBy: { type: Schema.Types.String, required: true },
  managedBy: { type: Schema.Types.String, required: true },
  location:  { type: Schema.Types.String, required: true, trim: true },
  children:  { type: [Schema.Types.ObjectId], default: [] },
  parent:    { type: Schema.Types.ObjectId, ref: 'node' },
  createdAt: { type: Schema.Types.Number },
  updatedAt: { type: Schema.Types.Number },
  deletedAt: { type: Schema.Types.Number, default: 0 },
})

// Apply the Unique Property Validator plugin to schema.
import uniqueV from 'mongoose-unique-validator'
schema.plugin(uniqueV, { type: 'mongoose-unique-validator' })

// Choose your own model name
const Node = mongoose.model<INode>('node', schema)

export async function init(data: INode): Promise<INode> {
  const nodeData = {
    ...data,
    createdAt : new Date().getTime()
  }

  // For the first Node in System
  const count = await Node.countDocuments()
  if(count === 0) {
    nodeData.createdBy = 'admin'
    nodeData.managedBy = 'admin'
    nodeData.parent = null
  }

  return await Node.create(nodeData)
}

export interface IQueryData {
  page: number
  size: number
  sortType: string
  deletedAt: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export async function listAll(): Promise<INode[]> {
  return await Node.find({ deletedAt: 0 })
}

export async function list(queryData: IQueryData): Promise<{ total: number, list: INode[] }> {
  const { page, size, sortType, ...query } = queryData
  const setSize: number = (size > config.maxPageSize) ? config.maxPageSize : size
  const sortBy = (sortType && sortType !== config.sortTypes.date) ? { [config.sortTypes[sortType]]: 1 } : { createdAt: -1 }

  if(query.dateRange) {
    query.createdAt = {}
    const { from, to }: { from: number, to: number } = query.dateRange
    if(from) query.createdAt['$gte'] = from
    if(to)   query.createdAt['$lte'] = to
    delete query.dateRange
  }
  if(query.name) query.name = { '$regex': query.name, '$options': 'i' }

  query.deletedAt = 0
  const total: number = await Node.countDocuments(query)
  const result: INode[] = await Node.find(query).limit(setSize).skip((page - 1) * setSize).sort(sortBy)

  return {
    total: total,
    list: result
  }
}

export async function getBulkByIDs(nodeIds: string[], mask: string): Promise<INode[]> {
  // if(!mask || mask === '') mask = config.masks.node.all
  const nodes: INode[] = await Node.find({ deletedAt: 0 }, mask).where('_id').in(nodeIds).exec()
  return nodes
}

export async function getBulkByNames(names: string[], mask: string): Promise<INode[]> {
  const nodes: INode[] = await Node.find({ deletedAt: 0 }, mask).where('name').in(names).exec()
  return nodes
}

export async function getByID(nodeId: string): Promise<INode> {
  const node: INode | null = await Node.findById(nodeId)
  if(!node || node.deletedAt !== 0) throw Boom.notFound('Node not found.')
  return node
}

export async function getByName(name: string): Promise<INode> {
  const node: INode | null = await Node.findOne({ name, deletedAt: 0 })
  if(!node || node.deletedAt !== 0) throw Boom.notFound('Node not found.')
  return node
}

export async function updateById(nodeId: string, data: INodeUpdate): Promise<INode> {
  const node: INode = await getByID(nodeId)
  const updatedNode: INode = mergeDeep(node, data) as INode
  return await Node.findByIdAndUpdate(nodeId, updatedNode, { new: true }) as INode
}

export async function archive(nodeId: string): Promise<INode> {
  const node: INode = await getByID(nodeId)
  return await Node.findByIdAndUpdate(node._id, { deletedAt: new Date().getTime() }, { new: true }) as INode
}

export async function remove(nodeId: string): Promise<{ ok?: number, n?: number } & { deletedCount?: number }> {
  return await Node.deleteOne({ _id: nodeId })
}

export async function restore(nodeId: string): Promise<INode> {
  await getByID(nodeId)
  return await Node.findByIdAndUpdate(nodeId, { deletedAt: 0 }, { new: true }) as INode
}
